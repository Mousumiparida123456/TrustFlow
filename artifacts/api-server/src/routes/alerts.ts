import { Router } from "express";
import { db } from "@workspace/db";
import { alertsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

// GET /api/alerts — list all alerts (reused under /admin/alerts path too)
router.get("/alerts", async (req, res) => {
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

export default router;
