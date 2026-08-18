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

function evaluateTestPerformance(benchmarks, actuals) {
  const { budget, targetLeads, targetCpl, expectedDeliveryRate, targetProfitPerOrder } =
    benchmarks;
  const {
    adSpend,
    leads,
    confirmedOrders,
    deliveredOrders,
    returnedOrders,
    sellingPrice,
    productCost,
    packagingCost,
    deliveryCost,
    returnCost,
    otherCosts = 0,
  } = actuals;

  const budgetUtilization = safeDivide(adSpend, budget);
  const leadProgressRate = safeDivide(leads, targetLeads);
  const actualCPL = safeDivide(adSpend, leads);
  const cplDelta = actualCPL !== null ? actualCPL - targetCpl : null;
  const isCplBeatingTarget = actualCPL !== null ? actualCPL <= targetCpl : false;

  const confirmationRate = safeDivide(confirmedOrders, leads);
  const deliveryRate = safeDivide(deliveredOrders, confirmedOrders);
  const deliveryRateDelta =
    deliveryRate !== null ? deliveryRate - expectedDeliveryRate : null;
  const isDeliveryBeatingTarget =
    deliveryRate !== null ? deliveryRate >= expectedDeliveryRate : false;

  const deliveredRevenue = deliveredOrders * sellingPrice;
  const netProfit = calculateDeliveredNetProfit({
    deliveredOrders,
    returnedOrders,
    sellingPrice,
    adSpend,
    productCost,
    packagingCost,
    deliveryCost,
    returnCost,
    otherCosts,
  });

  const profitPerDeliveredOrder = safeDivide(netProfit, deliveredOrders);
  const isProfitBeatingTarget =
    profitPerDeliveredOrder !== null
      ? profitPerDeliveredOrder >= targetProfitPerOrder
      : false;

  const profitPerLead = safeDivide(netProfit, leads);

  return {
    adSpend,
    budget,
    budgetUtilization,
    leads,
    targetLeads,
    leadProgressRate,
    actualCPL,
    targetCPL: targetCpl,
    cplDelta,
    isCplBeatingTarget,
    confirmedOrders,
    confirmationRate,
    deliveredOrders,
    deliveryRate,
    expectedDeliveryRate,
    deliveryRateDelta,
    isDeliveryBeatingTarget,
    deliveredRevenue,
    netProfit,
    profitPerDeliveredOrder,
    targetProfitPerOrder,
    isProfitBeatingTarget,
    profitPerLead,
  };
}

test("evaluateTestPerformance evaluates CPL, delivery rate, and profit per lead", () => {
  const report = evaluateTestPerformance(
    {
      budget: 150.0,
      targetLeads: 40,
      targetCpl: 3.8,
      expectedDeliveryRate: 0.7,
      targetProfitPerOrder: 18.0,
    },
    {
      adSpend: 85.0,
      leads: 26,
      confirmedOrders: 20,
      deliveredOrders: 14,
      returnedOrders: 2,
      sellingPrice: 49.0,
      productCost: 14.5,
      packagingCost: 1.5,
      deliveryCost: 7.0,
      returnCost: 3.5,
    }
  );

  // Actual CPL = 85 / 26 = 3.269 DT (< 3.8 target) -> beating!
  assert.equal(report.isCplBeatingTarget, true);
  assert.equal(report.actualCPL.toFixed(3), "3.269");

  // Delivery Rate = 14 / 20 = 0.70 (70%) -> matches target
  assert.equal(report.deliveryRate, 0.7);
  assert.equal(report.isDeliveryBeatingTarget, true);

  // Revenue = 14 * 49 = 686 DT
  // Costs: Ad 85 + Product (14*14.5=203) + Pkg (16*1.5=24) + Deliv (14*7=98) + Return (2*3.5=7) = 417 DT
  // Net Profit = 686 - 417 = 269 DT
  assert.equal(report.netProfit, 269.0);

  // Profit / Delivered Order = 269 / 14 = 19.214 DT
  assert.equal(report.profitPerDeliveredOrder.toFixed(3), "19.214");
  assert.equal(report.isProfitBeatingTarget, true);

  // Profit / Lead = 269 / 26 = 10.346 DT
  assert.equal(report.profitPerLead.toFixed(3), "10.346");
});

test("evaluateTestPerformance handles zero leads without error", () => {
  const report = evaluateTestPerformance(
    {
      budget: 100.0,
      targetLeads: 25,
      targetCpl: 4.0,
      expectedDeliveryRate: 0.65,
      targetProfitPerOrder: 15.0,
    },
    {
      adSpend: 0,
      leads: 0,
      confirmedOrders: 0,
      deliveredOrders: 0,
      returnedOrders: 0,
      sellingPrice: 50.0,
      productCost: 15.0,
      packagingCost: 1.5,
      deliveryCost: 7.0,
      returnCost: 3.5,
    }
  );

  assert.equal(report.actualCPL, null);
  assert.equal(report.profitPerLead, null);
  assert.equal(report.isCplBeatingTarget, false);
});
