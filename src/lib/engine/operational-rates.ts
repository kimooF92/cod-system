/**
 * COD Growth OS — Operational Rates & Fulfillment Performance Engine (AD-1)
 * Invariant: Pure TypeScript calculation core, zero DB dependencies, unit-safe math, no NaN or Infinity.
 */

import { safeDivide } from "./calculations";

export interface OperationalOrder {
  id: string;
  product_id: string;
  governorate: string;
  status: string;
  quantity: number;
  unit_price: number | string;
  delivery_fee: number | string;
  total_amount: number | string;
  courier_name?: string | null;
  tracking_code?: string | null;
  return_reason?: string | null;
  return_fee?: number | string | null;
}

export interface OperationalRatesSummary {
  totalOrders: number;
  newOrders: number;
  noAnswerOrders: number;
  confirmedOrders: number;
  dispatchedOrders: number;
  deliveredOrders: number;
  returnedOrders: number;
  cancelledOrders: number;
  confirmationRate: number | null;
  deliveryRate: number | null;
  returnRate: number | null;
  deliveredRevenue: number;
  returnLosses: number;
  avgDeliveredOrderValue: number | null;
}

export interface ProductOperationalMetrics {
  productId: string;
  productName?: string;
  totalOrders: number;
  confirmedOrders: number;
  deliveredOrders: number;
  returnedOrders: number;
  confirmationRate: number | null;
  deliveryRate: number | null;
  returnRate: number | null;
  deliveredRevenue: number;
  returnLosses: number;
}

export interface CourierPerformanceMetrics {
  courierName: string;
  totalAssigned: number;
  delivered: number;
  returned: number;
  inTransit: number;
  deliveryRate: number | null;
  returnRate: number | null;
  totalCashCollected: number;
  totalReturnFees: number;
}

export interface GovernoratePerformanceMetrics {
  governorate: string;
  totalOrders: number;
  confirmed: number;
  delivered: number;
  returned: number;
  deliveryRate: number | null;
  returnRate: number | null;
  deliveredRevenue: number;
}

/**
 * Computes aggregate operational rates across an entire order collection (FR-30)
 */
export function calculateOperationalRates(
  orders: OperationalOrder[]
): OperationalRatesSummary {
  if (!orders || orders.length === 0) {
    return {
      totalOrders: 0,
      newOrders: 0,
      noAnswerOrders: 0,
      confirmedOrders: 0,
      dispatchedOrders: 0,
      deliveredOrders: 0,
      returnedOrders: 0,
      cancelledOrders: 0,
      confirmationRate: null,
      deliveryRate: null,
      returnRate: null,
      deliveredRevenue: 0,
      returnLosses: 0,
      avgDeliveredOrderValue: null,
    };
  }

  let newOrders = 0;
  let noAnswerOrders = 0;
  let confirmedDirect = 0;
  let dispatchedDirect = 0;
  let deliveredOrders = 0;
  let returnedOrders = 0;
  let cancelledOrders = 0;
  let deliveredRevenue = 0;
  let returnLosses = 0;

  for (const order of orders) {
    const totalAmount = Number(order.total_amount) || 0;
    const returnFee = order.return_fee !== null && order.return_fee !== undefined
      ? Number(order.return_fee)
      : 3.5;

    switch (order.status) {
      case "NEW_ORDER":
        newOrders++;
        break;
      case "NO_ANSWER":
        noAnswerOrders++;
        break;
      case "CONFIRMED":
        confirmedDirect++;
        break;
      case "DISPATCHED":
        dispatchedDirect++;
        break;
      case "DELIVERED":
        deliveredOrders++;
        deliveredRevenue += totalAmount;
        break;
      case "RETURNED":
        returnedOrders++;
        returnLosses += returnFee;
        break;
      case "CANCELLED":
        cancelledOrders++;
        break;
    }
  }

  // Confirmed pool includes all orders that passed confirmation
  const confirmedOrders = confirmedDirect + dispatchedDirect + deliveredOrders + returnedOrders;
  // Dispatched pool includes all orders handed to courier
  const dispatchedOrders = dispatchedDirect + deliveredOrders + returnedOrders;

  const confirmationRate = safeDivide(confirmedOrders, orders.length);
  const deliveryRate = safeDivide(
    deliveredOrders,
    dispatchedOrders > 0 ? dispatchedOrders : confirmedOrders
  );
  const returnRate = safeDivide(returnedOrders, dispatchedOrders);
  const avgDeliveredOrderValue = safeDivide(deliveredRevenue, deliveredOrders);

  return {
    totalOrders: orders.length,
    newOrders,
    noAnswerOrders,
    confirmedOrders,
    dispatchedOrders,
    deliveredOrders,
    returnedOrders,
    cancelledOrders,
    confirmationRate,
    deliveryRate,
    returnRate,
    deliveredRevenue: Math.round(deliveredRevenue * 1000) / 1000,
    returnLosses: Math.round(returnLosses * 1000) / 1000,
    avgDeliveredOrderValue:
      avgDeliveredOrderValue !== null
        ? Math.round(avgDeliveredOrderValue * 1000) / 1000
        : null,
  };
}

