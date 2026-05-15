// TrustFlow AI - Behavioral Trust Scoring Engine
// Implements an Isolation Forest-inspired anomaly detection algorithm

export interface BehaviorProfile {
  typingSpeed?: number;
  keystrokeInterval?: number;
  mouseVelocity?: number;
  clickCount?: number;
  scrollSpeed?: number;
}

export interface RiskFactor {
  factor: string;
  description: string;
  severity: "low" | "medium" | "high";
  contribution: number;
}

export interface TrustScoreResult {
  trustScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  riskFactors: RiskFactor[];
  action: "allow" | "request_otp" | "request_biometric" | "block";
}

// Baseline behavioral profiles for normal users
const BASELINE = {
  typingSpeed: { mean: 4.5, std: 1.5 },
  keystrokeInterval: { mean: 180, std: 60 },
  mouseVelocity: { mean: 250, std: 100 },
};

function zScore(value: number, mean: number, std: number): number {
  return Math.abs((value - mean) / std);
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function calculateTrustScore(
  currentScore: number,
  behavior: BehaviorProfile,
  sessionContext: {
    isNewDevice: boolean;
    isNewLocation: boolean;
    sessionDurationMinutes: number;
    recentTransactionAmount?: number;
    recentAlerts?: number;
  }
): TrustScoreResult {
  const riskFactors: RiskFactor[] = [];
  let riskDelta = 0;

  // --- Typing speed anomaly ---
  if (behavior.typingSpeed !== undefined && behavior.typingSpeed > 0) {
    const z = zScore(behavior.typingSpeed, BASELINE.typingSpeed.mean, BASELINE.typingSpeed.std);
    if (z > 2.5) {
      const contribution = Math.round(clamp(z * 4, 5, 20));
      riskFactors.push({
        factor: "unusual_typing",
        description: `Typing speed (${behavior.typingSpeed.toFixed(1)} cps) deviates significantly from baseline`,
        severity: z > 4 ? "high" : "medium",
        contribution,
      });
      riskDelta += contribution;
    }
  }

  // --- Keystroke interval anomaly ---
  if (behavior.keystrokeInterval !== undefined && behavior.keystrokeInterval > 0) {
    const z = zScore(behavior.keystrokeInterval, BASELINE.keystrokeInterval.mean, BASELINE.keystrokeInterval.std);
    if (z > 2.0) {
      const contribution = Math.round(clamp(z * 3, 4, 15));
      riskFactors.push({
        factor: "keystroke_anomaly",
        description: "Keystroke timing pattern differs from established user profile",
        severity: z > 3.5 ? "high" : "medium",
        contribution,
      });
      riskDelta += contribution;
    }
  }

  // --- Mouse velocity anomaly ---
  if (behavior.mouseVelocity !== undefined && behavior.mouseVelocity > 0) {
    const z = zScore(behavior.mouseVelocity, BASELINE.mouseVelocity.mean, BASELINE.mouseVelocity.std);
    if (z > 2.0) {
      const contribution = Math.round(clamp(z * 2.5, 3, 12));
      riskFactors.push({
        factor: "mouse_behavior",
        description: "Mouse movement pattern shows automated or unusual characteristics",
        severity: "medium",
        contribution,
      });
      riskDelta += contribution;
    }
  }

  // --- New device ---
  if (sessionContext.isNewDevice) {
    riskFactors.push({
      factor: "new_device",
      description: "Login from an unrecognized device or browser fingerprint",
      severity: "high",
      contribution: 18,
    });
    riskDelta += 18;
  }

  // --- New location ---
  if (sessionContext.isNewLocation) {
    riskFactors.push({
      factor: "new_location",
      description: "Access from a location not seen in recent session history",
      severity: "medium",
      contribution: 12,
    });
    riskDelta += 12;
  }

  // --- High-value transaction ---
  if (sessionContext.recentTransactionAmount && sessionContext.recentTransactionAmount > 10000) {
    const contribution = sessionContext.recentTransactionAmount > 50000 ? 25 : 15;
    riskFactors.push({
      factor: "high_value_transaction",
      description: `Abnormally large transaction of $${sessionContext.recentTransactionAmount.toLocaleString()} detected`,
      severity: sessionContext.recentTransactionAmount > 50000 ? "high" : "medium",
      contribution,
    });
    riskDelta += contribution;
  }

  // --- Recent alerts ---
  if (sessionContext.recentAlerts && sessionContext.recentAlerts > 0) {
    const contribution = Math.min(sessionContext.recentAlerts * 8, 24);
    riskFactors.push({
      factor: "active_alerts",
      description: `${sessionContext.recentAlerts} unresolved security alert(s) associated with this account`,
      severity: sessionContext.recentAlerts > 2 ? "high" : "medium",
      contribution,
    });
    riskDelta += contribution;
  }

  // --- Session duration anomaly (very long sessions are risky) ---
  if (sessionContext.sessionDurationMinutes > 60) {
    riskFactors.push({
      factor: "prolonged_session",
      description: `Session active for ${Math.round(sessionContext.sessionDurationMinutes)} minutes without re-authentication`,
      severity: "low",
      contribution: 5,
    });
    riskDelta += 5;
  }

  // Apply decay if no risk factors (normal behavior gradually improves score)
  if (riskFactors.length === 0) {
    riskDelta = -3; // Gradual trust improvement
  }

  const newScore = clamp(currentScore + riskDelta, 0, 100);

  let riskLevel: "low" | "medium" | "high" | "critical";
  let action: "allow" | "request_otp" | "request_biometric" | "block";

  if (newScore <= 30) {
    riskLevel = "low";
    action = "allow";
  } else if (newScore <= 60) {
    riskLevel = "medium";
    action = "request_otp";
  } else if (newScore <= 85) {
    riskLevel = "high";
    action = "request_biometric";
  } else {
    riskLevel = "critical";
    action = "block";
  }

  return { trustScore: Math.round(newScore), riskLevel, riskFactors, action };
}

export function assessTransactionRisk(
  amount: number,
  beneficiary: string,
  knownBeneficiaries: string[],
  currentTrustScore: number
): { riskScore: number; riskFactors: RiskFactor[]; status: "completed" | "flagged" | "blocked" } {
  const riskFactors: RiskFactor[] = [];
  let riskScore = 0;

  // Large amount
  if (amount > 50000) {
    riskFactors.push({ factor: "large_amount", description: `Transfer of $${amount.toLocaleString()} exceeds normal threshold`, severity: "high", contribution: 30 });
    riskScore += 30;
  } else if (amount > 10000) {
    riskFactors.push({ factor: "elevated_amount", description: `Transfer of $${amount.toLocaleString()} is above average`, severity: "medium", contribution: 15 });
    riskScore += 15;
  }

  // New beneficiary
  if (!knownBeneficiaries.includes(beneficiary.toLowerCase())) {
    riskFactors.push({ factor: "new_beneficiary", description: `${beneficiary} is a new recipient not seen before`, severity: "medium", contribution: 20 });
    riskScore += 20;
  }

  // Current trust score factor
  if (currentTrustScore > 60) {
    riskFactors.push({ factor: "elevated_session_risk", description: "Session risk level is elevated at time of transaction", severity: "high", contribution: 25 });
    riskScore += 25;
  }

  const status = riskScore >= 60 ? "blocked" : riskScore >= 30 ? "flagged" : "completed";
  return { riskScore, riskFactors, status };
}

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getRiskLevelFromScore(score: number): "low" | "medium" | "high" | "critical" {
  if (score <= 30) return "low";
  if (score <= 60) return "medium";
  if (score <= 85) return "high";
  return "critical";
}
