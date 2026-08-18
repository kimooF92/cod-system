/**
 * COD Growth OS — Domain Calculation Engine (AD-1 Pure Logic Core)
 * Invariant: Zero DB/network dependencies, unit-safe math, no NaN or Infinity.
 */

/**
 * Safely divides two numbers, protecting against division by zero and NaN.
 */
export function safeDivide(
  numerator: number,
  denominator: number,
  fallback: number | null = null
): number | null {
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

/**
 * Calculates Gross Margin as a decimal ratio (e.g. 0.65 = 65%).
 * Formula: (Selling Price - Cost) / Selling Price
 */
export function calculateGrossMargin(
  sellingPrice: number,
  cost: number
): number | null {
  if (sellingPrice <= 0) return null;
  const grossProfit = sellingPrice - cost;
  return safeDivide(grossProfit, sellingPrice);
}

/**
 * Calculates Cost Per Lead (CPL).
 * Formula: Ad Spend / Leads
 */
export function calculateCPL(adSpend: number, leads: number): number | null {
  return safeDivide(adSpend, leads);
}

/**
 * Calculates Confirmation Rate.
 * Formula: Confirmed Orders / Total Leads
 */
export function calculateConfirmationRate(
  confirmedOrders: number,
  leads: number
): number | null {
  return safeDivide(confirmedOrders, leads);
}

/**
 * Calculates Delivery Rate.
 * Formula: Delivered Orders / Shipped (or Confirmed) Orders
 */
export function calculateDeliveryRate(
  deliveredOrders: number,
  shippedOrders: number
): number | null {
  return safeDivide(deliveredOrders, shippedOrders);
}

/**
 * Calculates Delivered Net Profit in Tunisian Dinars.
 * Formula: Delivered Revenue - (Ad Spend + Product Costs + Delivery Fees + Return Fees + Packaging Fees + Other Costs)
 */
export function calculateDeliveredNetProfit(params: {
  deliveredOrders: number;
  sellingPrice: number;
  adSpend: number;
  productCost: number;
  packagingCost: number;
  deliveryCost: number;
  returnCost: number;
  returnedOrders: number;
  otherCosts?: number;
}): number {
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
