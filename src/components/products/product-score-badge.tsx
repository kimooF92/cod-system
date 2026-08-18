import * as React from "react";
import { cn } from "@/lib/utils";

interface ProductScoreBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  score: number;
  grade?: string;
  size?: "sm" | "md" | "lg";
}

export function ProductScoreBadge({
  score,
  grade,
  size = "md",
  className,
  ...props
}: ProductScoreBadgeProps) {
  let colorStyles = "bg-red-500/10 text-red-400 border-red-500/20";

  if (score >= 85) {
    colorStyles = "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-bold";
  } else if (score >= 70) {
    colorStyles = "bg-blue-500/15 text-blue-400 border-blue-500/30 font-semibold";
  } else if (score >= 50) {
    colorStyles = "bg-amber-500/10 text-amber-400 border-amber-500/20";
  }

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm font-bold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border font-mono tabular-nums transition-colors",
        sizeStyles[size],
        colorStyles,
        className
      )}
      {...props}
    >
      <span className="font-bold">{score}</span>
      <span className="text-[10px] opacity-70">/ 100</span>
      {grade && (
        <span className="ml-1 px-1 rounded bg-black/30 text-[9px] uppercase font-bold">
          {grade}
        </span>
      )}
    </span>
  );
}
