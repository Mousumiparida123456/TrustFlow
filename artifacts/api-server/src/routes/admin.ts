import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, sessionsTable, alertsTable, transactionsTable } from "@workspace/db";
import { eq, count, avg, and, desc, gte } from "drizzle-orm";

const router = Router();

// GET /api/admin/overview
router.get("/admin/overview", async (req, res) => {
  const [users] = await db.select({ total: count() }).from(usersTable);
  const [activeSessions] = await db.select({ total: count() }).from(sessionsTable).where(eq(sessionsTable.isActive, true));
  const [unresolvedAlerts] = await db.select({ total: count() }).from(alertsTable).where(eq(alertsTable.isResolved, false));
  const [blockedSessions] = await db.select({ total: count() }).from(sessionsTable).where(eq(sessionsTable.isActive, false));
  const [avgScore] = await db.select({ avg: avg(usersTable.trustScore) }).from(usersTable);
  const [txnCount] = await db.select({ total: count() }).from(transactionsTable);
  const [flaggedTxns] = await db.select({ total: count() }).from(transactionsTable).where(eq(transactionsTable.status, "flagged"));

  const allUsers = await db.select({ riskLevel: usersTable.riskLevel }).from(usersTable);
  const riskDistribution = { low: 0, medium: 0, high: 0, critical: 0 };
  for (const u of allUsers) {
    const level = u.riskLevel as keyof typeof riskDistribution;
    if (level in riskDistribution) riskDistribution[level]++;
  }

  return res.json({
    activeUsers: activeSessions.total,
    totalSessions: users.total,
    fraudAlerts: unresolvedAlerts.total,
    blockedSessions: blockedSessions.total,
    avgTrustScore: Math.round(Number(avgScore.avg ?? 0)),
    highRiskUsers: riskDistribution.high + riskDistribution.critical,
    transactionsToday: txnCount.total,
    flaggedTransactions: flaggedTxns.total,
    riskDistribution,
  });
});

// GET /api/admin/users
router.get("/admin/users", async (req, res) => {
  const users = await db.select().from(usersTable).orderBy(desc(usersTable.trustScore));

  return res.json(users.map(u => ({
    id: u.id,
    username: u.username,
    email: u.email,
    trustScore: u.trustScore,
    riskLevel: u.riskLevel,
    lastLogin: u.lastLogin?.toISOString() ?? null,
    isActive: u.isActive,
    loginAttempts: u.loginAttempts,
    flaggedTransactions: u.flaggedTransactions,
    location: u.location,
    device: u.device,
  })));
});

// GET /api/admin/alerts
router.get("/admin/alerts", async (req, res) => {
  const alerts = await db.select().from(alertsTable)
    .orderBy(desc(alertsTable.timestamp))
    .limit(100);

  const userIds = [...new Set(alerts.map(a => a.userId))];
  const users = userIds.length > 0
    ? await db.select({ id: usersTable.id, username: usersTable.username }).from(usersTable)
    : [];
  const userMap = new Map(users.map(u => [u.id, u.username]));

  return res.json(alerts.map(a => ({
    id: a.id,
    userId: a.userId,
    username: userMap.get(a.userId) ?? "Unknown",
    alertType: a.alertType,
    severity: a.severity,
    description: a.description,
    timestamp: a.timestamp.toISOString(),
    isResolved: a.isResolved,
    metadata: a.metadata ?? {},
  })));
});

// GET /api/admin/sessions
router.get("/admin/sessions", async (req, res) => {
  const sessions = await db.select().from(sessionsTable)
    .orderBy(desc(sessionsTable.loginTime))
    .limit(50);

  const userIds = [...new Set(sessions.map(s => s.userId))];
  const users = userIds.length > 0
    ? await db.select({ id: usersTable.id, username: usersTable.username }).from(usersTable)
    : [];
  const userMap = new Map(users.map(u => [u.id, u.username]));

  return res.json(sessions.map(s => ({
    id: s.id,
    userId: s.userId,
    username: userMap.get(s.userId) ?? "Unknown",
    trustScore: s.trustScore,
    riskLevel: s.riskLevel,
    ipAddress: s.ipAddress,
    location: s.location,
    device: s.device,
    loginTime: s.loginTime.toISOString(),
    isActive: s.isActive,
    isSuspicious: s.isSuspicious,
  })));
});

// GET /api/admin/heatmap
router.get("/admin/heatmap", async (req, res) => {
  // Static representative heatmap data for fraud attempts by region
  const heatmapData = [
    { region: "Eastern Europe", country: "Russia", latitude: 55.7558, longitude: 37.6176, fraudAttempts: 847, severity: "high" },
    { region: "West Africa", country: "Nigeria", latitude: 9.0820, longitude: 8.6753, fraudAttempts: 623, severity: "high" },
    { region: "Southeast Asia", country: "Vietnam", latitude: 14.0583, longitude: 108.2772, fraudAttempts: 412, severity: "medium" },
    { region: "South America", country: "Brazil", latitude: -14.2350, longitude: -51.9253, fraudAttempts: 389, severity: "medium" },
    { region: "Eastern Europe", country: "Romania", latitude: 45.9432, longitude: 24.9668, fraudAttempts: 298, severity: "medium" },
    { region: "East Asia", country: "China", latitude: 35.8617, longitude: 104.1954, fraudAttempts: 276, severity: "medium" },
    { region: "Central America", country: "Mexico", latitude: 23.6345, longitude: -102.5528, fraudAttempts: 198, severity: "low" },
    { region: "South Asia", country: "India", latitude: 20.5937, longitude: 78.9629, fraudAttempts: 156, severity: "low" },
    { region: "North Africa", country: "Egypt", latitude: 26.8206, longitude: 30.8025, fraudAttempts: 134, severity: "low" },
    { region: "Southeast Asia", country: "Indonesia", latitude: -0.7893, longitude: 113.9213, fraudAttempts: 112, severity: "low" },
  ];

  return res.json(heatmapData);
});

export default router;
