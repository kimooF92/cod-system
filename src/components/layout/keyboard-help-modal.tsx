"use client";

import * as React from "react";
import { X, Keyboard, ArrowRight } from "lucide-react";

const SHORTCUT_GROUPS = [
  {
    title: "Global",
    shortcuts: [
      { keys: ["c"], description: "Quick Create menu" },
      { keys: ["?"], description: "Open this keyboard reference" },
      { keys: ["Esc"], description: "Close any modal or menu" },
    ],
  },
  {
    title: "Navigation (g + key)",
    shortcuts: [
      { keys: ["g", "d"], description: "Go to Dashboard" },
      { keys: ["g", "p"], description: "Go to Products" },
      { keys: ["g", "t"], description: "Go to Testing" },
      { keys: ["g", "c"], description: "Go to Creatives" },
      { keys: ["g", "o"], description: "Go to Orders" },
      { keys: ["g", "f"], description: "Go to Finance" },
      { keys: ["g", "a"], description: "Go to Analytics" },
      { keys: ["g", "r"], description: "Go to Research" },
      { keys: ["g", "m"], description: "Go to Monthly Review" },
      { keys: ["g", "s"], description: "Go to Settings" },
    ],
  },
  {
    title: "Quick Create (while menu open)",
    shortcuts: [
      { keys: ["O"], description: "New COD Order" },
      { keys: ["P"], description: "New Product" },
      { keys: ["C"], description: "Log Creative Asset" },
      { keys: ["R"], description: "Research Item" },
    ],
  },
];

interface KeyboardHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardHelpModal({ isOpen, onClose }: KeyboardHelpModalProps) {
  React.useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Keyboard Shortcuts</h3>
              <p className="text-xs text-muted-foreground">Press ? anytime to show this</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-subtle transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcut Groups */}
        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title}>
              <h4 className="text-[10px] uppercase font-mono font-bold text-muted-foreground mb-2 tracking-wider">
                {group.title}
              </h4>
              <div className="space-y-1">
                {group.shortcuts.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-surface-subtle"
                  >
                    <span className="text-xs text-foreground">{s.description}</span>
                    <div className="flex items-center gap-1">
                      {s.keys.map((k, ki) => (
                        <React.Fragment key={ki}>
                          <kbd className="px-2 py-0.5 text-[10px] font-mono bg-surface-subtle border border-border rounded text-foreground">
                            {k}
                          </kbd>
                          {ki < s.keys.length - 1 && (
                            <ArrowRight className="w-2.5 h-2.5 text-muted-foreground" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-3 border-t border-border text-[10px] font-mono text-muted-foreground">
          Shortcuts disabled while typing in any input field
        </div>
      </div>
    </div>
  );
}
