"use client";

import * as React from "react";
import {
  TrendingUp,
  Truck,
  CheckCircle2,
  RotateCcw,
  DollarSign,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Package,
} from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils";
import {
  calculateOperationalRates,
  calculateCourierPerformance,
  calculateProductOperationalRates,
  calculateGovernoratePerformance,
  type OperationalOrder,
  type OperationalRatesSummary,
  type CourierPerformanceMetrics,
  type ProductOperationalMetrics,
  type GovernoratePerformanceMetrics,
} from "@/lib/engine/operational-rates";
import type { Product } from "@/actions/products";

interface OperationalRatesBarProps {
  orders: OperationalOrder[];
  products?: Product[];
}

export function OperationalRatesBar({ orders, products = [] }: OperationalRatesBarProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"couriers" | "products" | "governorates">("couriers");

  const productMap = React.useMemo(() => {
    return new Map(products.map((p) => [p.id, p.name]));
  }, [products]);

  const summary: OperationalRatesSummary = React.useMemo(() => {
    return calculateOperationalRates(orders);
  }, [orders]);

  const courierStats: CourierPerformanceMetrics[] = React.useMemo(() => {
    return calculateCourierPerformance(orders);
  }, [orders]);

  const productStats: ProductOperationalMetrics[] = React.useMemo(() => {
    return calculateProductOperationalRates(orders, productMap);
  }, [orders, productMap]);

  const governorateStats: GovernoratePerformanceMetrics[] = React.useMemo(() => {
    return calculateGovernoratePerformance(orders);
  }, [orders]);

  // Color helper for confirmation rate
  const getConfirmationColor = (rate: number | null) => {
    if (rate === null) return "text-muted-foreground";
    if (rate >= 0.8) return "text-emerald-400";
    if (rate >= 0.65) return "text-amber-400";
    return "text-red-400";
  };

  // Color helper for delivery rate
  const getDeliveryColor = (rate: number | null) => {
    if (rate === null) return "text-muted-foreground";
    if (rate >= 0.75) return "text-emerald-400";
    if (rate >= 0.6) return "text-amber-400";
    return "text-red-400";
  };

  // Color helper for return rate
  const getReturnColor = (rate: number | null) => {
    if (rate === null) return "text-muted-foreground";
    if (rate <= 0.12) return "text-emerald-400";
    if (rate <= 0.2) return "text-amber-400";
    return "text-red-400";
  };

  return (
    <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden mb-6">
      {/* Primary KPI Row */}
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 items-center">
        {/* Total Intakes */}
        <div className="space-y-1">
          <span className="text-[11px] font-medium text-muted-foreground">Total Intakes</span>
          <p className="text-xl font-mono font-bold text-foreground tabular-nums">
            {summary.totalOrders}
          </p>
        </div>

        {/* Confirmation Rate */}
        <div className="space-y-1 border-l border-border/50 pl-4">
          <span className="text-[11px] font-medium text-muted-foreground">Confirmation Rate</span>
          <p className={`text-xl font-mono font-bold tabular-nums ${getConfirmationColor(summary.confirmationRate)}`}>
            {formatPercent(summary.confirmationRate)}
          </p>
          <span className="text-[10px] text-muted-foreground font-mono">
            {summary.confirmedOrders} confirmed
          </span>
        </div>

        {/* Delivery Rate */}
        <div className="space-y-1 border-l border-border/50 pl-4">
          <span className="text-[11px] font-medium text-muted-foreground">Delivery Rate</span>
          <p className={`text-xl font-mono font-bold tabular-nums ${getDeliveryColor(summary.deliveryRate)}`}>
            {formatPercent(summary.deliveryRate)}
          </p>
          <span className="text-[10px] text-muted-foreground font-mono">
            {summary.deliveredOrders} delivered
          </span>
        </div>

        {/* Return Rate */}
        <div className="space-y-1 border-l border-border/50 pl-4">
          <span className="text-[11px] font-medium text-muted-foreground">Return Rate</span>
          <p className={`text-xl font-mono font-bold tabular-nums ${getReturnColor(summary.returnRate)}`}>
            {formatPercent(summary.returnRate)}
          </p>
          <span className="text-[10px] text-muted-foreground font-mono">
            {summary.returnedOrders} returned
          </span>
        </div>

        {/* Delivered Revenue */}
        <div className="space-y-1 border-l border-border/50 pl-4">
          <span className="text-[11px] font-medium text-muted-foreground">Delivered COD Cash</span>
          <p className="text-xl font-mono font-bold text-emerald-400 tabular-nums">
            {formatCurrency(summary.deliveredRevenue)}
          </p>
          <span className="text-[10px] text-muted-foreground font-mono">
            Avg: {summary.avgDeliveredOrderValue !== null ? formatCurrency(summary.avgDeliveredOrderValue) : "—"}
          </span>
        </div>

        {/* Return Loss & Drilldown Toggle */}
        <div className="flex items-center justify-between border-l border-border/50 pl-4">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground">Return Loss</span>
            <p className="text-xl font-mono font-bold text-red-400 tabular-nums">
              -{formatCurrency(summary.returnLosses)}
            </p>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg border border-border bg-surface-subtle hover:bg-surface text-muted-foreground hover:text-foreground transition-colors ml-2"
            title={isExpanded ? "Collapse breakdown" : "Expand fulfillment drilldowns"}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Drilldown Panel */}
      {isExpanded && (
        <div className="border-t border-border bg-surface-subtle/50 p-4 space-y-4 animate-in fade-in duration-150">
          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <button
              onClick={() => setActiveTab("couriers")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                activeTab === "couriers"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface"
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Courier Performance ({courierStats.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("products")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                activeTab === "products"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface"
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Product Fulfillment ({productStats.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("governorates")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                activeTab === "governorates"
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Governorate Breakdown ({governorateStats.length})</span>
            </button>
          </div>

          {/* Courier Performance Tab */}
          {activeTab === "couriers" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-surface text-muted-foreground text-[10px] uppercase border-b border-border">
                  <tr>
                    <th className="py-2 px-3">Courier Partner</th>
                    <th className="py-2 px-3 text-right">Assigned</th>
                    <th className="py-2 px-3 text-right">Delivered</th>
                    <th className="py-2 px-3 text-right">Returned</th>
                    <th className="py-2 px-3 text-right">In Transit</th>
                    <th className="py-2 px-3 text-right">Delivery Rate</th>
                    <th className="py-2 px-3 text-right">Return Rate</th>
                    <th className="py-2 px-3 text-right">Cash Collected</th>
                    <th className="py-2 px-3 text-right">Return Fees</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {courierStats.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-6 text-center text-muted-foreground">
                        No courier shipments recorded yet.
                      </td>
                    </tr>
                  ) : (
                    courierStats.map((c) => (
                      <tr key={c.courierName} className="hover:bg-surface/60 transition-colors">
                        <td className="py-2 px-3 font-semibold text-foreground flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-amber-400" />
                          <span>{c.courierName}</span>
                        </td>
                        <td className="py-2 px-3 text-right tabular-nums">{c.totalAssigned}</td>
                        <td className="py-2 px-3 text-right font-bold text-emerald-400 tabular-nums">
                          {c.delivered}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-red-400 tabular-nums">
                          {c.returned}
                        </td>
                        <td className="py-2 px-3 text-right text-muted-foreground tabular-nums">
                          {c.inTransit}
                        </td>
                        <td className={`py-2 px-3 text-right font-bold tabular-nums ${getDeliveryColor(c.deliveryRate)}`}>
                          {formatPercent(c.deliveryRate)}
                        </td>
                        <td className={`py-2 px-3 text-right font-bold tabular-nums ${getReturnColor(c.returnRate)}`}>
                          {formatPercent(c.returnRate)}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-emerald-400 tabular-nums">
                          {formatCurrency(c.totalCashCollected)}
                        </td>
                        <td className="py-2 px-3 text-right text-red-400 tabular-nums">
                          -{formatCurrency(c.totalReturnFees)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Product Fulfillment Tab */}
          {activeTab === "products" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-surface text-muted-foreground text-[10px] uppercase border-b border-border">
                  <tr>
                    <th className="py-2 px-3">Product Name</th>
                    <th className="py-2 px-3 text-right">Orders</th>
                    <th className="py-2 px-3 text-right">Confirmed</th>
                    <th className="py-2 px-3 text-right">Confirmation Rate</th>
                    <th className="py-2 px-3 text-right">Delivered</th>
                    <th className="py-2 px-3 text-right">Returned</th>
                    <th className="py-2 px-3 text-right">Delivery Rate</th>
                    <th className="py-2 px-3 text-right">Delivered Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {productStats.map((p) => (
                    <tr key={p.productId} className="hover:bg-surface/60 transition-colors">
                      <td className="py-2 px-3 font-semibold text-foreground">
                        {p.productName}
                      </td>
                      <td className="py-2 px-3 text-right tabular-nums">{p.totalOrders}</td>
                      <td className="py-2 px-3 text-right tabular-nums">{p.confirmedOrders}</td>
                      <td className={`py-2 px-3 text-right font-bold tabular-nums ${getConfirmationColor(p.confirmationRate)}`}>
                        {formatPercent(p.confirmationRate)}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-400 tabular-nums">
                        {p.deliveredOrders}
                      </td>
                      <td className="py-2 px-3 text-right text-red-400 tabular-nums">
                        {p.returnedOrders}
                      </td>
                      <td className={`py-2 px-3 text-right font-bold tabular-nums ${getDeliveryColor(p.deliveryRate)}`}>
                        {formatPercent(p.deliveryRate)}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-400 tabular-nums">
                        {formatCurrency(p.deliveredRevenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Governorate Breakdown Tab */}
          {activeTab === "governorates" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-surface text-muted-foreground text-[10px] uppercase border-b border-border">
                  <tr>
                    <th className="py-2 px-3">Tunisian Governorate</th>
                    <th className="py-2 px-3 text-right">Total Orders</th>
                    <th className="py-2 px-3 text-right">Confirmed</th>
                    <th className="py-2 px-3 text-right">Delivered</th>
                    <th className="py-2 px-3 text-right">Returned</th>
                    <th className="py-2 px-3 text-right">Delivery Rate</th>
                    <th className="py-2 px-3 text-right">Delivered Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {governorateStats.map((g) => (
                    <tr key={g.governorate} className="hover:bg-surface/60 transition-colors">
                      <td className="py-2 px-3 font-semibold text-foreground flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-400" />
                        <span>{g.governorate}</span>
                      </td>
                      <td className="py-2 px-3 text-right tabular-nums">{g.totalOrders}</td>
                      <td className="py-2 px-3 text-right tabular-nums">{g.confirmed}</td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-400 tabular-nums">
                        {g.delivered}
                      </td>
                      <td className="py-2 px-3 text-right text-red-400 tabular-nums">
                        {g.returned}
                      </td>
                      <td className={`py-2 px-3 text-right font-bold tabular-nums ${getDeliveryColor(g.deliveryRate)}`}>
                        {formatPercent(g.deliveryRate)}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-400 tabular-nums">
                        {formatCurrency(g.deliveredRevenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
