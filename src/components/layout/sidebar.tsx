"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FlaskConical,
  Sparkles,
  ShoppingBag,
  Wallet,
  LineChart,
  Search,
  CalendarCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  shortcut?: string;
  badge?: number | string;
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, shortcut: "g d" },
  { name: "Products", href: "/products", icon: Package, shortcut: "g p" },
  { name: "Testing", href: "/testing", icon: FlaskConical, shortcut: "g t" },
  { name: "Creatives", href: "/creatives", icon: Sparkles, shortcut: "g c" },
  { name: "Orders", href: "/orders", icon: ShoppingBag, shortcut: "g o" },
  { name: "Finance", href: "/finance", icon: Wallet, shortcut: "g f" },
  { name: "Analytics", href: "/analytics", icon: LineChart, shortcut: "g a" },
  { name: "Research", href: "/research", icon: Search, shortcut: "g r" },
  { name: "Monthly Review", href: "/monthly-review", icon: CalendarCheck, shortcut: "g m" },
  { name: "Settings", href: "/settings", icon: Settings, shortcut: "g s" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 flex flex-col bg-surface border-r border-border transition-all duration-200 z-30 select-none",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-sm tracking-tight text-foreground truncate">
                COD Growth OS
              </span>
              <span className="text-[10px] text-muted-foreground font-mono truncate">
                Tunisia Edition
              </span>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="w-7 h-7 mx-auto rounded-md bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            <TrendingUp className="w-4 h-4" />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-subtle transition-colors",
            collapsed && "hidden"
          )}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all group relative",
                isActive
                  ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-subtle border border-transparent"
              )}
              title={collapsed ? `${item.name} (${item.shortcut})` : undefined}
            >
              <Icon
                className={cn(
                  "w-4 h-4 flex-shrink-0 transition-colors",
                  isActive ? "text-blue-400" : "text-muted-foreground group-hover:text-foreground"
                )}
              />

              {!collapsed && (
                <span className="flex-1 truncate">{item.name}</span>
              )}

              {!collapsed && item.shortcut && (
                <span className="text-[10px] font-mono text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.shortcut}
                </span>
              )}

              {collapsed && (
                <span className="sr-only">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Toggle for collapsed state */}
      {collapsed && (
        <div className="p-2 border-t border-border flex justify-center">
          <button
            onClick={() => setCollapsed(false)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-subtle transition-colors"
            title="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </aside>
  );
}
