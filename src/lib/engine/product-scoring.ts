import { safeDivide } from "./calculations";

export interface ScoringWeights {
  cplWeight: number; // default 0.25 (25%)
  profitWeight: number; // default 0.25 (25%)
  deliveryWeight: number; // default 0.20 (20%)
  confirmationWeight: number; // default 0.15 (15%)
  creativeWeight: number; // default 0.15 (15%)
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  cplWeight: 0.25,
  profitWeight: 0.25,
  deliveryWeight: 0.20,
  confirmationWeight: 0.15,
  creativeWeight: 0.15,
};

export interface ProductScoringInput {
  actualCpl?: number | null;
  targetCpl: number;
  profitPerDeliveredOrder?: number | null;
  expectedProfitPerDeliveredOrder?: number;
  actualDeliveryRate?: number | null;
  expectedDeliveryRate: number;
  actualConfirmationRate?: number | null;
  expectedConfirmationRate?: number;
  creativePotentialScore?: number; // 0-100
  weights?: Partial<ScoringWeights>;
}

export interface DimensionScoreDetail {
  name: string;
  score: number; // 0-100
  weightedScore: number;
  weight: number;
  benchmark: string;
  actual: string;
  explanation: string;
}

export interface ProductScoreResult {
  compositeScore: number; // 0-100
  grade: "A" | "B" | "C" | "D" | "F";
  gradeLabel: string;
  badgeVariant: "winner" | "scale" | "testing" | "hold" | "kill";
  dimensions: {
    cpl: DimensionScoreDetail;
    profit: DimensionScoreDetail;
    delivery: DimensionScoreDetail;
    confirmation: DimensionScoreDetail;
    creative: DimensionScoreDetail;
  };
  recommendation: string;
}

