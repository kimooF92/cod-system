import { safeDivide, calculateDeliveredNetProfit } from "./calculations";

export interface TestBenchmarkInput {
  budget: number;
  targetLeads: number;
  targetCpl: number;
  expectedDeliveryRate: number;
  targetProfitPerOrder: number;
}

export interface TestActualsInput {
  adSpend: number;
  leads: number;
  confirmedOrders: number;
  deliveredOrders: number;
  returnedOrders: number;
  sellingPrice: number;
  productCost: number;
  packagingCost: number;
  deliveryCost: number;
  returnCost: number;
  otherCosts?: number;
}

export interface TestPerformanceReport {
  adSpend: number;
  budget: number;
  budgetUtilization: number | null;
  leads: number;
  targetLeads: number;
  leadProgressRate: number | null;
  actualCPL: number | null;
  targetCPL: number;
  cplDelta: number | null;
  isCplBeatingTarget: boolean;
  confirmedOrders: number;
  confirmationRate: number | null;
  deliveredOrders: number;
  deliveryRate: number | null;
  expectedDeliveryRate: number;
  deliveryRateDelta: number | null;
  isDeliveryBeatingTarget: boolean;
  deliveredRevenue: number;
  netProfit: number;
  profitPerDeliveredOrder: number | null;
  targetProfitPerOrder: number;
  isProfitBeatingTarget: boolean;
  profitPerLead: number | null;
}

/**
 * Computes benchmark vs actual performance report for a bounded product test.
 * AD-1 Pure calculation logic: zero DB dependencies, unit-safe math.
 */
export function evaluateTestPerformance(
  benchmarks: TestBenchmarkInput,
  actuals: TestActualsInput
): TestPerformanceReport {
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
