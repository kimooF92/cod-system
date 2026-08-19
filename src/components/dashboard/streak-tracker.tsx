"use client";

import * as React from "react";
import { Flame } from "lucide-react";

const STREAK_KEY = "cod-streak-count";
const LAST_ACTIVE_KEY = "cod-streak-last-active";

export function StreakTracker() {
  const [streak, setStreak] = React.useState(0);

  React.useEffect(() => {
    const today = new Date().toISOString().split("T")[0];

    try {
      const lastActive = localStorage.getItem(LAST_ACTIVE_KEY);
      const savedStreak = parseInt(localStorage.getItem(STREAK_KEY) || "0", 10);

      if (!lastActive) {
        // First time ever
        localStorage.setItem(LAST_ACTIVE_KEY, today);
        localStorage.setItem(STREAK_KEY, "1");
        setStreak(1);
        return;
      }

      if (lastActive === today) {
        // Already visited today — just display current streak
        setStreak(savedStreak);
        return;
      }

      // Check if yesterday
      const last = new Date(lastActive);
      const diff = Math.floor(
        (new Date(today).getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diff === 1) {
        // Consecutive day — bump streak
        const newStreak = savedStreak + 1;
        localStorage.setItem(STREAK_KEY, String(newStreak));
        localStorage.setItem(LAST_ACTIVE_KEY, today);
        setStreak(newStreak);
      } else {
        // Gap in days — reset
        localStorage.setItem(STREAK_KEY, "1");
        localStorage.setItem(LAST_ACTIVE_KEY, today);
        setStreak(1);
      }
    } catch {
      setStreak(1);
    }
  }, []);

  if (streak === 0) return null;

  const color =
    streak >= 7
      ? "bg-orange-500/15 border-orange-500/30 text-orange-400"
      : streak >= 3
      ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
      : "bg-surface-subtle border-border text-muted-foreground";

  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-mono ${color}`}
      title={`${streak}-day active streak`}
    >
      <Flame className="w-3.5 h-3.5" />
      <span>{streak}-Day Streak</span>
    </div>
  );
}
