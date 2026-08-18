import { StatCard } from "@/components/ui/stat-card";
import { DecisionBadge } from "@/components/ui/decision-badge";
import { formatCurrency, formatPercent } from "@/lib/utils";
import {
  DollarSign,
  TrendingUp,
  Users,
  ShoppingBag,
  Truck,
  Percent,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Ritual Header */}
      <div className="bg-surface border border-border rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Morning Operating Cockpit
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            4 daily checklist actions remaining for today &bull; 1 pending product decision
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>1 Decision Needed</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-subtle border border-border text-xs font-mono text-muted-foreground">
            <span>🔥 5-Day Streak</span>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid (FR-1) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Delivered Net Profit"
          value={formatCurrency(142.5)}
          delta="+18% vs Target"
          deltaType="positive"
          subtext="After ad spend, product & delivery costs"
          icon={<DollarSign className="w-4 h-4" />}
        />
        <StatCard
          label="Ad Spend"
          value={formatCurrency(85.0)}
          delta="CPL 3.400 DT"
          deltaType="positive"
          subtext="25 total leads generated"
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <StatCard
          label="Delivery Rate"
          value={formatPercent(0.685)}
          delta="Target: 65%"
          deltaType="positive"
          subtext="14 of 20 confirmed orders delivered"
          icon={<Truck className="w-4 h-4" />}
        />
        <StatCard
          label="Profit / Delivered Order"
          value={formatCurrency(10.178)}
          delta="Healthy"
          deltaType="positive"
          subtext="14 delivered orders"
          icon={<Percent className="w-4 h-4" />}
        />
      </div>

      {/* Two Column Layout: Daily Checklist (Retention) + Decision Inbox */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Habit Checklist (FR-5, UX-DR-3) */}
        <div className="bg-surface border border-border rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">
                Daily Operating Checklist
              </h3>
              <span className="text-xs font-mono text-muted-foreground">
                0 / 4 completed
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-surface-subtle rounded-full h-1.5 mb-4 overflow-hidden border border-border">
              <div className="bg-blue-600 h-1.5 rounded-full w-0 transition-all duration-300" />
            </div>

            <ul className="space-y-2.5">
              {[
                { text: "Review yesterday ad spend & profit", href: "/analytics" },
                { text: "Process pending order confirmations (5 orders)", href: "/orders" },
                { text: "Update courier delivered / returned status", href: "/orders" },
                { text: "Review Kill / Hold / Scale recommendations", href: "/products" },
              ].map((task, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-md bg-surface-subtle border border-border/60 hover:border-border transition-colors text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded border border-muted-foreground/40 flex items-center justify-center cursor-pointer hover:border-blue-500" />
                    <span className="text-foreground">{task.text}</span>
                  </div>
                  <Link
                    href={task.href}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 pt-3 border-t border-border/50 text-[11px] text-muted-foreground flex items-center justify-between font-mono">
            <span>Morning Review Loop</span>
            <span>Target: &lt; 10 min</span>
          </div>
        </div>

        {/* Product Scoreboard Preview (FR-2, FR-3) */}
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

          {/* High-Density Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border text-muted-foreground uppercase font-mono text-[10px]">
                  <th className="pb-2 font-medium">Product</th>
                  <th className="pb-2 font-medium">Score</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium text-right">Leads</th>
                  <th className="pb-2 font-medium text-right">CPL</th>
                  <th className="pb-2 font-medium text-right">Delivery %</th>
                  <th className="pb-2 font-medium text-right">Net Profit</th>
                  <th className="pb-2 font-medium text-right">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                <tr className="hover:bg-surface-subtle/50 transition-colors">
                  <td className="py-2.5 font-medium text-foreground">
                    Magnetic Phone Holder Pro
                  </td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono text-[10px] font-bold">
                      89 / 100
                    </span>
                  </td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px]">
                      WINNER
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-mono tabular-nums">48</td>
                  <td className="py-2.5 text-right font-mono tabular-nums">3.200 DT</td>
                  <td className="py-2.5 text-right font-mono tabular-nums text-emerald-400">72.4%</td>
                  <td className="py-2.5 text-right font-mono tabular-nums text-emerald-400 font-semibold">
                    +340.000 DT
                  </td>
                  <td className="py-2.5 text-right">
                    <DecisionBadge variant="scale" size="sm">
                      SCALE
                    </DecisionBadge>
                  </td>
                </tr>

                <tr className="hover:bg-surface-subtle/50 transition-colors">
                  <td className="py-2.5 font-medium text-foreground">
                    Wireless Earbuds V2
                  </td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-mono text-[10px]">
                      38 / 100
                    </span>
                  </td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono text-[10px]">
                      TESTING
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-mono tabular-nums">32</td>
                  <td className="py-2.5 text-right font-mono tabular-nums text-red-400">7.500 DT</td>
                  <td className="py-2.5 text-right font-mono tabular-nums text-amber-400">45.0%</td>
                  <td className="py-2.5 text-right font-mono tabular-nums text-red-400">
                    -48.000 DT
                  </td>
                  <td className="py-2.5 text-right">
                    <DecisionBadge variant="kill" size="sm">
                      KILL
                    </DecisionBadge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
