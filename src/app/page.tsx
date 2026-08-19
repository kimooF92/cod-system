import { StatCard } from "@/components/ui/stat-card";
import { DecisionBadge } from "@/components/ui/decision-badge";
import { DailyChecklist } from "@/components/dashboard/daily-checklist";
import { StreakTracker } from "@/components/dashboard/streak-tracker";
import { getDashboardKPIs } from "@/actions/dashboard";
import { getProducts } from "@/actions/products";
import { formatCurrency, formatPercent } from "@/lib/utils";
import {
  DollarSign,
  TrendingUp,
  Truck,
  Percent,
  AlertTriangle,
  ArrowRight,
  Package,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";

export const revalidate = 60; // Revalidate every 60s

export default async function DashboardPage() {
  const [kpis, products] = await Promise.all([
    getDashboardKPIs(),
    getProducts(),
  ]);

  const topProducts = products
    .filter((p) => ["WINNER", "SCALING", "TESTING"].includes(p.status))
    .slice(0, 4);

  const decisionsNeeded = products.filter(
    (p) => p.status === "HOLD" || p.status === "TESTING"
  ).length;

  const pendingOrders = kpis.newOrdersCount;

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Ritual Header */}
      <div className="bg-surface border border-border rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Morning Operating Cockpit
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {pendingOrders > 0
              ? `${pendingOrders} order${pendingOrders > 1 ? "s" : ""} need confirmation`
              : "All orders processed"}{" "}
            &bull;{" "}
            {decisionsNeeded > 0
              ? `${decisionsNeeded} product decision${decisionsNeeded > 1 ? "s" : ""} pending`
              : "No decisions pending"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {decisionsNeeded > 0 && (
            <Link
              href="/products"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-400 hover:bg-amber-500/15 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{decisionsNeeded} Decision{decisionsNeeded > 1 ? "s" : ""} Needed</span>
            </Link>
          )}
          {/* Live Streak — client component */}
          <StreakTracker />
        </div>
      </div>

      {/* KPI Stats Grid — Live Data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today Net Profit"
          value={formatCurrency(kpis.todayNetProfit)}
          delta={
            kpis.todayNetProfit > 0
              ? `+${kpis.deliveredCount} delivered`
              : kpis.todayNetProfit === 0
              ? "No data yet"
              : "Negative"
          }
          deltaType={
            kpis.todayNetProfit > 0
              ? "positive"
              : kpis.todayNetProfit === 0
              ? "neutral"
              : "negative"
          }
          subtext="After ad spend, product & delivery costs"
          icon={<DollarSign className="w-4 h-4" />}
        />
        <StatCard
          label="Ad Spend Today"
          value={formatCurrency(kpis.todayAdSpend)}
          delta={kpis.todayCPL !== null ? `CPL ${formatCurrency(kpis.todayCPL)}` : "No ads logged"}
          deltaType={
            kpis.todayCPL !== null && kpis.todayCPL <= 5 ? "positive" : "neutral"
          }
          subtext={`${kpis.todayLeads} total leads generated`}
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <StatCard
          label="Delivery Rate"
          value={
            kpis.deliveryRate !== null
              ? formatPercent(kpis.deliveryRate)
              : "—"
          }
          delta={
            kpis.deliveryRate !== null
              ? kpis.deliveryRate >= 0.65
                ? "Above target"
                : "Below target"
              : "No deliveries"
          }
          deltaType={
            kpis.deliveryRate === null
              ? "neutral"
              : kpis.deliveryRate >= 0.65
              ? "positive"
              : "warning"
          }
          subtext={`${kpis.deliveredCount} of ${kpis.deliveredCount + kpis.returnedCount} delivered`}
          icon={<Truck className="w-4 h-4" />}
        />
        <StatCard
          label="Profit / Delivered"
          value={
            kpis.profitPerDeliveredOrder !== null
              ? formatCurrency(kpis.profitPerDeliveredOrder)
              : "—"
          }
          delta={
            kpis.profitPerDeliveredOrder !== null
              ? kpis.profitPerDeliveredOrder >= 10
                ? "Healthy"
                : kpis.profitPerDeliveredOrder > 0
                ? "Low margin"
                : "Loss"
              : "No data"
          }
          deltaType={
            kpis.profitPerDeliveredOrder === null
              ? "neutral"
              : kpis.profitPerDeliveredOrder >= 10
              ? "positive"
              : kpis.profitPerDeliveredOrder > 0
              ? "warning"
              : "negative"
          }
          subtext={`${kpis.deliveredCount} delivered orders`}
          icon={<Percent className="w-4 h-4" />}
        />
      </div>

      {/* Two Column Layout: Daily Checklist (Retention) + Product Scoreboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Habit Checklist — Client Component with localStorage */}
        <DailyChecklist />

        {/* Product Scoreboard — Live Data */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Product Scoreboard
              </h3>
              <p className="text-xs text-muted-foreground">
                Active Winners &bull; Needs Decision &bull; Testing
              </p>
            </div>
            <Link
              href="/products"
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
            >
              <span>View All Products</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {topProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-subtle border border-border flex items-center justify-center text-muted-foreground">
                <Package className="w-5 h-5" />
              </div>
              <p className="text-xs text-muted-foreground">
                No active products yet.{" "}
                <Link href="/products" className="text-blue-400 hover:underline">
                  Add your first product →
                </Link>
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border text-muted-foreground uppercase font-mono text-[10px]">
                    <th className="pb-2 font-medium">Product</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium text-right">Price</th>
                    <th className="pb-2 font-medium text-right">Target CPL</th>
                    <th className="pb-2 font-medium text-right">Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {topProducts.map((p) => {
                    const decisionVariant =
                      p.status === "WINNER" || p.status === "SCALING"
                        ? "scale"
                        : p.status === "TESTING"
                        ? "investigate"
                        : "hold";

                    const statusColor =
                      p.status === "WINNER" || p.status === "SCALING"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : p.status === "TESTING"
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20";

                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-surface-subtle/50 transition-colors"
                      >
                        <td className="py-2.5 font-medium text-foreground max-w-[160px] truncate">
                          {p.name}
                        </td>
                        <td className="py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded border font-mono text-[10px] ${statusColor}`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-mono tabular-nums">
                          {formatCurrency(p.selling_price)}
                        </td>
                        <td className="py-2.5 text-right font-mono tabular-nums text-muted-foreground">
                          {formatCurrency(p.target_cpl)}
                        </td>
                        <td className="py-2.5 text-right">
                          <DecisionBadge variant={decisionVariant as any} size="sm">
                            {p.status === "WINNER" || p.status === "SCALING"
                              ? "SCALE"
                              : p.status === "TESTING"
                              ? "WATCH"
                              : "DECIDE"}
                          </DecisionBadge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Quick Links Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: "/orders", icon: ShoppingBag, label: "Orders", count: kpis.newOrdersCount, color: "text-emerald-400", countLabel: "new" },
          { href: "/products", icon: Package, label: "Products", count: decisionsNeeded, color: "text-amber-400", countLabel: "need decision" },
          { href: "/analytics", icon: TrendingUp, label: "Analytics", count: kpis.todayLeads, color: "text-blue-400", countLabel: "leads today" },
          { href: "/research", icon: AlertTriangle, label: "Research", count: null, color: "text-purple-400", countLabel: "" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="bg-surface border border-border rounded-lg p-4 flex flex-col gap-2 hover:border-muted-foreground/30 transition-all group"
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-4 h-4 ${item.color}`} />
                {item.count !== null && item.count > 0 && (
                  <span className={`text-[10px] font-mono font-bold ${item.color}`}>
                    {item.count} {item.countLabel}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium text-foreground group-hover:text-foreground">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
