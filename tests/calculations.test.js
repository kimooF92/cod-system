const test = require("node:test");
const assert = require("node:assert/strict");

// Pure domain logic mirror for testing
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

function calculateGrossMargin(sellingPrice, cost) {
  if (sellingPrice <= 0) return null;
  const grossProfit = sellingPrice - cost;
  return safeDivide(grossProfit, sellingPrice);
}

function calculateCPL(adSpend, leads) {
  return safeDivide(adSpend, leads);
}

function calculateConfirmationRate(confirmedOrders, leads) {
  return safeDivide(confirmedOrders, leads);
}

function calculateDeliveryRate(deliveredOrders, shippedOrders) {
  return safeDivide(deliveredOrders, shippedOrders);
}

function calculateDeliveredNetProfit(params) {
  const deliveredRevenue = params.deliveredOrders * params.sellingPrice;
  const productCostTotal = params.deliveredOrders * params.productCost;
  const packagingCostTotal =
    (params.deliveredOrders + params.returnedOrders) * params.packagingCost;
  const deliveryCostTotal = params.deliveredOrders * params.deliveryCost;
  const returnCostTotal = params.returnedOrders * params.returnCost;
  const otherCosts = params.otherCosts || 0;

  const totalCosts =
    params.adSpend +
    productCostTotal +
    packagingCostTotal +
    deliveryCostTotal +
    returnCostTotal +
    otherCosts;

  return deliveredRevenue - totalCosts;
}

test("calculateGrossMargin computes margin ratio accurately", () => {
  // 65 DT price, 22 DT cost -> (65-22)/65 = 43/65 = 0.6615...
  const margin = calculateGrossMargin(65.0, 22.0);
  assert.ok(margin !== null);
  assert.equal(margin.toFixed(3), "0.662");

  // 80 DT price, 25 DT cost -> 55/80 = 0.6875
  const margin2 = calculateGrossMargin(80.0, 25.0);
  assert.equal(margin2, 0.6875);
});

test("calculateGrossMargin handles zero or negative selling price safely", () => {
  assert.equal(calculateGrossMargin(0, 20), null);
  assert.equal(calculateGrossMargin(-10, 20), null);
});

test("calculateCPL handles normal and zero lead edge cases", () => {
  assert.equal(calculateCPL(85.0, 25), 3.4);
  assert.equal(calculateCPL(85.0, 0), null);
});

test("calculateDeliveredNetProfit calculates exact COD net profit with return fees", () => {
  const netProfit = calculateDeliveredNetProfit({
    deliveredOrders: 14,
    returnedOrders: 6,
    sellingPrice: 65.0,
    adSpend: 85.0,
    productCost: 20.0,
    packagingCost: 1.5,
    deliveryCost: 7.0,
    returnCost: 3.5,
  });

  // Revenue = 14 * 65 = 910 DT
  // Ad spend = 85 DT
  // Product cost = 14 * 20 = 280 DT
  // Packaging = (14 + 6) * 1.5 = 30 DT
  // Delivery = 14 * 7 = 98 DT
  // Return fees = 6 * 3.5 = 21 DT
  // Total costs = 85 + 280 + 30 + 98 + 21 = 514 DT
  // Net Profit = 910 - 514 = 396 DT
  assert.equal(netProfit, 396.0);
});
