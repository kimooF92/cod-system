import { safeDivide } from "./calculations";

export interface ProductUnitEconomicsInput {
  sellingPrice: number;
  productCost: number;
  packagingCost: number;
  deliveryCost: number;
  returnCost: number;
  otherCost?: number;
  targetCpl: number;
  expectedDeliveryRate: number; // e.g. 0.65 for 65%
  expectedConfirmationRate?: number; // default 1.0 if leads represent direct checkout or confirmed leads
}

export interface UnitEconomicsBreakdown {
  sellingPrice: number;
  directCosts: number;
  grossProfit: number;
  grossMarginRate: number | null;
  returnCostLoadPerDelivered: number;
  adCostLoadPerDelivered: number;
  totalCostPerDeliveredOrder: number;
  estimatedNetProfitPerDeliveredOrder: number;
  netMarginRate: number | null;
  breakEvenCPL: number | null;
}

/**
 * Computes the complete estimated unit economics for a product prior to or during ad testing.
 * AD-1 Pure calculation logic: No database/network dependencies.
 */
export function calculateUnitEconomics(
  input: ProductUnitEconomicsInput
): UnitEconomicsBreakdown {
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

  // Direct physical delivery cost per delivered unit
  const directCosts = productCost + packagingCost + deliveryCost + otherCost;
  const grossProfit = sellingPrice - productCost;
  const grossMarginRate = safeDivide(grossProfit, sellingPrice);

  // Return cost load: For every delivered order, (1 - deliveryRate) / deliveryRate orders were returned
  const returnRatio =
    expectedDeliveryRate > 0 && expectedDeliveryRate < 1
      ? (1 - expectedDeliveryRate) / expectedDeliveryRate
      : 0;
  const returnCostLoadPerDelivered = returnRatio * returnCost;

  // Ad spend load per delivered order
  const effectiveAcquisitionRate = expectedDeliveryRate * expectedConfirmationRate;
  const adCostLoadPerDelivered =
    effectiveAcquisitionRate > 0 ? targetCpl / effectiveAcquisitionRate : targetCpl;

  // Total cost per delivered order
  const totalCostPerDeliveredOrder =
    directCosts + returnCostLoadPerDelivered + adCostLoadPerDelivered;

  // Estimated net profit per delivered order
  const estimatedNetProfitPerDeliveredOrder =
    sellingPrice - totalCostPerDeliveredOrder;

  const netMarginRate = safeDivide(
    estimatedNetProfitPerDeliveredOrder,
    sellingPrice
  );

  // Break-even CPL: The maximum CPL that yields 0 Net Profit
  // 0 = sellingPrice - (directCosts + returnCostLoad + (CPL / effectiveAcquisitionRate))
  // CPL = (sellingPrice - directCosts - returnCostLoad) * effectiveAcquisitionRate
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
