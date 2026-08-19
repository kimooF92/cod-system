"use client";

import * as React from "react";
import { AngleCard } from "./angle-card";
import { AngleFormDialog } from "./angle-form-dialog";
import { HookFormDialog } from "./hook-form-dialog";
import { getMarketingAngles, type MarketingAngle } from "@/actions/creatives";
import { getProducts, type Product } from "@/actions/products";
import {
  Plus,
  Search,
  Inbox,
  Package,
  ChevronDown,
  Check,
  X,
  SlidersHorizontal,
} from "lucide-react";

interface AngleRegistryProps {
  initialAngles: MarketingAngle[];
}

export function AngleRegistry({ initialAngles }: AngleRegistryProps) {
  const [angles, setAngles] = React.useState<MarketingAngle[]>(initialAngles);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = React.useState<string>("ALL");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Product combobox / dropdown states
  const [isProductDropdownOpen, setIsProductDropdownOpen] = React.useState(false);
  const [productFilterSearch, setProductFilterSearch] = React.useState("");
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Dialog states
  const [isAngleDialogOpen, setIsAngleDialogOpen] = React.useState(false);
  const [hookDialogAngle, setHookDialogAngle] = React.useState<MarketingAngle | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  // Close dropdown on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProductDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchAngles = async (productId = selectedProductId) => {
    setLoading(true);
    const data = await getMarketingAngles(productId);
    setAngles(data);
    setLoading(false);
  };

  const handleProductFilter = (prodId: string) => {
    setSelectedProductId(prodId);
    setIsProductDropdownOpen(false);
    setProductFilterSearch("");
    fetchAngles(prodId);
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  // Filter products for the combobox search
  const filteredProductsForDropdown = products.filter((p) => {
    if (!productFilterSearch.trim()) return true;
    const q = productFilterSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.sku && p.sku.toLowerCase().includes(q))
    );
  });

  const filteredAngles = angles.filter((a) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      a.name.toLowerCase().includes(query) ||
      a.pain_point.toLowerCase().includes(query) ||
      a.promise.toLowerCase().includes(query) ||
      a.target_customer_avatar.toLowerCase().includes(query) ||
      a.hooks.some((h) => h.hook_text.toLowerCase().includes(query))
    );
  });

  const totalHooks = angles.reduce((sum, a) => sum + a.hooks.length, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Marketing Angles, Hooks &amp; Creative Formats
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Systematize hook angles, pain points, promises &amp; video scripts
          </p>
        </div>

        <button
          onClick={() => setIsAngleDialogOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Marketing Angle</span>
        </button>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-surface border border-border rounded-lg flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Active Angles</span>
          <span className="text-base font-mono font-bold text-blue-400 tabular-nums">
            {angles.length}
          </span>
        </div>

        <div className="p-3 bg-surface border border-border rounded-lg flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Opening Hooks</span>
          <span className="text-base font-mono font-bold text-purple-400 tabular-nums">
            {totalHooks}
          </span>
        </div>

        <div className="p-3 bg-surface border border-border rounded-lg flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Avg Hooks / Angle</span>
          <span className="text-base font-mono font-bold text-emerald-400 tabular-nums">
            {angles.length > 0 ? (totalHooks / angles.length).toFixed(1) : "0.0"}
          </span>
        </div>
      </div>

      {/* Scalable Product Filter Bar & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick All Products Button */}
          <button
            onClick={() => handleProductFilter("ALL")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              selectedProductId === "ALL"
                ? "bg-blue-600/15 text-blue-400 border border-blue-500/30"
                : "text-muted-foreground hover:text-foreground hover:bg-surface-subtle border border-transparent"
            }`}
          >
            <span>All Products</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-surface border border-border rounded text-muted-foreground">
              {products.length}
            </span>
          </button>

          {/* Searchable Combobox for 200+ Products */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProductDropdownOpen(!isProductDropdownOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${
                selectedProductId !== "ALL"
                  ? "bg-blue-600/10 text-blue-300 border-blue-500/40"
                  : "bg-surface text-muted-foreground hover:text-foreground border-border hover:bg-surface-subtle"
              }`}
            >
              <Package className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="max-w-[180px] sm:max-w-[240px] truncate">
                {selectedProduct ? selectedProduct.name : "Filter by Product..."}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-0.5" />
            </button>

            {/* Dropdown Popover */}
            {isProductDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-72 sm:w-80 bg-surface border border-border rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                {/* Search inside 200 products */}
                <div className="p-2 border-b border-border bg-surface-subtle">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder={`Search among ${products.length} products...`}
                      value={productFilterSearch}
                      onChange={(e) => setProductFilterSearch(e.target.value)}
                      autoFocus
                      className="w-full pl-8 pr-3 py-1.5 bg-surface border border-border rounded text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Products List (Scrollable) */}
                <div className="max-h-60 overflow-y-auto p-1 space-y-0.5">
                  {/* Option: All Products */}
                  <button
                    onClick={() => handleProductFilter("ALL")}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs text-left transition-colors ${
                      selectedProductId === "ALL"
                        ? "bg-blue-600/15 text-blue-400 font-medium"
                        : "text-foreground hover:bg-surface-subtle"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>All Products ({products.length})</span>
                    </div>
                    {selectedProductId === "ALL" && <Check className="w-3.5 h-3.5 text-blue-400" />}
                  </button>

                  <div className="h-px bg-border my-1" />

                  {/* Filtered Products */}
                  {filteredProductsForDropdown.length === 0 ? (
                    <div className="py-4 text-center text-xs text-muted-foreground font-mono">
                      No products found
                    </div>
                  ) : (
                    filteredProductsForDropdown.map((p) => {
                      const isSelected = selectedProductId === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => handleProductFilter(p.id)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs text-left transition-colors ${
                            isSelected
                              ? "bg-blue-600/15 text-blue-400 font-medium"
                              : "text-foreground hover:bg-surface-subtle"
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <p className="truncate font-medium">{p.name}</p>
                            {p.sku && (
                              <p className="text-[10px] text-muted-foreground font-mono truncate">
                                SKU: {p.sku}
                              </p>
                            )}
                          </div>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Active Product Filter Chip (if selected) */}
          {selectedProduct && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-md text-xs">
              <span className="truncate max-w-[150px] font-medium">{selectedProduct.name}</span>
              <button
                onClick={() => handleProductFilter("ALL")}
                className="hover:text-foreground transition-colors"
                title="Clear filter"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Global Angles/Hooks Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search angles, hooks, avatars..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-surface border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Angles Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-muted-foreground font-mono">
          Loading angles &amp; hooks...
        </div>
      ) : filteredAngles.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-surface-subtle border border-border flex items-center justify-center mx-auto text-muted-foreground">
            <Inbox className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-semibold text-foreground">
            No marketing angles found
          </h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {searchQuery
              ? `No angles match "${searchQuery}".`
              : selectedProduct
              ? `No angles registered yet for "${selectedProduct.name}".`
              : "Register your first product marketing angle and hooks."}
          </p>
          <button
            onClick={() => setIsAngleDialogOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-medium hover:bg-blue-600/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Angle</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredAngles.map((angle) => (
            <AngleCard
              key={angle.id}
              angle={angle}
              onAddHook={(a) => setHookDialogAngle(a)}
              onRefresh={() => fetchAngles()}
            />
          ))}
        </div>
      )}

      {/* Angle Form Dialog */}
      <AngleFormDialog
        isOpen={isAngleDialogOpen}
        onClose={() => setIsAngleDialogOpen(false)}
        onSuccess={() => fetchAngles()}
      />

      {/* Hook Form Dialog */}
      <HookFormDialog
        angle={hookDialogAngle}
        isOpen={!!hookDialogAngle}
        onClose={() => setHookDialogAngle(null)}
        onSuccess={() => fetchAngles()}
      />
    </div>
  );
}
