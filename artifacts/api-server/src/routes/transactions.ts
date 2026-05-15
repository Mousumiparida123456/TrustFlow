import { Router } from "express";
import { db } from "@workspace/db";
import { sessionsTable, transactionsTable, alertsTable, usersTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { assessTransactionRisk, getRiskLevelFromScore, calculateTrustScore } from "../lib/trust-engine";

const router = Router();

// GET /api/transactions
router.get("/transactions", async (req, res) => {
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

  const txns = await db.select().from(transactionsTable)
    .where(eq(transactionsTable.userId, session.userId))
    .orderBy(desc(transactionsTable.timestamp))
    .limit(50);

  return res.json(txns.map(t => ({
    id: t.id,
    userId: t.userId,
    amount: t.amount,
    beneficiary: t.beneficiary,
    transactionType: t.transactionType,
    status: t.status,
    riskScore: t.riskScore,
    timestamp: t.timestamp.toISOString(),
    description: t.description,
  })));
});

// POST /api/transactions
router.post("/transactions", async (req, res) => {
  const { sessionToken, amount, beneficiary, transactionType, description } = req.body;

  if (!sessionToken) {
    return res.status(400).json({ error: "Session token required" });
  }

  const [session] = await db.select().from(sessionsTable).where(
    and(eq(sessionsTable.sessionToken, sessionToken), eq(sessionsTable.isActive, true))
  );

  if (!session) {
    return res.status(401).json({ error: "Invalid or expired session" });
  }

  if (!session.isActive || session.trustScore > 85) {
    return res.status(403).json({ error: "Session is blocked due to high risk level" });
  }

  // Get known beneficiaries for this user
  const prevTxns = await db.select({ beneficiary: transactionsTable.beneficiary })
    .from(transactionsTable)
    .where(eq(transactionsTable.userId, session.userId));
  const knownBeneficiaries = prevTxns.map(t => t.beneficiary.toLowerCase());

  // Assess transaction risk
  const { riskScore, riskFactors, status } = assessTransactionRisk(
    amount,
    beneficiary,
    knownBeneficiaries,
    session.trustScore
  );

  const [txn] = await db.insert(transactionsTable).values({
    userId: session.userId,
    sessionId: session.id,
    amount,
    beneficiary,
    transactionType,
    status,
    riskScore,
    description: description ?? null,
  }).returning();

  // Update user flagged count if flagged/blocked
  if (status !== "completed") {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, session.userId));
    await db.update(usersTable).set({
      flaggedTransactions: user.flaggedTransactions + 1,
    }).where(eq(usersTable.id, session.userId));

    // Generate alert
    await db.insert(alertsTable).values({
      userId: session.userId,
      sessionId: session.id,
      alertType: "high_risk_transaction",
      severity: status === "blocked" ? "critical" : "high",
      description: `${status === "blocked" ? "Blocked" : "Flagged"} transaction of $${amount.toLocaleString()} to ${beneficiary}`,
      isResolved: false,
      metadata: { transactionId: txn.id, riskFactors },
    });
  }

  // Recalculate trust score based on transaction
  const trustResult = calculateTrustScore(
    session.trustScore,
    {},
    {
      isNewDevice: session.isSuspicious,
      isNewLocation: false,
      sessionDurationMinutes: (Date.now() - session.loginTime.getTime()) / 60000,
      recentTransactionAmount: amount,
    }
  );

  await db.update(sessionsTable).set({
    trustScore: trustResult.trustScore,
    riskLevel: trustResult.riskLevel,
    lastActivity: new Date(),
  }).where(eq(sessionsTable.id, session.id));

  const trustScoreImpact = trustResult.trustScore - session.trustScore;

  return res.status(201).json({
    transaction: {
      id: txn.id,
      userId: txn.userId,
      amount: txn.amount,
      beneficiary: txn.beneficiary,
      transactionType: txn.transactionType,
      status: txn.status,
      riskScore: txn.riskScore,
      timestamp: txn.timestamp.toISOString(),
      description: txn.description,
    },
    trustScoreImpact,
    newTrustScore: trustResult.trustScore,
    riskFactors: [...riskFactors, ...trustResult.riskFactors],
    action: trustResult.action,
    message: status === "blocked"
      ? "Transaction blocked due to high risk score"
      : status === "flagged"
      ? "Transaction flagged for review — additional verification may be required"
      : "Transaction completed successfully",
  });
});

export default router;
