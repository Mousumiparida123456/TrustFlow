import { Router } from "express";

const router = Router();

// Precomputed scenario timelines for the demo
function buildNormalTimeline() {
  const start = new Date(Date.now() - 30 * 60 * 1000);
  const points = [
    { minutes: 0, score: 12, riskLevel: "low" },
    { minutes: 3, score: 10, riskLevel: "low" },
    { minutes: 6, score: 9, riskLevel: "low" },
    { minutes: 9, score: 11, riskLevel: "low" },
    { minutes: 12, score: 8, riskLevel: "low" },
    { minutes: 15, score: 10, riskLevel: "low" },
    { minutes: 18, score: 12, riskLevel: "low" },
    { minutes: 21, score: 9, riskLevel: "low" },
    { minutes: 24, score: 11, riskLevel: "low" },
    { minutes: 27, score: 10, riskLevel: "low" },
    { minutes: 30, score: 8, riskLevel: "low" },
  ];
  return points.map(p => ({
    timestamp: new Date(start.getTime() + p.minutes * 60000).toISOString(),
    trustScore: p.score,
    riskLevel: p.riskLevel,
  }));
}

function buildAttackerTimeline() {
  const start = new Date(Date.now() - 30 * 60 * 1000);
  const points = [
    { minutes: 0, score: 42, riskLevel: "medium" },
    { minutes: 3, score: 55, riskLevel: "medium" },
    { minutes: 6, score: 63, riskLevel: "high" },
    { minutes: 9, score: 71, riskLevel: "high" },
    { minutes: 12, score: 78, riskLevel: "high" },
    { minutes: 15, score: 84, riskLevel: "high" },
    { minutes: 18, score: 89, riskLevel: "critical" },
    { minutes: 21, score: 94, riskLevel: "critical" },
    { minutes: 24, score: 97, riskLevel: "critical" },
    { minutes: 27, score: 99, riskLevel: "critical" },
    { minutes: 30, score: 100, riskLevel: "critical" },
  ];
  return points.map(p => ({
    timestamp: new Date(start.getTime() + p.minutes * 60000).toISOString(),
    trustScore: p.score,
    riskLevel: p.riskLevel,
  }));
}

// GET /api/demo/scenarios
router.get("/demo/scenarios", async (req, res) => {
  return res.json({
    normalUser: {
      label: "Normal User — Alice",
      description: "Regular banking customer with consistent behavioral patterns, known device, and familiar location.",
      trustScoreTimeline: buildNormalTimeline(),
      riskFactors: [
        { factor: "consistent_typing", description: "Typing speed matches established user baseline", severity: "low", contribution: -2 },
        { factor: "known_device", description: "Recognized device fingerprint from previous sessions", severity: "low", contribution: -3 },
        { factor: "familiar_location", description: "Access from registered home IP address range", severity: "low", contribution: -2 },
      ],
      finalScore: 8,
      finalRiskLevel: "low",
      behaviorProfile: {
        avgTypingSpeed: 4.2,
        avgKeystrokeInterval: 175,
        avgMouseVelocity: 240,
        sessionDuration: "28 minutes",
        device: "Chrome on MacBook Pro",
        location: "New York, US",
      },
    },
    attackerUser: {
      label: "Attacker Simulation — Threat Actor",
      description: "Account takeover attempt: unknown device, suspicious location, automated keystroke patterns, and attempted high-value transfer.",
      trustScoreTimeline: buildAttackerTimeline(),
      riskFactors: [
        { factor: "new_device", description: "Login from an unrecognized device — possible credential theft", severity: "high", contribution: 18 },
        { factor: "new_location", description: "Access from Eastern Europe — impossible travel from previous session 2 hours ago", severity: "high", contribution: 12 },
        { factor: "keystroke_anomaly", description: "Inhuman keystroke timing suggests bot or autofill tool", severity: "high", contribution: 15 },
        { factor: "mouse_behavior", description: "No natural mouse variation — linear, programmatic movement", severity: "medium", contribution: 10 },
        { factor: "high_value_transaction", description: "Attempted $75,000 transfer to unknown beneficiary", severity: "high", contribution: 30 },
        { factor: "active_alerts", description: "3 prior failed login attempts from different IPs", severity: "high", contribution: 15 },
      ],
      finalScore: 100,
      finalRiskLevel: "critical",
      behaviorProfile: {
        avgTypingSpeed: 18.7,
        avgKeystrokeInterval: 12,
        avgMouseVelocity: 890,
        sessionDuration: "3 minutes",
        device: "Unknown Browser on Linux VM",
        location: "Kyiv, Ukraine (via VPN)",
      },
    },
  });
});

