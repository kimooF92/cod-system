import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "scale"
  | "hold"
  | "kill"
  | "testing"
  | "winner"
  | "iterate"
  | "neutral";

interface DecisionBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
  size?: "sm" | "md";
}

const variantStyles: Record<BadgeVariant, string> = {
  scale: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  winner: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold",
  hold: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  kill: "bg-red-500/15 text-red-400 border border-red-500/30",
  testing: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  iterate: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
  neutral: "bg-surface-subtle text-muted-foreground border border-border",
};

export function DecisionBadge({
  variant = "neutral",
  size = "md",
  className,
  children,
  ...props
}: DecisionBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full tracking-wide uppercase font-mono font-medium transition-colors",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
