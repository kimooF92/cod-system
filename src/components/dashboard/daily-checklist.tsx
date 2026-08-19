"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2, Circle, ArrowRight, Trophy } from "lucide-react";

const TODAY_KEY = () => `cod-checklist-${new Date().toISOString().split("T")[0]}`;

const CHECKLIST_ITEMS = [
  { id: "review-spend", text: "Review yesterday ad spend & profit", href: "/analytics" },
  { id: "process-orders", text: "Process pending order confirmations", href: "/orders" },
  { id: "courier-status", text: "Update courier delivered / returned status", href: "/orders" },
  { id: "product-decisions", text: "Review Kill / Hold / Scale recommendations", href: "/products" },
];

export function DailyChecklist() {
  const [checked, setChecked] = React.useState<string[]>([]);
  const [celebrating, setCelebrating] = React.useState(false);

  // Load from localStorage on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(TODAY_KEY());
      if (saved) setChecked(JSON.parse(saved));
    } catch {}
  }, []);

  const toggleItem = (id: string) => {
    const next = checked.includes(id)
      ? checked.filter((c) => c !== id)
      : [...checked, id];

    setChecked(next);

    try {
      localStorage.setItem(TODAY_KEY(), JSON.stringify(next));
    } catch {}

    // Celebrate on 100% completion
    if (next.length === CHECKLIST_ITEMS.length && !celebrating) {
      setCelebrating(true);
      setTimeout(() => setCelebrating(false), 2500);
    }
  };

  const completedCount = checked.length;
  const totalCount = CHECKLIST_ITEMS.length;
  const progress = (completedCount / totalCount) * 100;
  const allDone = completedCount === totalCount;

  return (
    <div className="bg-surface border border-border rounded-lg p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">
            Daily Operating Checklist
          </h3>
          <span className={`text-xs font-mono ${allDone ? "text-emerald-400 font-bold" : "text-muted-foreground"}`}>
            {completedCount} / {totalCount} {allDone ? "✓" : ""}
          </span>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full bg-surface-subtle rounded-full h-1.5 mb-4 overflow-hidden border border-border">
          <div
            className={`h-1.5 rounded-full transition-all duration-500 ${
              allDone ? "bg-emerald-500" : "bg-blue-600"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Celebration Banner */}
        {celebrating && (
          <div className="mb-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-xs text-emerald-400 animate-pulse">
            <Trophy className="w-4 h-4 flex-shrink-0" />
            <span className="font-semibold">Morning loop complete! Great work.</span>
          </div>
        )}

        <ul className="space-y-2">
          {CHECKLIST_ITEMS.map((item) => {
            const isDone = checked.includes(item.id);
            return (
              <li
                key={item.id}
                className={`flex items-center justify-between p-2.5 rounded-md border text-xs transition-all cursor-pointer group ${
                  isDone
                    ? "bg-emerald-500/5 border-emerald-500/20"
                    : "bg-surface-subtle border-border/60 hover:border-border"
                }`}
                onClick={() => toggleItem(item.id)}
              >
                <div className="flex items-center gap-2.5">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground/40 flex-shrink-0 group-hover:text-muted-foreground transition-colors" />
                  )}
                  <span className={isDone ? "text-muted-foreground line-through" : "text-foreground"}>
                    {item.text}
                  </span>
                </div>
                <Link
                  href={item.href}
                  onClick={(e) => e.stopPropagation()}
                  className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-4 pt-3 border-t border-border/50 text-[11px] text-muted-foreground flex items-center justify-between font-mono">
        <span>Morning Review Loop</span>
        <span>Target: &lt; 10 min</span>
      </div>
    </div>
  );
}
