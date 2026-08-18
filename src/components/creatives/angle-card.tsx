"use client";

import * as React from "react";
import {
  Sparkles,
  Plus,
  Trash2,
  Copy,
  Check,
  Anchor,
  Layers,
  UserCheck,
  Lightbulb,
} from "lucide-react";
import { deleteMarketingAngle, deleteMarketingHook, type MarketingAngle } from "@/actions/creatives";
import {
  HOOK_TYPE_LABELS,
  CREATIVE_FORMAT_LABELS,
  type HookType,
  type CreativeFormat,
} from "@/lib/validations/creative";

interface AngleCardProps {
  angle: MarketingAngle;
  onAddHook: (angle: MarketingAngle) => void;
  onRefresh: () => void;
}

const hookTypeColors: Record<string, string> = {
  PROBLEM_AGITATION: "text-red-400 bg-red-500/10 border-red-500/20",
  BOLD_CLAIM: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  QUESTION: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  DEMONSTRATION: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  CURIOSITY_GAP: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  SOCIAL_PROOF: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  OFFER_LED: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
};

export function AngleCard({ angle, onAddHook, onRefresh }: AngleCardProps) {
  const [copiedHookId, setCopiedHookId] = React.useState<string | null>(null);

  const handleCopyHook = (hookId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHookId(hookId);
    setTimeout(() => setCopiedHookId(null), 2000);
  };

  const handleDeleteAngle = async () => {
    if (confirm(`Delete angle "${angle.name}" and all its hooks?`)) {
      await deleteMarketingAngle(angle.id);
      onRefresh();
    }
  };

  const handleDeleteHook = async (hookId: string) => {
    if (confirm("Delete this hook?")) {
      await deleteMarketingHook(hookId);
      onRefresh();
    }
  };

  const formatLabel =
    CREATIVE_FORMAT_LABELS[angle.creative_format as CreativeFormat]?.label ||
    angle.creative_format;

  return (
    <div className="bg-surface border border-border rounded-xl p-5 flex flex-col justify-between hover:border-muted-foreground/30 transition-all space-y-4">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase text-muted-foreground bg-surface-subtle px-2 py-0.5 rounded border border-border">
                {angle.product?.name || "Product"}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {formatLabel}
              </span>
            </div>
            <h4 className="text-sm font-bold text-foreground mt-2 leading-tight">
              {angle.name}
            </h4>
          </div>

          <button
            onClick={handleDeleteAngle}
            className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-surface-subtle rounded transition-colors"
            title="Delete Marketing Angle"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Target Avatar, Pain Point & Promise Box */}
        <div className="p-3.5 rounded-lg bg-surface-subtle border border-border space-y-2 my-3">
          <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
            <UserCheck className="w-3.5 h-3.5 text-muted-foreground" />
            <span>
              Avatar: <strong>{angle.target_customer_avatar}</strong>
            </span>
          </div>

          <div className="text-xs space-y-1 pt-1 border-t border-border/50">
            <p className="text-muted-foreground">
              <strong className="text-foreground">Pain Point: </strong>
              &ldquo;{angle.pain_point}&rdquo;
            </p>
            <p className="text-muted-foreground">
              <strong className="text-foreground">Promise: </strong>
              &ldquo;{angle.promise}&rdquo;
            </p>
          </div>
        </div>

        {/* Hooks Section (FR-14) */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Anchor className="w-3.5 h-3.5 text-purple-400" />
              <span>Opening Hooks ({angle.hooks.length})</span>
            </div>

            <button
              onClick={() => onAddHook(angle)}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-400 hover:text-purple-300 transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>Add Hook</span>
            </button>
          </div>

          {angle.hooks.length === 0 ? (
            <div className="p-3 text-center text-xs text-muted-foreground bg-surface-subtle/50 rounded border border-dashed border-border">
              No hooks added yet. Click &ldquo;Add Hook&rdquo; to test opening variations.
            </div>
          ) : (
            <div className="space-y-2">
              {angle.hooks.map((hook) => {
                const typeLabel =
                  HOOK_TYPE_LABELS[hook.hook_type as HookType]?.label || hook.hook_type;
                const isCopied = copiedHookId === hook.id;

                return (
                  <div
                    key={hook.id}
                    className="p-2.5 rounded-md bg-surface-subtle/80 border border-border flex items-start justify-between gap-2 group hover:border-muted-foreground/40 transition-colors"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border ${
                            hookTypeColors[hook.hook_type] || "text-muted-foreground border-border"
                          }`}
                        >
                          {typeLabel}
                        </span>
                      </div>
                      <p className="text-xs text-foreground font-medium leading-snug">
                        &ldquo;{hook.hook_text}&rdquo;
                      </p>
                      {hook.notes && (
                        <p className="text-[10px] text-muted-foreground italic">
                          B-roll: {hook.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleCopyHook(hook.id, hook.hook_text)}
                        className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
                        title="Copy Hook Text"
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteHook(hook.id)}
                        className="p-1 rounded text-muted-foreground hover:text-red-400 hover:bg-surface transition-colors"
                        title="Delete Hook"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer Notes */}
      {angle.notes && (
        <div className="pt-2 border-t border-border/60 text-[11px] text-muted-foreground italic">
          Notes: {angle.notes}
        </div>
      )}
    </div>
  );
}
