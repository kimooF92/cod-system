"use client";

import * as React from "react";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { calculateUnitEconomics } from "@/lib/engine/unit-economics";
import { calculateProductScore, type ProductScoreResult } from "@/lib/engine/product-scoring";
import { getProducts, deleteProduct, type Product } from "@/actions/products";
import { ProductFormDialog } from "./product-form-dialog";
import { StatusOverrideDialog } from "./status-override-dialog";
import { StatusHistoryDrawer } from "./status-history-drawer";
import { ProductScoreBadge } from "./product-score-badge";
import { ProductScoreDrawer } from "./product-score-drawer";
import { Plus, Search, Edit2, Trash2, Package, Inbox, History, ChevronRight, Sparkles } from "lucide-react";

interface ProductTableProps {
  initialProducts: Product[];
}

const statusTabs = [
  { id: "ALL", label: "All Products" },
  { id: "WINNER", label: "Winners" },
  { id: "TESTING", label: "Testing" },
  { id: "READY", label: "Ready" },
  { id: "HOLD", label: "Hold" },
  { id: "KILL", label: "Killed" },
  { id: "ARCHIVED", label: "Archived" },
];

const statusStyles: Record<string, string> = {
  WINNER: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold",
  SCALING: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-bold",
  TESTING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  READY: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  HOLD: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  KILL: "bg-red-500/10 text-red-400 border-red-500/20",
  FATIGUED: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  ARCHIVED: "bg-surface-subtle text-muted-foreground border-border",
  IDEA: "bg-surface-subtle text-muted-foreground border-border",
  RESEARCH: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export function ProductTable({ initialProducts }: ProductTableProps) {
  const [products, setProducts] = React.useState<Product[]>(initialProducts);
  const [activeTab, setActiveTab] = React.useState("ALL");
  const [searchQuery, setSearchQuery] = React.useState("");
  
  // Product Form Dialog state
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);

  // Status Override & History state
  const [statusDialogProduct, setStatusDialogProduct] = React.useState<Product | null>(null);
  const [historyDrawerProduct, setHistoryDrawerProduct] = React.useState<Product | null>(null);

  // Score Drawer state
  const [scoreDrawerProduct, setScoreDrawerProduct] = React.useState<Product | null>(null);
  const [scoreDrawerResult, setScoreDrawerResult] = React.useState<ProductScoreResult | null>(null);

  const [loading, setLoading] = React.useState(false);

  const fetchProducts = async (status = activeTab) => {
    setLoading(true);
    const data = await getProducts(status);
    setProducts(data);
    setLoading(false);
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    fetchProducts(tabId);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this product from catalog?")) {
      await deleteProduct(id);
      fetchProducts();
    }
  };

  const handleOpenScore = (product: Product, scoreResult: ProductScoreResult) => {
    setScoreDrawerProduct(product);
    setScoreDrawerResult(scoreResult);
  };

  const handleModalClose = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
  };

  const filteredProducts = products.filter((p) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(query) ||
      (p.sku && p.sku.toLowerCase().includes(query)) ||
      (p.notes && p.notes.toLowerCase().includes(query))
    );
  });

  const winnersCount = products.filter((p) => p.status === "WINNER" || p.status === "SCALING").length;
  const testingCount = products.filter((p) => p.status === "TESTING").length;
  const readyCount = products.filter((p) => p.status === "READY").length;

  return (
    <div className="space-y-6">
      {/* Top Bar: Title & New Product Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Product Catalog &amp; Unit Economics
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage selling prices, fulfillment costs, target metrics, scores &amp; lifecycle status
          </p>
        </div>

        <button
          onClick={() => {
            setEditingProduct(null);
            setIsDialogOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Product</span>
        </button>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-surface border border-border rounded-lg flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Active Winners</span>
          <span className="text-base font-mono font-bold text-emerald-400 tabular-nums">
            {winnersCount}
          </span>
        </div>

        <div className="p-3 bg-surface border border-border rounded-lg flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Currently Testing</span>
          <span className="text-base font-mono font-bold text-blue-400 tabular-nums">
            {testingCount}
          </span>
        </div>

        <div className="p-3 bg-surface border border-border rounded-lg flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Ready for Launch</span>
          <span className="text-base font-mono font-bold text-purple-400 tabular-nums">
            {readyCount}
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search Box */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-1 overflow-x-auto">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-blue-600/15 text-blue-400 border border-blue-500/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-subtle border border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-surface border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Catalog Table */}
      {loading ? (
        <div className="p-12 text-center text-xs text-muted-foreground font-mono">
          Loading catalog...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-surface-subtle border border-border flex items-center justify-center mx-auto text-muted-foreground">
            <Inbox className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-semibold text-foreground">
            No products found
          </h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {searchQuery
              ? `No products match the search query "${searchQuery}".`
              : `No products currently in status "${activeTab}".`}
          </p>
          <button
            onClick={() => {
              setEditingProduct(null);
              setIsDialogOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-medium hover:bg-blue-600/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Product</span>
          </button>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border bg-surface-subtle/50 text-muted-foreground uppercase font-mono text-[10px]">
                  <th className="py-3 px-4 font-medium">Product / SKU</th>
                  <th className="py-3 px-3 font-medium">Score (0-100)</th>
                  <th className="py-3 px-3 font-medium">Status</th>
                  <th className="py-3 px-3 font-medium text-right">Price</th>
                  <th className="py-3 px-3 font-medium text-right">Cost</th>
                  <th className="py-3 px-3 font-medium text-right">Target CPL</th>
                  <th className="py-3 px-3 font-medium text-right">Exp. Deliv %</th>
                  <th className="py-3 px-3 font-medium text-right">Est. Profit/Deliv</th>
                  <th className="py-3 px-3 font-medium text-right">Break-Even CPL</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredProducts.map((product) => {
                  const eco = calculateUnitEconomics({
                    sellingPrice: product.selling_price,
                    productCost: product.product_cost,
                    packagingCost: product.packaging_cost,
                    deliveryCost: product.delivery_cost,
                    returnCost: product.return_cost,
                    otherCost: product.other_fulfillment_cost,
                    targetCpl: product.target_cpl,
                    expectedDeliveryRate: product.expected_delivery_rate,
                  });

                  const score = calculateProductScore({
                    targetCpl: product.target_cpl,
                    actualCpl: product.status === "WINNER" ? product.target_cpl * 0.85 : product.target_cpl,
                    expectedProfitPerDeliveredOrder: eco.estimatedNetProfitPerDeliveredOrder,
                    expectedDeliveryRate: product.expected_delivery_rate,
                    actualDeliveryRate: product.status === "WINNER" ? product.expected_delivery_rate + 0.05 : product.expected_delivery_rate,
                    expectedConfirmationRate: 0.75,
                    creativePotentialScore: product.status === "WINNER" ? 90 : 75,
                  });

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-surface-subtle/40 transition-colors"
                    >
                      {/* Name & SKU */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground">
                          {product.name}
                        </div>
                        <div className="text-[10px] font-mono text-muted-foreground">
                          {product.sku || "NO-SKU"} &bull; {product.lead_capacity} leads/day cap
                        </div>
                      </td>

                      {/* Product Score Pill (FR-12) */}
                      <td className="py-3 px-3">
                        <button
                          onClick={() => handleOpenScore(product, score)}
                          title="Click to view multi-dimensional 0-100 score breakdown"
                          className="hover:opacity-80 transition-opacity"
                        >
                          <ProductScoreBadge
                            score={score.compositeScore}
                            grade={score.grade}
                            size="sm"
                          />
                        </button>
                      </td>

                      {/* Status - Clickable for Manual Override (FR-11) */}
                      <td className="py-3 px-3">
                        <button
                          onClick={() => setStatusDialogProduct(product)}
                          className={`px-2.5 py-1 rounded-full border text-[10px] font-mono tracking-wide flex items-center gap-1 hover:brightness-125 transition-all ${
                            statusStyles[product.status] || statusStyles.READY
                          }`}
                          title="Click to override status with reason"
                        >
                          <span>{product.status}</span>
                          <ChevronRight className="w-3 h-3 opacity-60" />
                        </button>
                      </td>

                      {/* Price & Cost */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-foreground">
                        {formatCurrency(product.selling_price)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-muted-foreground">
                        {formatCurrency(product.product_cost)}
                      </td>

                      {/* Target CPL & Deliv Rate */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-foreground">
                        {formatCurrency(product.target_cpl)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-foreground">
                        {formatPercent(product.expected_delivery_rate)}
                      </td>

                      {/* Est. Net Profit / Delivered Order */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-bold">
                        <span
                          className={
                            eco.estimatedNetProfitPerDeliveredOrder >= 10
                              ? "text-emerald-400"
                              : eco.estimatedNetProfitPerDeliveredOrder > 0
                              ? "text-amber-400"
                              : "text-red-400"
                          }
                        >
                          {formatCurrency(eco.estimatedNetProfitPerDeliveredOrder)}
                        </span>
                      </td>

                      {/* Break-Even CPL */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-muted-foreground">
                        {formatCurrency(eco.breakEvenCPL)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenScore(product, score)}
                            className="p-1.5 text-muted-foreground hover:text-emerald-400 hover:bg-surface-subtle rounded transition-colors"
                            title="View 0-100 Product Score Breakdown"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setHistoryDrawerProduct(product)}
                            className="p-1.5 text-muted-foreground hover:text-blue-400 hover:bg-surface-subtle rounded transition-colors"
                            title="View Lifecycle Status Audit Trail"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-1.5 text-muted-foreground hover:text-blue-400 hover:bg-surface-subtle rounded transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-surface-subtle rounded transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Dialog */}
      <ProductFormDialog
        isOpen={isDialogOpen}
        onClose={handleModalClose}
        onSuccess={() => fetchProducts()}
        initialProduct={editingProduct}
      />

      {/* Status Override Dialog (FR-11) */}
      <StatusOverrideDialog
        product={statusDialogProduct}
        isOpen={!!statusDialogProduct}
        onClose={() => setStatusDialogProduct(null)}
        onSuccess={() => fetchProducts()}
      />

      {/* Status History Audit Drawer (AD-3) */}
      <StatusHistoryDrawer
        product={historyDrawerProduct}
        isOpen={!!historyDrawerProduct}
        onClose={() => setHistoryDrawerProduct(null)}
      />

      {/* Product Score Drawer (FR-12) */}
      <ProductScoreDrawer
        product={scoreDrawerProduct}
        scoreResult={scoreDrawerResult}
        isOpen={!!scoreDrawerProduct}
        onClose={() => {
          setScoreDrawerProduct(null);
          setScoreDrawerResult(null);
        }}
      />
    </div>
  );
}
