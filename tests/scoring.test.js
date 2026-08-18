const test = require("node:test");
const assert = require("node:assert/strict");

function safeDivide(numerator, denominator, fallback = null) {
  if (
    denominator === 0 ||
    !denominator ||
    isNaN(numerator) ||
    isNaN(denominator) ||
    !isFinite(numerator) ||
    !isFinite(denominator)
  ) {
    return fallback;
  }
  const result = numerator / denominator;
  return isFinite(result) ? result : fallback;
}

function clamp(value, min = 0, max = 100) {
  if (isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

function calculateProductScore(input) {
  const w = {
    cplWeight: 0.25,
    profitWeight: 0.25,
    deliveryWeight: 0.20,
    confirmationWeight: 0.15,
    creativeWeight: 0.15,
    ...(input.weights || {}),
  };

  const targetCpl = input.targetCpl > 0 ? input.targetCpl : 4.0;
  const cpl =
    input.actualCpl !== undefined && input.actualCpl !== null
      ? input.actualCpl
      : targetCpl;

  const cplRatio = safeDivide(cpl, targetCpl, 1.0) || 1.0;
  let cplScore = 100 - (cplRatio - 0.7) * 75;
  cplScore = clamp(cplScore);

  const profit =
    input.profitPerDeliveredOrder !== undefined &&
    input.profitPerDeliveredOrder !== null
      ? input.profitPerDeliveredOrder
      : input.expectedProfitPerDeliveredOrder || 15.0;

  let profitScore = (profit / 25.0) * 100;
  profitScore = clamp(profitScore);

  const delivRate =
    input.actualDeliveryRate !== undefined && input.actualDeliveryRate !== null
      ? input.actualDeliveryRate
      : input.expectedDeliveryRate || 0.65;

  let deliveryScore = ((delivRate - 0.3) / 0.45) * 100;
  deliveryScore = clamp(deliveryScore);

  const confRate =
    input.actualConfirmationRate !== undefined &&
    input.actualConfirmationRate !== null
      ? input.actualConfirmationRate
      : input.expectedConfirmationRate || 0.75;

  let confirmationScore = ((confRate - 0.4) / 0.45) * 100;
  confirmationScore = clamp(confirmationScore);

  const creativeScore = clamp(input.creativePotentialScore ?? 75.0);

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

  let grade = "C";
  if (compositeScore >= 85) grade = "A";
  else if (compositeScore >= 70) grade = "B";
  else if (compositeScore >= 50) grade = "C";
  else grade = "D";

  return {
    compositeScore,
    grade,
    cplScore: Math.round(cplScore),
    profitScore: Math.round(profitScore),
    deliveryScore: Math.round(deliveryScore),
    confirmationScore: Math.round(confirmationScore),
    creativeScore: Math.round(creativeScore),
  };
}

test("calculateProductScore calculates 0-100 composite score accurately for high performer", () => {
  const result = calculateProductScore({
    targetCpl: 4.0,
    actualCpl: 3.0, // CPL ratio = 0.75 -> cplScore = 100 - (0.75 - 0.7)*75 = 96.25 -> 96
    expectedProfitPerDeliveredOrder: 22.0, // 22/25 = 88 pts
    expectedDeliveryRate: 0.72, // (0.72 - 0.3)/0.45 = 93.3 pts
    expectedConfirmationRate: 0.80, // (0.80 - 0.4)/0.45 = 88.8 pts
    creativePotentialScore: 90, // 90 pts
  });

  // Expected weighted: 96*0.25 + 88*0.25 + 93.3*0.20 + 88.8*0.15 + 90*0.15 = 24 + 22 + 18.66 + 13.32 + 13.5 = 91.48 -> 91
  assert.equal(result.compositeScore >= 85, true);
  assert.equal(result.grade, "A");
});

test("calculateProductScore clamps low scores to 0-100 bounds", () => {
  const result = calculateProductScore({
    targetCpl: 4.0,
    actualCpl: 15.0, // very high CPL
    expectedProfitPerDeliveredOrder: -10.0, // negative profit
    expectedDeliveryRate: 0.2, // very low delivery
    expectedConfirmationRate: 0.2, // very low confirmation
    creativePotentialScore: 20,
  });

  assert.equal(result.compositeScore >= 0 && result.compositeScore <= 100, true);
  assert.equal(result.grade, "D");
  assert.equal(result.profitScore, 0);
  assert.equal(result.deliveryScore, 0);
  assert.equal(result.confirmationScore, 0);
});