/**
 * Calculates operational rates grouped per product
 */
export function calculateProductOperationalRates(
  orders: OperationalOrder[],
  productNameMap?: Map<string, string>
): ProductOperationalMetrics[] {
  const groups = new Map<string, OperationalOrder[]>();

  for (const order of orders) {
    const list = groups.get(order.product_id) || [];
    list.push(order);
    groups.set(order.product_id, list);
  }

  const results: ProductOperationalMetrics[] = [];

  for (const [productId, productOrders] of groups.entries()) {
    const summary = calculateOperationalRates(productOrders);
    results.push({
      productId,
      productName: productNameMap?.get(productId) || "Unknown Product",
      totalOrders: summary.totalOrders,
      confirmedOrders: summary.confirmedOrders,
      deliveredOrders: summary.deliveredOrders,
      returnedOrders: summary.returnedOrders,
      confirmationRate: summary.confirmationRate,
      deliveryRate: summary.deliveryRate,
      returnRate: summary.returnRate,
      deliveredRevenue: summary.deliveredRevenue,
      returnLosses: summary.returnLosses,
    });
  }

  return results.sort((a, b) => b.deliveredRevenue - a.deliveredRevenue);
}

/**
 * Calculates operational performance metrics grouped by courier company
 */
export function calculateCourierPerformance(
  orders: OperationalOrder[]
): CourierPerformanceMetrics[] {
  const courierGroups = new Map<string, OperationalOrder[]>();

  for (const order of orders) {
    // Only count orders that have been assigned to a courier or dispatched
    if (order.courier_name || order.status === "DISPATCHED" || order.status === "DELIVERED" || order.status === "RETURNED") {
      const courier = order.courier_name || "Unassigned Courier";
      const list = courierGroups.get(courier) || [];
      list.push(order);
      courierGroups.set(courier, list);
    }
  }

  const results: CourierPerformanceMetrics[] = [];

  for (const [courierName, courierOrders] of courierGroups.entries()) {
    let delivered = 0;
    let returned = 0;
    let inTransit = 0;
    let totalCash = 0;
    let totalReturnFees = 0;

    for (const order of courierOrders) {
      const amount = Number(order.total_amount) || 0;
      const fee = order.return_fee !== null && order.return_fee !== undefined
        ? Number(order.return_fee)
        : 3.5;

      if (order.status === "DELIVERED") {
        delivered++;
        totalCash += amount;
      } else if (order.status === "RETURNED") {
        returned++;
        totalReturnFees += fee;
      } else if (order.status === "DISPATCHED") {
        inTransit++;
      }
    }

    const totalHandled = delivered + returned + inTransit;
    const completedShipments = delivered + returned;

    const deliveryRate = safeDivide(delivered, completedShipments > 0 ? completedShipments : totalHandled);
    const returnRate = safeDivide(returned, completedShipments > 0 ? completedShipments : totalHandled);

    results.push({
      courierName,
      totalAssigned: courierOrders.length,
      delivered,
      returned,
      inTransit,
      deliveryRate,
      returnRate,
      totalCashCollected: Math.round(totalCash * 1000) / 1000,
      totalReturnFees: Math.round(totalReturnFees * 1000) / 1000,
    });
  }

  return results.sort((a, b) => b.delivered - a.delivered);
}

/**
 * Calculates operational performance metrics grouped by Tunisian Governorate
 */
export function calculateGovernoratePerformance(
  orders: OperationalOrder[]
): GovernoratePerformanceMetrics[] {
  const govGroups = new Map<string, OperationalOrder[]>();

  for (const order of orders) {
    const gov = order.governorate || "Unknown";
    const list = govGroups.get(gov) || [];
    list.push(order);
    govGroups.set(gov, list);
  }

  const results: GovernoratePerformanceMetrics[] = [];

  for (const [governorate, govOrders] of govGroups.entries()) {
    const summary = calculateOperationalRates(govOrders);
    results.push({
      governorate,
      totalOrders: summary.totalOrders,
      confirmed: summary.confirmedOrders,
      delivered: summary.deliveredOrders,
      returned: summary.returnedOrders,
      deliveryRate: summary.deliveryRate,
      returnRate: summary.returnRate,
      deliveredRevenue: summary.deliveredRevenue,
    });
  }

  return results.sort((a, b) => b.totalOrders - a.totalOrders);
}
