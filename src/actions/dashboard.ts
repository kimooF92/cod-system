"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getOrders } from "./orders";
import { getAdPerformanceRecords } from "./ad-performance";
import { getProducts } from "./products";

export interface DashboardKPIs {
  // Revenue & Profit
  todayNetProfit: number;
  todayAdSpend: number;
  todayLeads: number;
  todayCPL: number | null;
  // Orders
  totalOrders: number;
  newOrdersCount: number;
  confirmedCount: number;
  deliveredCount: number;
  returnedCount: number;
  deliveryRate: number | null;
  profitPerDeliveredOrder: number | null;
  // Decisions
  decisionsNeeded: number;
  // Meta for UI
  hasData: boolean;
}

/**
 * Aggregates live KPIs for the morning dashboard cockpit.
 * Uses today's date in UTC+1 (Tunisia local time) for filtering. Falls back gracefully to in-memory data.
 */
export async function getDashboardKPIs(): Promise<DashboardKPIs> {
  // Use UTC+1 (Tunisia local time) so the day boundary is midnight Tunis, not UTC midnight
  const nowUTCPlus1 = new Date(Date.now() + 60 * 60 * 1000);
  const today = nowUTCPlus1.toISOString().split("T")[0]; // YYYY-MM-DD in UTC+1

  // Fetch all data in parallel
  const [allOrders, adPerformance, products] = await Promise.all([
    getOrders(),
    getAdPerformanceRecords({ startDate: today, endDate: today }),
    getProducts(),
  ]);

  // --- Orders KPIs ---
  const totalOrders = allOrders.length;
  const newOrdersCount = allOrders.filter((o) => o.status === "NEW_ORDER").length;
  const confirmedCount = allOrders.filter((o) => o.status === "CONFIRMED").length;
  const deliveredCount = allOrders.filter((o) => o.status === "DELIVERED").length;
  const returnedCount = allOrders.filter((o) => o.status === "RETURNED").length;

  const deliveryAttempts = deliveredCount + returnedCount;
  const deliveryRate = deliveryAttempts > 0 ? deliveredCount / deliveryAttempts : null;

  // --- Ad Spend KPIs ---
  const todayAdSpend = adPerformance.reduce((sum, r) => sum + r.spend, 0);
  const todayLeads = adPerformance.reduce((sum, r) => sum + r.leads, 0);
  const todayCPL = todayLeads > 0 ? todayAdSpend / todayLeads : null;

  // --- Profit calculation ---
  // For delivered orders: revenue - product cost - delivery cost - return cost load - ad spend load
  let totalRevenue = 0;
  let totalCOGS = 0;
  let totalDeliveryCost = 0;

  allOrders
    .filter((o) => o.status === "DELIVERED")
    .forEach((o) => {
      totalRevenue += o.total_amount;
      if (o.product) {
        totalCOGS +=
          (o.product.product_cost +
            o.product.packaging_cost +
            o.product.other_fulfillment_cost) *
          o.quantity;
        totalDeliveryCost += o.product.delivery_cost;
      }
    });

  const grossProfit = totalRevenue - totalCOGS - totalDeliveryCost;
  const todayNetProfit = grossProfit - todayAdSpend;
  const profitPerDeliveredOrder =
    deliveredCount > 0 ? todayNetProfit / deliveredCount : null;

  // --- Decisions needed ---
  // Products in TESTING or HOLD status with a score that needs a call
  const decisionsNeeded = products.filter(
    (p) => p.status === "HOLD" || p.status === "TESTING"
  ).length;

  const hasData = totalOrders > 0 || adPerformance.length > 0;

  return {
    todayNetProfit,
    todayAdSpend,
    todayLeads,
    todayCPL,
    totalOrders,
    newOrdersCount,
    confirmedCount,
    deliveredCount,
    returnedCount,
    deliveryRate,
    profitPerDeliveredOrder,
    decisionsNeeded,
    hasData,
  };
}
