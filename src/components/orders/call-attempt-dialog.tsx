"use client";

import * as React from "react";
import { X, PhoneOff, Calendar, Clock, AlertTriangle, Check } from "lucide-react";
import { logCallAttemptAndSchedule, type Order } from "@/actions/orders";
import {
  FOLLOWUP_PRESETS,
  type FollowUpPresetKey,
} from "@/lib/engine/followup-rules";

interface CallAttemptDialogProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CallAttemptDialog({
  order,
  isOpen,
  onClose,
  onSuccess,
}: CallAttemptDialogProps) {
  const [selectedPreset, setSelectedPreset] = React.useState<FollowUpPresetKey>("IN_2_HOURS");
  const [notes, setNotes] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  if (!isOpen || !order) return null;

  const currentAttempts = order.attempt_count || 0;
  const nextAttemptNumber = currentAttempts + 1;
  const isFinalAttempt = nextAttemptNumber >= 3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await logCallAttemptAndSchedule(order.id, selectedPreset, notes || undefined);
    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-surface border border-border rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-amber-600/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <PhoneOff className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Log Call Attempt #{nextAttemptNumber} (FR-27)
              </h3>
              <p className="text-xs text-muted-foreground truncate max-w-[240px]">
                {order.customer_name} &bull; {order.phone}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-subtle transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Attempt Warning */}
          {isFinalAttempt ? (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Max Attempt Reached (3/3)</strong>
                <span>If the customer does not answer on this retry, the order will be flagged for cancellation.</span>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-surface-subtle border border-border text-xs text-muted-foreground">
              Logging attempt <strong className="text-foreground">#{nextAttemptNumber} of 3</strong> for this lead.
            </div>
          )}

          {/* Follow-up Presets */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Schedule Next Follow-Up Window</span>
            </label>

            <div className="grid grid-cols-1 gap-2">
              {FOLLOWUP_PRESETS.map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => setSelectedPreset(preset.key)}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${
                    selectedPreset === preset.key
                      ? "bg-amber-500/15 text-amber-400 border-amber-500/40 font-bold"
                      : "bg-surface-subtle text-muted-foreground border-border hover:text-foreground hover:border-muted-foreground/30"
                  }`}
                >
                  <div>
                    <div className="font-semibold">{preset.label}</div>
                    <div className="text-[10px] opacity-70 font-mono mt-0.5">
                      {preset.description}
                    </div>
                  </div>
                  {selectedPreset === preset.key && (
                    <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Attempt Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Call Outcome Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Line busy, rang 5 times no answer, voicemail"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-md border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-surface-subtle transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-medium transition-colors shadow-sm"
            >
              <span>{loading ? "Saving..." : "Log Attempt & Schedule"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
