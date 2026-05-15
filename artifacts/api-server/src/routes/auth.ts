import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, sessionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { generateOtp, getRiskLevelFromScore } from "../lib/trust-engine";
import { randomBytes, createHash } from "crypto";

const router = Router();

function hashPassword(password: string): string {
  return createHash("sha256").update(password + "trustflow_salt").digest("hex");
}

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

// POST /api/auth/login
router.post("/auth/login", async (req, res) => {
  const { username, password, deviceFingerprint, ipAddress } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username));

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const passwordHash = hashPassword(password);
  if (user.passwordHash !== passwordHash) {
    await db.update(usersTable).set({ loginAttempts: user.loginAttempts + 1 }).where(eq(usersTable.id, user.id));
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Determine initial risk based on device/location
  const isNewDevice = deviceFingerprint ? user.deviceFingerprint !== deviceFingerprint : false;
  const initialScore = isNewDevice ? 40 : 15;
  const riskLevel = getRiskLevelFromScore(initialScore);

  const sessionToken = generateToken();
  const otpCode = generateOtp();
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  const [session] = await db.insert(sessionsTable).values({
    userId: user.id,
    sessionToken,
    trustScore: initialScore,
    riskLevel,
    ipAddress: ipAddress ?? req.ip ?? "127.0.0.1",
    location: "New York, US",
    device: "Chrome on Windows",
    deviceFingerprint: deviceFingerprint ?? null,
    isActive: initialScore <= 85,
    isSuspicious: isNewDevice,
    otpCode,
    otpExpiry,
    loginTime: new Date(),
    lastActivity: new Date(),
  }).returning();

  await db.update(usersTable).set({
    lastLogin: new Date(),
    loginAttempts: 0,
    trustScore: initialScore,
    riskLevel,
  }).where(eq(usersTable.id, user.id));

  // If medium risk or higher, require OTP
  if (initialScore > 30) {
    return res.json({
      status: "otp_required",
      sessionToken: session.sessionToken,
      message: `OTP sent to registered email. Code: ${otpCode} (demo mode)`,
      userId: user.id,
      username: user.username,
      riskLevel,
    });
  }

  return res.json({
    status: "success",
    sessionToken: session.sessionToken,
    message: "Login successful",
    userId: user.id,
    username: user.username,
    riskLevel,
  });
});

// POST /api/auth/otp/verify
router.post("/auth/otp/verify", async (req, res) => {
  const { sessionToken, otp } = req.body;

  if (!sessionToken || !otp) {
    return res.status(400).json({ error: "Session token and OTP are required" });
  }

  const [session] = await db.select().from(sessionsTable).where(eq(sessionsTable.sessionToken, sessionToken));

  if (!session) {
    return res.status(401).json({ error: "Invalid session" });
  }

  if (!session.otpCode || session.otpCode !== otp) {
    return res.status(401).json({ error: "Invalid OTP code" });
  }

  if (session.otpExpiry && new Date() > session.otpExpiry) {
    return res.status(401).json({ error: "OTP has expired" });
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, session.userId));

  // Clear OTP after successful verification
  await db.update(sessionsTable).set({ otpCode: null, otpExpiry: null }).where(eq(sessionsTable.id, session.id));

  return res.json({
    userId: user.id,
    username: user.username,
    sessionToken: session.sessionToken,
    trustScore: session.trustScore,
    riskLevel: session.riskLevel,
    deviceFingerprint: session.deviceFingerprint,
    ipAddress: session.ipAddress,
    loginTime: session.loginTime.toISOString(),
    isAuthenticated: true,
  });
});

// GET /api/auth/session
router.get("/auth/session", async (req, res) => {
  const sessionToken = req.headers.authorization?.replace("Bearer ", "") ?? req.query.token as string;

  if (!sessionToken) {
    return res.status(401).json({ error: "No session token provided" });
  }

  const [session] = await db.select().from(sessionsTable).where(
    and(eq(sessionsTable.sessionToken, sessionToken), eq(sessionsTable.isActive, true))
  );

  if (!session) {
    return res.status(401).json({ error: "Invalid or expired session" });
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, session.userId));

  return res.json({
    userId: user.id,
    username: user.username,
    sessionToken: session.sessionToken,
    trustScore: session.trustScore,
    riskLevel: session.riskLevel,
    deviceFingerprint: session.deviceFingerprint,
    ipAddress: session.ipAddress,
    loginTime: session.loginTime.toISOString(),
    isAuthenticated: true,
  });
});

// POST /api/auth/logout
router.post("/auth/logout", async (req, res) => {
  const sessionToken = req.headers.authorization?.replace("Bearer ", "") ?? req.body.sessionToken;

  if (sessionToken) {
    await db.update(sessionsTable).set({ isActive: false }).where(eq(sessionsTable.sessionToken, sessionToken));
  }

  return res.json({ success: true, message: "Logged out successfully" });
});

export default router;
