import { Router } from "express";
import { db } from "@workspace/db";
import { sessionsTable, behaviorEventsTable, alertsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { calculateTrustScore } from "../lib/trust-engine";

const router = Router();

// POST /api/behavior/event
router.post("/behavior/event", async (req, res) => {
  const {
    sessionToken,
    eventType,
    typingSpeed,
    keystrokeInterval,
    mouseVelocity,
    clickCount,
    scrollSpeed,
    pageX,
    pageY,
  } = req.body;

  if (!sessionToken) {
    return res.status(400).json({ error: "Session token is required" });
  }

  const [session] = await db.select().from(sessionsTable).where(
    and(eq(sessionsTable.sessionToken, sessionToken), eq(sessionsTable.isActive, true))
  );

  if (!session) {
    return res.status(401).json({ error: "Invalid or expired session" });
  }

  // Record behavior event
  await db.insert(behaviorEventsTable).values({
    sessionId: session.id,
    userId: session.userId,
    eventType,
    typingSpeed: typingSpeed ?? null,
    keystrokeInterval: keystrokeInterval ?? null,
    mouseVelocity: mouseVelocity ?? null,
    clickCount: clickCount ?? null,
    scrollSpeed: scrollSpeed ?? null,
    pageX: pageX ?? null,
    pageY: pageY ?? null,
  });

  // Calculate session duration
  const sessionDurationMinutes = (Date.now() - session.loginTime.getTime()) / 1000 / 60;

  // Run trust engine
  const result = calculateTrustScore(
    session.trustScore,
    { typingSpeed, keystrokeInterval, mouseVelocity, clickCount, scrollSpeed },
    {
      isNewDevice: session.isSuspicious,
      isNewLocation: false,
      sessionDurationMinutes,
    }
  );

  // Update session trust score
  const isSuspicious = result.trustScore > 60;
  await db.update(sessionsTable).set({
    trustScore: result.trustScore,
    riskLevel: result.riskLevel,
    isSuspicious,
    lastActivity: new Date(),
    isActive: result.action !== "block",
  }).where(eq(sessionsTable.id, session.id));

  // Generate alert if high risk
  if (result.trustScore > 60 && result.trustScore > session.trustScore + 15) {
    await db.insert(alertsTable).values({
      userId: session.userId,
      sessionId: session.id,
      alertType: "behavior_change",
      severity: result.riskLevel === "critical" ? "critical" : "high",
      description: `Sudden behavioral anomaly detected: trust score jumped to ${result.trustScore}`,
      isResolved: false,
      metadata: { riskFactors: result.riskFactors, previousScore: session.trustScore },
    });
  }

  return res.json({
    trustScore: result.trustScore,
    riskLevel: result.riskLevel,
    riskFactors: result.riskFactors,
    action: result.action,
  });
});

export default router;
