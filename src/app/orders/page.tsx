import { ShoppingBag } from "lucide-react";

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          COD Orders &amp; Operations Pipeline
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Confirmation calls, WhatsApp links, follow-up scheduling, and courier tracking
        </p>
      </div>

      <div className="bg-surface border border-border rounded-lg p-8 text-center">
        <ShoppingBag className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-foreground">Order Triage Pipeline Ready</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
          High-density order table with 1-click WhatsApp actions will activate in Epic 3.
        </p>
      </div>
    </div>
  );
}
