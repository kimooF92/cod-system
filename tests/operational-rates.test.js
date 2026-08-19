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

function calculateOperationalRates(orders) {
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

  const confirmedOrders = confirmedDirect + dispatchedDirect + deliveredOrders + returnedOrders;
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

function calculateCourierPerformance(orders) {
  const courierGroups = new Map();

  for (const order of orders) {
    if (order.courier_name || order.status === "DISPATCHED" || order.status === "DELIVERED" || order.status === "RETURNED") {
      const courier = order.courier_name || "Unassigned Courier";
      const list = courierGroups.get(courier) || [];
      list.push(order);
      courierGroups.set(courier, list);
    }
  }

  const results = [];

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

    const completedShipments = delivered + returned;
    const totalHandled = completedShipments + inTransit;

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

test("calculateOperationalRates handles empty array with null rates safely", () => {
  const res = calculateOperationalRates([]);
  assert.equal(res.totalOrders, 0);
  assert.equal(res.confirmationRate, null);
  assert.equal(res.deliveryRate, null);
  assert.equal(res.returnRate, null);
  assert.equal(res.deliveredRevenue, 0);
  assert.equal(res.returnLosses, 0);
});

test("calculateOperationalRates computes accurate rates for a mixed dataset", () => {
  const sampleOrders = [
    { id: "1", product_id: "p1", governorate: "Tunis", status: "NEW_ORDER", total_amount: 50 },
    { id: "2", product_id: "p1", governorate: "Tunis", status: "NO_ANSWER", total_amount: 50 },
    { id: "3", product_id: "p1", governorate: "Sousse", status: "CONFIRMED", total_amount: 50 },
    { id: "4", product_id: "p1", governorate: "Sousse", status: "DISPATCHED", total_amount: 60 },
    { id: "5", product_id: "p1", governorate: "Sfax", status: "DELIVERED", total_amount: 70 },
    { id: "6", product_id: "p1", governorate: "Sfax", status: "DELIVERED", total_amount: 80 },
    { id: "7", product_id: "p1", governorate: "Bizerte", status: "RETURNED", total_amount: 50, return_fee: 3.5 },
    { id: "8", product_id: "p1", governorate: "Ariana", status: "CANCELLED", total_amount: 50 },
  ];

  const res = calculateOperationalRates(sampleOrders);

  // Total: 8
  assert.equal(res.totalOrders, 8);
  // Confirmed pool: CONFIRMED(1) + DISPATCHED(1) + DELIVERED(2) + RETURNED(1) = 5
  assert.equal(res.confirmedOrders, 5);
  // Confirmation rate: 5 / 8 = 0.625 (62.5%)
  assert.equal(res.confirmationRate, 0.625);

  // Dispatched pool: DISPATCHED(1) + DELIVERED(2) + RETURNED(1) = 4
  assert.equal(res.dispatchedOrders, 4);
  // Delivery rate: 2 / 4 = 0.5 (50%)
  assert.equal(res.deliveryRate, 0.5);
  // Return rate: 1 / 4 = 0.25 (25%)
  assert.equal(res.returnRate, 0.25);

  // Delivered revenue: 70 + 80 = 150
  assert.equal(res.deliveredRevenue, 150);
  // Return losses: 3.500
  assert.equal(res.returnLosses, 3.5);
  // Avg delivered: 150 / 2 = 75
  assert.equal(res.avgDeliveredOrderValue, 75);
});

test("calculateCourierPerformance groups metrics per courier correctly", () => {
  const sampleOrders = [
    { id: "1", courier_name: "Aramex Tunisia", status: "DELIVERED", total_amount: 100 },
    { id: "2", courier_name: "Aramex Tunisia", status: "DELIVERED", total_amount: 80 },
    { id: "3", courier_name: "Aramex Tunisia", status: "RETURNED", total_amount: 50, return_fee: 3.5 },
    { id: "4", courier_name: "First Delivery Express", status: "DELIVERED", total_amount: 60 },
    { id: "5", courier_name: "First Delivery Express", status: "DISPATCHED", total_amount: 60 },
  ];

  const res = calculateCourierPerformance(sampleOrders);
  assert.equal(res.length, 2);

  const aramex = res.find((c) => c.courierName === "Aramex Tunisia");
  assert.ok(aramex);
  assert.equal(aramex.totalAssigned, 3);
  assert.equal(aramex.delivered, 2);
  assert.equal(aramex.returned, 1);
  assert.equal(aramex.totalCashCollected, 180);
  assert.equal(aramex.totalReturnFees, 3.5);
  // 2 delivered / 3 completed = 0.666...
  assert.equal(Math.round((aramex.deliveryRate || 0) * 100), 67);
});
