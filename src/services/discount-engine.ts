export type DiscountRiskLevel = "LOW" | "MEDIUM" | "HIGH";

export type DiscountRiskInput = {
  customerTier: "STANDARD" | "SILVER" | "GOLD" | "PLATINUM";
  requestedDiscountPct: number;
  allowedDiscountPct: number;
  marginPct: number;
  previousApprovalCount?: number;
};

export type DiscountRiskResult = {
  riskLevel: DiscountRiskLevel;
  reason: string;
  approvalRequired: boolean;
  approvalLevel: "MANAGER" | "FINANCE" | null;
};

const TIER_MULTIPLIER: Record<DiscountRiskInput["customerTier"], number> = {
  STANDARD: 1,
  SILVER: 1.1,
  GOLD: 1.25,
  PLATINUM: 1.4,
};

export function calculateDiscountRisk(
  input: DiscountRiskInput
): DiscountRiskResult {
  const {
    customerTier,
    requestedDiscountPct,
    allowedDiscountPct,
    marginPct,
    previousApprovalCount = 0,
  } = input;

  const tierCeiling = allowedDiscountPct * TIER_MULTIPLIER[customerTier];
  const exceedsAllowed = requestedDiscountPct > allowedDiscountPct;
  const exceedsTierCeiling = requestedDiscountPct > tierCeiling;

  if (exceedsTierCeiling || marginPct < 10) {
    const reason = exceedsTierCeiling
      ? `Discount exceeds ${customerTier} customer ceiling by ${(
          requestedDiscountPct - tierCeiling
        ).toFixed(1)}%.`
      : `Projected margin is only ${marginPct.toFixed(1)}%.`;

    return {
      riskLevel: "HIGH",
      reason,
      approvalRequired: true,
      approvalLevel: "FINANCE",
    };
  }

  if (
    exceedsAllowed ||
    requestedDiscountPct >= allowedDiscountPct * 0.9 ||
    previousApprovalCount >= 2
  ) {
    return {
      riskLevel: "MEDIUM",
      reason: exceedsAllowed
        ? `Discount exceeds the standard allowed limit by ${(
            requestedDiscountPct - allowedDiscountPct
          ).toFixed(1)}%.`
        : "Discount is close to the allowed limit or has repeated approval history.",
      approvalRequired: true,
      approvalLevel: "MANAGER",
    };
  }

  return {
    riskLevel: "LOW",
    reason: "Discount is within the allowed limit and margin is healthy.",
    approvalRequired: false,
    approvalLevel: null,
  };
}
