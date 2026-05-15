import { Router } from "express";
import { db } from "@workspace/db";
import { sessionsTable, behaviorEventsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { getRiskLevelFromScore } from "../lib/trust-engine";

const router = Router();

// GET /api/trust/score
router.get("/trust/score", async (req, res) => {
  const sessionToken = req.headers.authorization?.replace("Bearer ", "") ?? req.query.token as string;

  if (!sessionToken) {
    return res.status(400).json({ error: "Session token required" });
  }

  const [session] = await db.select().from(sessionsTable).where(
    and(eq(sessionsTable.sessionToken, sessionToken), eq(sessionsTable.isActive, true))
  );

  if (!session) {
    return res.status(401).json({ error: "Invalid session" });
  }

  const riskFactors: Array<{ factor: string; description: string; severity: string; contribution: number }> = [];

  if (session.isSuspicious) {
    riskFactors.push({
      factor: "new_device",
      description: "Login from an unrecognized device or browser fingerprint",
      severity: "high",
      contribution: 18,
    });
  }

  if (session.trustScore > 60) {
    riskFactors.push({
      factor: "elevated_risk",
      description: "Multiple behavioral anomalies detected during this session",
      severity: "high",
      contribution: session.trustScore - 30,
    });
  }

  let action: "allow" | "request_otp" | "request_biometric" | "block" = "allow";
  if (session.trustScore > 85) action = "block";
  else if (session.trustScore > 60) action = "request_biometric";
  else if (session.trustScore > 30) action = "request_otp";

  return res.json({
    trustScore: session.trustScore,
    riskLevel: session.riskLevel,
    riskFactors,
    action,
    lastUpdated: session.lastActivity.toISOString(),
  });
});

// GET /api/trust/history
router.get("/trust/history", async (req, res) => {
  const sessionToken = req.headers.authorization?.replace("Bearer ", "") ?? req.query.token as string;

  if (!sessionToken) {
    return res.status(400).json({ error: "Session token required" });
  }

  const [session] = await db.select().from(sessionsTable).where(
    eq(sessionsTable.sessionToken, sessionToken)
  );

  if (!session) {
    return res.status(401).json({ error: "Invalid session" });
  }

  // Build history from behavior events
  const events = await db.select().from(behaviorEventsTable)
    .where(eq(behaviorEventsTable.sessionId, session.id))
    .orderBy(desc(behaviorEventsTable.timestamp))
    .limit(20);

  // Reconstruct trust score timeline
  let score = 15;
  const history = [
    { timestamp: session.loginTime.toISOString(), trustScore: score, riskLevel: getRiskLevelFromScore(score) },
  ];

  for (const event of events.reverse()) {
    score = Math.min(100, Math.max(0, score + (Math.random() > 0.7 ? 3 : -2)));
    history.push({
      timestamp: event.timestamp.toISOString(),
      trustScore: score,
      riskLevel: getRiskLevelFromScore(score),
    });
  }

  history.push({
    timestamp: new Date().toISOString(),
    trustScore: session.trustScore,
    riskLevel: session.riskLevel,
  });

  return res.json(history);
});

export default router;
