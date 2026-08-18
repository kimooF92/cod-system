import { Package, Plus } from "lucide-react";

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Products & Unit Economics
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage product catalog, custom cost parameters, and lifecycle stages
          </p>
        </div>

        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors shadow-sm">
          <Plus className="w-3.5 h-3.5" />
          <span>New Product</span>
        </button>
      </div>

      <div className="bg-surface border border-border rounded-lg p-8 text-center">
        <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-foreground">Products Module Ready</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
          Product lifecycle management and 0–100 Product Scoring will be fully functional in Story 1.3 &amp; 1.6.
        </p>
      </div>
    </div>
  );
}
