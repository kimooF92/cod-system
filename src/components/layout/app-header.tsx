"use client";

import * as React from "react";
import { Sun, Moon, Calendar, ShieldCheck } from "lucide-react";
import { QuickCreateMenu } from "./quick-create-menu";

interface AppHeaderProps {
  title?: string;
}

export function AppHeader({ title = "Operations Cockpit" }: AppHeaderProps) {
  const [theme, setTheme] = React.useState<"dark" | "light">("dark");

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.classList.toggle("light", nextTheme === "light");
  };

  return (
    <header className="h-14 bg-surface border-b border-border px-6 flex items-center justify-between sticky top-0 z-20">
      {/* View Title */}
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400 font-medium">
          <ShieldCheck className="w-3 h-3" />
          <span>Single-Operator Mode</span>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3">
        {/* Quick Date Range Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-subtle border border-border text-xs text-muted-foreground font-mono">
          <Calendar className="w-3.5 h-3.5" />
          <span>Today (Default)</span>
        </div>

        {/* Quick Create — wired to global context */}
        <QuickCreateMenu />

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-subtle border border-transparent hover:border-border transition-colors"
          title="Toggle Light/Dark Theme"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>
      </div>
    </header>
  );
}
