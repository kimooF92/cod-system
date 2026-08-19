import { safeDivide } from "./calculations";
import { formatCurrency, formatPercent } from "../utils";

export type RecommendationAction =
  | "SCALE"
  | "ITERATE_HOOK"
  | "PAUSE"
  | "KILL"
  | "COLLECT_DATA";

export type RecommendationPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface CreativeEvaluationInput {
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  targetCpl: number;
  breakEvenCpl: number;
  minTestSpend?: number;
}

export interface CreativeRecommendationResult {
  action: RecommendationAction;
  priority: RecommendationPriority;
  headline: string;
  rationale: string;
  suggestedAction: string;
  cpl: number | null;
  ctr: number | null;
  cpc: number | null;
  targetCpl: number;
  breakEvenCpl: number;
}

/**
 * Evaluates creative performance against product unit economics (FR-22).
 * Pure deterministic rule engine (AD-1). Zero DB/network dependencies.
 */
export function evaluateCreativePerformance(
  input: CreativeEvaluationInput
): CreativeRecommendationResult {
  const minTestSpend = input.minTestSpend ?? 30.0;
  const spend = input.spend || 0;
  const impressions = input.impressions || 0;
  const clicks = input.clicks || 0;
  const leads = input.leads || 0;
  const targetCpl = input.targetCpl > 0 ? input.targetCpl : 5.0;
  const breakEvenCpl = input.breakEvenCpl > 0 ? input.breakEvenCpl : 10.0;

  const cpl = safeDivide(spend, leads);
  const ctr = safeDivide(clicks, impressions);
  const cpc = safeDivide(spend, clicks);

  // Rule 1: Insufficient Test Spend Data
  if (spend < minTestSpend) {
    return {
      action: "COLLECT_DATA",
      priority: "LOW",
      headline: "Gathering Test Data",
      rationale: `Spend (${formatCurrency(spend)}) is below minimum test threshold (${formatCurrency(minTestSpend)}).`,
      suggestedAction: "Continue running ad to reach statistical sample size.",
      cpl,
      ctr,
      cpc,
      targetCpl,
      breakEvenCpl,
    };
  }

  // Rule 2: Severe Bleed / Hard Kill Condition
  if (
    (spend >= minTestSpend * 2 && leads === 0) ||
    (cpl !== null && cpl >= breakEvenCpl * 1.5)
  ) {
    const multiple = cpl ? (cpl / breakEvenCpl).toFixed(1) : "—";
    return {
      action: "KILL",
      priority: "CRITICAL",
      headline: "Cut Unprofitable Creative",
      rationale:
        leads === 0
          ? `Spent ${formatCurrency(spend)} with 0 leads recorded.`
          : `CPL (${formatCurrency(cpl)}) is ${multiple}x above break-even CPL (${formatCurrency(breakEvenCpl)}).`,
      suggestedAction: "Kill ad immediately to eliminate cash drain.",
      cpl,
      ctr,
      cpc,
      targetCpl,
      breakEvenCpl,
    };
  }

  // Rule 3: High Performing Winner (Scale)
  if (cpl !== null && cpl <= targetCpl && (ctr === null || ctr >= 0.02)) {
    return {
      action: "SCALE",
      priority: "HIGH",
      headline: "Scale Budget (+30% to +50%)",
      rationale: `CPL (${formatCurrency(cpl)}) is at or below target (${formatCurrency(targetCpl)}) with healthy ${(ctr ? ctr * 100 : 0).toFixed(1)}% CTR.`,
      suggestedAction: "Increase daily budget by +30% to +50% or duplicate into Scaling CBO.",
      cpl,
      ctr,
      cpc,
      targetCpl,
      breakEvenCpl,
    };
  }

  // Rule 4: Profitable Backend, Weak Hook (Iterate Hook)
  if (cpl !== null && cpl <= breakEvenCpl && ctr !== null && ctr < 0.015) {
    return {
      action: "ITERATE_HOOK",
      priority: "MEDIUM",
      headline: "Iterate Opening Hook",
      rationale: `Backend converts profitably (${formatCurrency(cpl)} CPL) but CTR is weak (${(ctr * 100).toFixed(1)}%).`,
      suggestedAction: "Keep the marketing angle and test 3 new opening hooks or B-roll openers.",
      cpl,
      ctr,
      cpc,
      targetCpl,
      breakEvenCpl,
    };
  }

  // Rule 5: Margin Negative / Underperforming (Pause)
  if (
    (cpl !== null && cpl > breakEvenCpl) ||
    (ctr !== null && ctr < 0.01 && spend >= minTestSpend * 1.5)
  ) {
    return {
      action: "PAUSE",
      priority: "HIGH",
      headline: "Pause Ad to Protect Margin",
      rationale: `CPL (${formatCurrency(cpl)}) exceeds break-even threshold (${formatCurrency(breakEvenCpl)}).`,
      suggestedAction: "Pause ad set and allocate budget to higher-converting angles.",
      cpl,
      ctr,
      cpc,
      targetCpl,
      breakEvenCpl,
    };
  }

  // Default Fallback
  return {
    action: "COLLECT_DATA",
    priority: "LOW",
    headline: "Monitor Performance",
    rationale: `Spend is ${formatCurrency(spend)} with ${leads} leads.`,
    suggestedAction: "Maintain current budget while gathering more daily results.",
    cpl,
    ctr,
    cpc,
    targetCpl,
    breakEvenCpl,
  };
}
