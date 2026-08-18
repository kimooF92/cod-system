import * as React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  delta?: string | number | null;
  deltaType?: "positive" | "negative" | "neutral" | "warning";
  subtext?: string;
  icon?: React.ReactNode;
}

export function StatCard({
  label,
  value,
  delta,
  deltaType = "neutral",
  subtext,
  icon,
  className,
  ...props
}: StatCardProps) {
  const deltaColors = {
    positive: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    negative: "text-red-400 bg-red-500/10 border-red-500/20",
    warning: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    neutral: "text-muted-foreground bg-surface-subtle border-border",
  };

  return (
    <div
      className={cn(
        "bg-surface border border-border rounded-lg p-4 transition-all hover:border-muted-foreground/30 flex flex-col justify-between",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {icon && <div className="text-muted-foreground/60">{icon}</div>}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xl font-bold font-mono tracking-tight tabular-nums text-foreground">
          {value}
        </span>

        {delta !== undefined && delta !== null && (
          <span
            className={cn(
              "text-xs px-2 py-0.5 rounded-full font-mono border",
              deltaColors[deltaType]
            )}
          >
            {delta}
          </span>
        )}
      </div>

      {subtext && (
        <p className="text-xs text-muted-foreground mt-2 truncate">{subtext}</p>
      )}
    </div>
  );
}