// POST /api/demo/simulate
router.post("/demo/simulate", async (req, res) => {
  const { scenario, step = 0 } = req.body;

  const normalSteps = [
    { event: "Login from recognized device", trustScore: 12, riskLevel: "low", riskFactors: [], action: "allow" },
    { event: "Typing speed within normal range", trustScore: 10, riskLevel: "low", riskFactors: [], action: "allow" },
    { event: "Checked account balance", trustScore: 9, riskLevel: "low", riskFactors: [], action: "allow" },
    { event: "Transferred $500 to known contact", trustScore: 11, riskLevel: "low", riskFactors: [], action: "allow" },
    { event: "Browsed transaction history", trustScore: 8, riskLevel: "low", riskFactors: [], action: "allow" },
    { event: "Session ended normally", trustScore: 8, riskLevel: "low", riskFactors: [], action: "allow" },
  ];

  const attackerSteps = [
    {
      event: "Login from unknown device in new country",
      trustScore: 42,
      riskLevel: "medium",
      riskFactors: [
        { factor: "new_device", description: "Unrecognized device fingerprint", severity: "high", contribution: 18 },
        { factor: "new_location", description: "First access from Eastern Europe", severity: "medium", contribution: 12 },
      ],
      action: "request_otp",
    },
    {
      event: "OTP bypassed — continued with stolen code",
      trustScore: 55,
      riskLevel: "medium",
      riskFactors: [
        { factor: "keystroke_anomaly", description: "Inhuman keystroke timing detected — likely automated", severity: "high", contribution: 15 },
      ],
      action: "request_otp",
    },
    {
      event: "Navigating rapidly — bot-like mouse patterns",
      trustScore: 68,
      riskLevel: "high",
      riskFactors: [
        { factor: "mouse_behavior", description: "Programmatic mouse movement detected", severity: "medium", contribution: 10 },
        { factor: "rapid_navigation", description: "Pages accessed 10x faster than human average", severity: "high", contribution: 8 },
      ],
      action: "request_biometric",
    },
    {
      event: "Attempted $75,000 transfer to unknown beneficiary",
      trustScore: 84,
      riskLevel: "high",
      riskFactors: [
        { factor: "high_value_transaction", description: "Abnormally large transfer to new recipient", severity: "high", contribution: 30 },
        { factor: "new_beneficiary", description: "Recipient never seen in account history", severity: "medium", contribution: 20 },
      ],
      action: "request_biometric",
    },
    {
      event: "Biometric failed — repeated access attempts",
      trustScore: 94,
      riskLevel: "critical",
      riskFactors: [
        { factor: "auth_failure", description: "Biometric verification failed 3 times", severity: "high", contribution: 24 },
        { factor: "active_alerts", description: "Multiple security violations in this session", severity: "high", contribution: 16 },
      ],
      action: "block",
    },
    {
      event: "Session blocked — fraud alert triggered",
      trustScore: 100,
      riskLevel: "critical",
      riskFactors: [
        { factor: "account_takeover", description: "All indicators consistent with account takeover attack", severity: "high", contribution: 30 },
      ],
      action: "block",
    },
  ];

  const steps = scenario === "attacker" ? attackerSteps : normalSteps;
  const currentStep = Math.min(step, steps.length - 1);
  const current = steps[currentStep];

  return res.json({
    scenario,
    step: currentStep,
    trustScore: current.trustScore,
    riskLevel: current.riskLevel as "low" | "medium" | "high" | "critical",
    riskFactors: current.riskFactors,
    event: current.event,
    action: current.action as "allow" | "request_otp" | "request_biometric" | "block",
  });
});

export default router;