function clamp(value: number, min = 0, max = 100): number {
  if (isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

/**
 * Calculates a multi-dimensional 0–100 Product Score with per-dimension breakdown (FR-12).
 * AD-1 Pure calculation logic: deterministic, unit-safe math.
 */
export function calculateProductScore(
  input: ProductScoringInput
): ProductScoreResult {
  const w: ScoringWeights = {
    ...DEFAULT_SCORING_WEIGHTS,
    ...input.weights,
  };

  // 1. CPL Efficiency Score (0-100)
  const targetCpl = input.targetCpl > 0 ? input.targetCpl : 4.0;
  const cpl =
    input.actualCpl !== undefined && input.actualCpl !== null
      ? input.actualCpl
      : targetCpl; // use target as baseline if not tested yet

  // CPL scoring: 100 if CPL <= 0.75*target, 80 if CPL = target, 40 if CPL = 1.5*target, 0 if >= 2*target
  const cplRatio = safeDivide(cpl, targetCpl, 1.0) || 1.0;
  let cplScore = 100 - (cplRatio - 0.7) * 75;
  cplScore = clamp(cplScore);

  // 2. Profit per Delivered Order Score (0-100)
  const profit =
    input.profitPerDeliveredOrder !== undefined &&
    input.profitPerDeliveredOrder !== null
      ? input.profitPerDeliveredOrder
      : input.expectedProfitPerDeliveredOrder || 15.0;

  // Profit scoring: >= 25 DT = 100 pts, 15 DT = 70 pts, 5 DT = 30 pts, <= 0 = 0 pts
  let profitScore = (profit / 25.0) * 100;
  profitScore = clamp(profitScore);

  // 3. Delivery Rate Score (0-100)
  const delivRate =
    input.actualDeliveryRate !== undefined && input.actualDeliveryRate !== null
      ? input.actualDeliveryRate
      : input.expectedDeliveryRate || 0.65;

  // Delivery scoring: >= 75% = 100 pts, 65% = 75 pts, 50% = 40 pts, <= 30% = 0 pts
  let deliveryScore = ((delivRate - 0.3) / 0.45) * 100;
  deliveryScore = clamp(deliveryScore);

  // 4. Confirmation Rate Score (0-100)
  const confRate =
    input.actualConfirmationRate !== undefined &&
    input.actualConfirmationRate !== null
      ? input.actualConfirmationRate
      : input.expectedConfirmationRate || 0.75;

  // Confirmation scoring: >= 85% = 100 pts, 75% = 80 pts, 60% = 50 pts, <= 40% = 0 pts
  let confirmationScore = ((confRate - 0.4) / 0.45) * 100;
  confirmationScore = clamp(confirmationScore);

  // 5. Creative Potential Score (0-100)
  const creativeScore = clamp(input.creativePotentialScore ?? 75.0);

  // Composite Calculation
  const totalWeight =
    w.cplWeight + w.profitWeight + w.deliveryWeight + w.confirmationWeight + w.creativeWeight;

  const weightedSum =
    cplScore * w.cplWeight +
    profitScore * w.profitWeight +
    deliveryScore * w.deliveryWeight +
    confirmationScore * w.confirmationWeight +
    creativeScore * w.creativeWeight;

  const compositeScore = Math.round(
    clamp(totalWeight > 0 ? weightedSum / totalWeight : weightedSum)
  );

  // Grade Assessment
  let grade: "A" | "B" | "C" | "D" | "F" = "C";
  let gradeLabel = "Fair Potential";
  let badgeVariant: "winner" | "scale" | "testing" | "hold" | "kill" = "testing";
  let recommendation = "Monitor test performance and optimize ad angles.";

  if (compositeScore >= 85) {
    grade = "A";
    gradeLabel = "Elite Winner";
    badgeVariant = "winner";
    recommendation = "Strong unit economics across all dimensions. Ready for scaling budget.";
  } else if (compositeScore >= 70) {
    grade = "B";
    gradeLabel = "Profitable Runner";
    badgeVariant = "scale";
    recommendation = "Solid margins and acceptable delivery rate. Continue controlled expansion.";
  } else if (compositeScore >= 50) {
    grade = "C";
    gradeLabel = "Average / Optimizable";
    badgeVariant = "hold";
    recommendation = "Moderate economics. Test fresh creative hooks to lower acquisition cost.";
  } else {
    grade = "D";
    gradeLabel = "Underperforming";
    badgeVariant = "kill";
    recommendation = "High CPL or low delivery rate eroding profit. Consider killing product.";
  }

  return {
    compositeScore,
    grade,
    gradeLabel,
    badgeVariant,
    dimensions: {
      cpl: {
        name: "CPL Efficiency",
        score: Math.round(cplScore),
        weightedScore: Number((cplScore * w.cplWeight).toFixed(1)),
        weight: w.cplWeight,
        benchmark: `${targetCpl.toFixed(3)} DT`,
        actual: `${cpl.toFixed(3)} DT`,
        explanation:
          cpl <= targetCpl
            ? `Acquiring leads below target (${cpl.toFixed(3)} DT vs ${targetCpl.toFixed(3)} DT)`
            : `Acquisition cost exceeds target benchmark by ${(cpl - targetCpl).toFixed(3)} DT`,
      },
      profit: {
        name: "Profit / Delivered Order",
        score: Math.round(profitScore),
        weightedScore: Number((profitScore * w.profitWeight).toFixed(1)),
        weight: w.profitWeight,
        benchmark: ">= 15.000 DT",
        actual: `${profit.toFixed(3)} DT`,
        explanation:
          profit >= 15
            ? `Healthy contribution margin of ${profit.toFixed(3)} DT per delivered order`
            : `Thin unit margin (${profit.toFixed(3)} DT); vulnerable to courier return spikes`,
      },
      delivery: {
        name: "Delivery Rate Potential",
        score: Math.round(deliveryScore),
        weightedScore: Number((deliveryScore * w.deliveryWeight).toFixed(1)),
        weight: w.deliveryWeight,
        benchmark: ">= 65.0%",
        actual: `${(delivRate * 100).toFixed(1)}%`,
        explanation:
          delivRate >= 0.65
            ? `Solid delivery rate (${(delivRate * 100).toFixed(1)}%) minimizes returned inventory cost`
            : `Sub-target delivery rate (${(delivRate * 100).toFixed(1)}%) increases return fee load`,
      },
      confirmation: {
        name: "Customer Confirmation",
        score: Math.round(confirmationScore),
        weightedScore: Number((confirmationScore * w.confirmationWeight).toFixed(1)),
        weight: w.confirmationWeight,
        benchmark: ">= 75.0%",
        actual: `${(confRate * 100).toFixed(1)}%`,
        explanation:
          confRate >= 0.75
            ? `High customer intent with ${(confRate * 100).toFixed(1)}% order confirmation`
            : `Low commitment rate (${(confRate * 100).toFixed(1)}%); test clearer offer clarity`,
      },
      creative: {
        name: "Creative & Angle Potential",
        score: Math.round(creativeScore),
        weightedScore: Number((creativeScore * w.creativeWeight).toFixed(1)),
        weight: w.creativeWeight,
        benchmark: "Multiple Angles",
        actual: `${Math.round(creativeScore)} / 100`,
        explanation: "Versatility of video angles, problem demos, and hook opportunities.",
      },
    },
    recommendation,
  };
}
