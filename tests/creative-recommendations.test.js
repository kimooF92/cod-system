const test = require("node:test");
const assert = require("node:assert/strict");

function safeDivide(num, den) {
  if (den === 0 || isNaN(den) || !isFinite(den) || !isFinite(num)) {
    return null;
  }
  return num / den;
}

function evaluateCreativePerformance(input) {
  const minTestSpend = input.minTestSpend ?? 30.0;
  const spend = input.spend || 0;
  const impressions = input.impressions || 0;
  const clicks = input.clicks || 0;
  const leads = input.leads || 0;
  const targetCpl = input.targetCpl > 0 ? input.targetCpl : 5.0;
  const breakEvenCpl = input.breakEvenCpl > 0 ? input.breakEvenCpl : 10.0;

  const cpl = safeDivide(spend, leads);
  const ctr = safeDivide(clicks, impressions);

  if (spend < minTestSpend) {
    return { action: "COLLECT_DATA", priority: "LOW" };
  }

  if (
    (spend >= minTestSpend * 2 && leads === 0) ||
    (cpl !== null && cpl >= breakEvenCpl * 1.5)
  ) {
    return { action: "KILL", priority: "CRITICAL" };
  }

  if (cpl !== null && cpl <= targetCpl && (ctr === null || ctr >= 0.02)) {
    return { action: "SCALE", priority: "HIGH" };
  }

  if (cpl !== null && cpl <= breakEvenCpl && ctr !== null && ctr < 0.015) {
    return { action: "ITERATE_HOOK", priority: "MEDIUM" };
  }

  if (
    (cpl !== null && cpl > breakEvenCpl) ||
    (ctr !== null && ctr < 0.01 && spend >= minTestSpend * 1.5)
  ) {
    return { action: "PAUSE", priority: "HIGH" };
  }

  return { action: "COLLECT_DATA", priority: "LOW" };
}

test("evaluateCreativePerformance recommends SCALE for low CPL and strong CTR", () => {
  const result = evaluateCreativePerformance({
    spend: 100.0,
    impressions: 4000,
    clicks: 120, // CTR = 3.0%
    leads: 25, // CPL = 4.0 DT
    targetCpl: 5.0,
    breakEvenCpl: 10.0,
  });

  assert.equal(result.action, "SCALE");
  assert.equal(result.priority, "HIGH");
});

test("evaluateCreativePerformance recommends ITERATE_HOOK for profitable CPL with weak CTR", () => {
  const result = evaluateCreativePerformance({
    spend: 60.0,
    impressions: 6000,
    clicks: 60, // CTR = 1.0% < 1.5%
    leads: 10, // CPL = 6.0 DT <= breakEvenCpl
    targetCpl: 5.0,
    breakEvenCpl: 10.0,
  });

  assert.equal(result.action, "ITERATE_HOOK");
  assert.equal(result.priority, "MEDIUM");
});

test("evaluateCreativePerformance recommends KILL for zero leads after 2x test budget", () => {
  const result = evaluateCreativePerformance({
    spend: 70.0, // >= 60 DT
    impressions: 3000,
    clicks: 50,
    leads: 0,
    targetCpl: 5.0,
    breakEvenCpl: 10.0,
  });

  assert.equal(result.action, "KILL");
  assert.equal(result.priority, "CRITICAL");
});

test("evaluateCreativePerformance recommends PAUSE when CPL exceeds break-even", () => {
  const result = evaluateCreativePerformance({
    spend: 65.0,
    impressions: 3000,
    clicks: 60,
    leads: 5, // CPL = 13.0 DT > breakEvenCpl (10.0 DT)
    targetCpl: 5.0,
    breakEvenCpl: 10.0,
  });

  assert.equal(result.action, "PAUSE");
  assert.equal(result.priority, "HIGH");
});

test("evaluateCreativePerformance recommends COLLECT_DATA when spend is below threshold", () => {
  const result = evaluateCreativePerformance({
    spend: 15.0, // < 30.0 DT
    impressions: 800,
    clicks: 20,
    leads: 1,
    targetCpl: 5.0,
    breakEvenCpl: 10.0,
  });

  assert.equal(result.action, "COLLECT_DATA");
  assert.equal(result.priority, "LOW");
});
