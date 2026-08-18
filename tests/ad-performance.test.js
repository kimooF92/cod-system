const test = require("node:test");
const assert = require("node:assert/strict");

function safeDivide(num, den) {
  if (den === 0 || isNaN(den) || !isFinite(den) || !isFinite(num)) {
    return null;
  }
  return num / den;
}

function calculateAdMetrics(raw) {
  const ctr = safeDivide(raw.clicks, raw.impressions);
  const cpc = safeDivide(raw.spend, raw.clicks);
  const cpl = safeDivide(raw.spend, raw.leads);

  return {
    spend: raw.spend,
    impressions: raw.impressions,
    clicks: raw.clicks,
    leads: raw.leads,
    ctr,
    cpc,
    cpl,
  };
}

function aggregateAdPerformance(records) {
  let totalSpend = 0;
  let totalImpressions = 0;
  let totalClicks = 0;
  let totalLeads = 0;

  for (const r of records) {
    totalSpend += r.spend || 0;
    totalImpressions += r.impressions || 0;
    totalClicks += r.clicks || 0;
    totalLeads += r.leads || 0;
  }

  const blendedCTR = safeDivide(totalClicks, totalImpressions);
  const blendedCPC = safeDivide(totalSpend, totalClicks);
  const blendedCPL = safeDivide(totalSpend, totalLeads);

  return {
    totalSpend,
    totalImpressions,
    totalClicks,
    totalLeads,
    blendedCTR,
    blendedCPC,
    blendedCPL,
  };
}

test("calculateAdMetrics computes CTR, CPC, and CPL accurately", () => {
  const metrics = calculateAdMetrics({
    spend: 60.0,
    impressions: 4000,
    clicks: 120,
    leads: 15,
  });

  assert.equal(metrics.ctr, 0.03); // 120 / 4000 = 3.0%
  assert.equal(metrics.cpc, 0.5); // 60 / 120 = 0.5 DT
  assert.equal(metrics.cpl, 4.0); // 60 / 15 = 4.0 DT
});

test("calculateAdMetrics handles zero clicks and zero leads safely (AD-1)", () => {
  const metrics = calculateAdMetrics({
    spend: 20.0,
    impressions: 500,
    clicks: 0,
    leads: 0,
  });

  assert.equal(metrics.ctr, 0.0);
  assert.equal(metrics.cpc, null);
  assert.equal(metrics.cpl, null);
});

test("aggregateAdPerformance aggregates totals and blended rates accurately", () => {
  const summary = aggregateAdPerformance([
    { spend: 50.0, impressions: 2000, clicks: 80, leads: 10 },
    { spend: 50.0, impressions: 3000, clicks: 120, leads: 15 },
  ]);

  assert.equal(summary.totalSpend, 100.0);
  assert.equal(summary.totalImpressions, 5000);
  assert.equal(summary.totalClicks, 200);
  assert.equal(summary.totalLeads, 25);
  assert.equal(summary.blendedCTR, 0.04);
  assert.equal(summary.blendedCPC, 0.5);
  assert.equal(summary.blendedCPL, 4.0);
});
