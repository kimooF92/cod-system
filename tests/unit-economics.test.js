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

function calculateUnitEconomics(input) {
  const {
    sellingPrice,
    productCost,
    packagingCost,
    deliveryCost,
    returnCost,
    otherCost = 0,
    targetCpl,
    expectedDeliveryRate,
    expectedConfirmationRate = 1.0,
  } = input;

  const directCosts = productCost + packagingCost + deliveryCost + otherCost;
  const grossProfit = sellingPrice - productCost;
  const grossMarginRate = safeDivide(grossProfit, sellingPrice);

  const returnRatio =
    expectedDeliveryRate > 0 && expectedDeliveryRate < 1
      ? (1 - expectedDeliveryRate) / expectedDeliveryRate
      : 0;
  const returnCostLoadPerDelivered = returnRatio * returnCost;

  const effectiveAcquisitionRate = expectedDeliveryRate * expectedConfirmationRate;
  const adCostLoadPerDelivered =
    effectiveAcquisitionRate > 0 ? targetCpl / effectiveAcquisitionRate : targetCpl;

  const totalCostPerDeliveredOrder =
    directCosts + returnCostLoadPerDelivered + adCostLoadPerDelivered;

  const estimatedNetProfitPerDeliveredOrder =
    sellingPrice - totalCostPerDeliveredOrder;

  const netMarginRate = safeDivide(
    estimatedNetProfitPerDeliveredOrder,
    sellingPrice
  );

  const profitBufferBeforeAds = sellingPrice - directCosts - returnCostLoadPerDelivered;
  const breakEvenCPL =
    profitBufferBeforeAds > 0 && effectiveAcquisitionRate > 0
      ? profitBufferBeforeAds * effectiveAcquisitionRate
      : 0;

  return {
    sellingPrice,
    directCosts,
    grossProfit,
    grossMarginRate,
    returnCostLoadPerDelivered,
    adCostLoadPerDelivered,
    totalCostPerDeliveredOrder,
    estimatedNetProfitPerDeliveredOrder,
    netMarginRate,
    breakEvenCPL,
  };
}

test("calculateUnitEconomics computes complete per-delivered order metrics", () => {
  const eco = calculateUnitEconomics({
    sellingPrice: 50.0,
    productCost: 15.0,
    packagingCost: 1.5,
    deliveryCost: 7.0,
    returnCost: 3.5,
    targetCpl: 4.0,
    expectedDeliveryRate: 0.7, // 70% delivery
  });

  // Gross profit: 50 - 15 = 35 DT
  assert.equal(eco.grossProfit, 35.0);
  assert.equal(eco.grossMarginRate, 0.7);

  // Direct costs: 15 + 1.5 + 7 = 23.5 DT
  assert.equal(eco.directCosts, 23.5);

  // Return load: (0.3 / 0.7) * 3.5 = 1.5 DT
  assert.equal(eco.returnCostLoadPerDelivered.toFixed(2), "1.50");

  // Ad load: 4.0 / 0.7 = 5.714 DT
  assert.equal(eco.adCostLoadPerDelivered.toFixed(3), "5.714");

  // Total cost: 23.5 + 1.5 + 5.714 = 30.714 DT
  // Net profit: 50 - 30.714 = 19.286 DT
  assert.equal(eco.estimatedNetProfitPerDeliveredOrder.toFixed(3), "19.286");

  // Break-even CPL: (50 - 23.5 - 1.5) * 0.7 = 25 * 0.7 = 17.5 DT
  assert.equal(eco.breakEvenCPL.toFixed(1), "17.5");
});

test("calculateUnitEconomics handles 100% delivery rate without return load", () => {
  const eco = calculateUnitEconomics({
    sellingPrice: 60.0,
    productCost: 20.0,
    packagingCost: 1.0,
    deliveryCost: 7.0,
    returnCost: 3.5,
    targetCpl: 5.0,
    expectedDeliveryRate: 1.0,
  });

  assert.equal(eco.returnCostLoadPerDelivered, 0);
  assert.equal(eco.adCostLoadPerDelivered, 5.0);
  // Total cost: 28 + 5 = 33 DT -> Net profit: 27 DT
  assert.equal(eco.estimatedNetProfitPerDeliveredOrder, 27.0);
});

test("calculateUnitEconomics handles zero delivery rate safely", () => {
  const eco = calculateUnitEconomics({
    sellingPrice: 60.0,
    productCost: 20.0,
    packagingCost: 1.0,
    deliveryCost: 7.0,
    returnCost: 3.5,
    targetCpl: 5.0,
    expectedDeliveryRate: 0,
  });

  assert.equal(eco.breakEvenCPL, 0);
});
