"use client";

import * as React from "react";
import { PhoneCall, AlertCircle, Clock, Check, XCircle } from "lucide-react";
import type { Order } from "@/actions/orders";
import { isFollowUpDue } from "@/lib/engine/followup-rules";
import { cancelMaxAttemptOrders } from "@/actions/orders";

interface FollowUpQueueBannerProps {
  orders: Order[];
  onSelectDueFilter: () => void;
  onRefresh: () => void;
}

export function FollowUpQueueBanner({
  orders,
  onSelectDueFilter,
  onRefresh,
}: FollowUpQueueBannerProps) {
  const [cancelling, setCancelling] = React.useState(false);

  const dueOrders = orders.filter(
    (o) => o.status === "NO_ANSWER" && isFollowUpDue(o.next_follow_up_at)
  );

  const maxAttemptOrders = orders.filter(
    (o) => o.attempt_count >= 3 && (o.status === "NO_ANSWER" || o.status === "NEW_ORDER")
  );

  if (dueOrders.length === 0 && maxAttemptOrders.length === 0) return null;

  const handleCancelMaxAttempts = async () => {
    if (confirm(`Cancel ${maxAttemptOrders.length} orders with 3 failed call attempts?`)) {
      setCancelling(true);
      await cancelMaxAttemptOrders();
      setCancelling(false);
      onRefresh();
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-amber-600/15 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">
              Follow-Up &amp; Retry Cockpit
            </h4>
            <p className="text-[11px] text-muted-foreground">
              {dueOrders.length} callback{dueOrders.length !== 1 ? "s" : ""} scheduled for retry now &bull; {maxAttemptOrders.length} reached 3/3 attempt limit
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {dueOrders.length > 0 && (
            <button
              onClick={onSelectDueFilter}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors shadow-sm"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>View {dueOrders.length} Due Calls</span>
            </button>
          )}

          {maxAttemptOrders.length > 0 && (
            <button
              disabled={cancelling}
              onClick={handleCancelMaxAttempts}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-600/15 hover:bg-red-600/25 border border-red-500/30 text-red-400 text-xs font-semibold transition-colors"
              title="Cancel all orders with 3 failed call attempts"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>{cancelling ? "Cancelling..." : `1-Click Cancel (${maxAttemptOrders.length})`}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
