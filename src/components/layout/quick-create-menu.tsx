"use client";

import * as React from "react";
import {
  ShoppingBag,
  Package,
  Sparkles,
  Search,
  X,
  Plus,
  Zap,
} from "lucide-react";
import { useQuickCreate } from "./quick-create-provider";
import { OrderFormDialog } from "@/components/orders/order-form-dialog";
import { ProductFormDialog } from "@/components/products/product-form-dialog";
import { CreativeAssetDialog } from "@/components/creatives/creative-asset-dialog";
import { ResearchFormDialog } from "@/components/research/research-form-dialog";

const CREATE_OPTIONS = [
  {
    type: "order" as const,
    label: "New COD Order",
    description: "Log a manual intake order",
    icon: ShoppingBag,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40",
    kbd: "O",
  },
  {
    type: "product" as const,
    label: "New Product",
    description: "Register a product with economics",
    icon: Package,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20 hover:border-blue-500/40",
    kbd: "P",
  },
  {
    type: "creative" as const,
    label: "Log Creative Asset",
    description: "Register a video or image creative",
    icon: Sparkles,
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20 hover:border-purple-500/40",
    kbd: "C",
  },
  {
    type: "research" as const,
    label: "Research Item",
    description: "Add a product idea to backlog",
    icon: Search,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40",
    kbd: "R",
  },
];

export function QuickCreateMenu() {
  const { open, openCreate, closeCreate } = useQuickCreate();
  const [menuOpen, setMenuOpen] = React.useState(false);

  // Close menu on Escape
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
      // number shortcuts while menu is open
      if (menuOpen) {
        CREATE_OPTIONS.forEach((opt) => {
          if (e.key.toLowerCase() === opt.kbd.toLowerCase()) {
            setMenuOpen(false);
            openCreate(opt.type);
          }
        });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [menuOpen, openCreate]);

  const handleRefresh = () => {
    // Trigger revalidation after successful create
    window.location.reload();
  };

  return (
    <>
      {/* Trigger Button */}
      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors shadow-sm"
          title="Quick Create (c)"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Create</span>
          <kbd className="hidden lg:inline-block ml-1 px-1 py-0.5 bg-blue-700/50 rounded text-[9px] font-mono">
            c
          </kbd>
        </button>

        {/* Dropdown Menu */}
        {menuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 top-9 z-50 w-64 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden">
              <div className="px-3 py-2.5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Zap className="w-3.5 h-3.5 text-blue-400" />
                  Quick Create
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-0.5 rounded text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-2 space-y-1">
                {CREATE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.type}
                      onClick={() => {
                        setMenuOpen(false);
                        openCreate(opt.type);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all group ${opt.bg}`}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 ${opt.color}`} />
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-semibold ${opt.color}`}>
                          {opt.label}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate">
                          {opt.description}
                        </div>
                      </div>
                      <kbd className="text-[9px] font-mono text-muted-foreground/50 bg-surface px-1 py-0.5 rounded border border-border">
                        {opt.kbd}
                      </kbd>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Form Dialogs — rendered globally so they can be triggered from anywhere */}
      <OrderFormDialog
        isOpen={open === "order"}
        onClose={closeCreate}
        onSuccess={handleRefresh}
      />
      <ProductFormDialog
        isOpen={open === "product"}
        onClose={closeCreate}
        onSuccess={handleRefresh}
        initialProduct={null}
      />
      <CreativeAssetDialog
        isOpen={open === "creative"}
        onClose={closeCreate}
        onSuccess={handleRefresh}
      />
      <ResearchFormDialog
        isOpen={open === "research"}
        onClose={closeCreate}
        onSuccess={handleRefresh}
      />
    </>
  );
}

// Export trigger hook so keyboard listener can open the menu
export function useQuickCreateTrigger() {
  return useQuickCreate();
}
