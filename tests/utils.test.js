const test = require("node:test");
const assert = require("node:assert/strict");

// Inline pure logic tests matching src/lib/utils.ts functions
function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "0.000 DT";
  }
  return `${amount.toFixed(3)} DT`;
}

function formatPercent(rate) {
  if (rate === null || rate === undefined || isNaN(rate)) {
    return "—";
  }
  return `${(rate * 100).toFixed(1)}%`;
}

function safeDivide(numerator, denominator, fallback = null) {
  if (!denominator || denominator === 0 || isNaN(numerator) || isNaN(denominator)) {
    return fallback;
  }
  return numerator / denominator;
}

test("formatCurrency formats Tunisian Dinars with 3 decimals", () => {
  assert.equal(formatCurrency(142.5), "142.500 DT");
  assert.equal(formatCurrency(0), "0.000 DT");
  assert.equal(formatCurrency(10.1234), "10.123 DT");
  assert.equal(formatCurrency(null), "0.000 DT");
  assert.equal(formatCurrency(undefined), "0.000 DT");
});

test("formatPercent formats percentages with 1 decimal", () => {
  assert.equal(formatPercent(0.685), "68.5%");
  assert.equal(formatPercent(1.0), "100.0%");
  assert.equal(formatPercent(null), "—");
  assert.equal(formatPercent(undefined), "—");
});

test("safeDivide protects against division by zero (AD-6)", () => {
  assert.equal(safeDivide(100, 2), 50);
  assert.equal(safeDivide(100, 0), null);
  assert.equal(safeDivide(0, 0), null);
  assert.equal(safeDivide(100, 0, 0), 0);
  assert.equal(safeDivide(NaN, 5), null);
});
