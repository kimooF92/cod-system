"use client";

import * as React from "react";
import { CreativeAssetCard } from "./creative-asset-card";
import { CreativeAssetDialog } from "./creative-asset-dialog";
import { getCreativeAssets, type CreativeAsset } from "@/actions/creative-assets";
import { getProducts, type Product } from "@/actions/products";
import { Plus, Search, Video, Inbox, Layers, Sparkles } from "lucide-react";

interface CreativeAssetListProps {
  initialAssets: CreativeAsset[];
}

const statusTabs = [
  { id: "ALL", label: "All Assets" },
  { id: "ACTIVE", label: "Active" },
  { id: "TESTING", label: "Testing" },
  { id: "FATIGUED", label: "Fatigued" },
  { id: "PAUSED", label: "Paused" },
];

export function CreativeAssetList({ initialAssets }: CreativeAssetListProps) {
  const [assets, setAssets] = React.useState<CreativeAsset[]>(initialAssets);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = React.useState("ALL");
  const [activeTab, setActiveTab] = React.useState("ALL");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  const fetchAssets = async (status = activeTab, prodId = selectedProductId) => {
    setLoading(true);
    const data = await getCreativeAssets({
      status: status !== "ALL" ? status : undefined,
      productId: prodId !== "ALL" ? prodId : undefined,
    });
    setAssets(data);
    setLoading(false);
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    fetchAssets(tabId, selectedProductId);
  };

  const handleProductFilter = (prodId: string) => {
    setSelectedProductId(prodId);
    fetchAssets(activeTab, prodId);
  };

  const filteredAssets = assets.filter((a) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      a.code.toLowerCase().includes(query) ||
      (a.product?.name && a.product.name.toLowerCase().includes(query)) ||
      (a.primary_hook_text && a.primary_hook_text.toLowerCase().includes(query)) ||
      (a.creator_source && a.creator_source.toLowerCase().includes(query))
    );
  });

  const winnersCount = assets.filter((a) => a.performance_tag === "WINNER").length;
  const activeCount = assets.filter((a) => a.lifecycle_status === "ACTIVE").length;
  const testingCount = assets.filter((a) => a.lifecycle_status === "TESTING").length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Creative Asset Library
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage individual videos, images, aspect ratios &amp; performance tags
          </p>
        </div>

        <button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register Creative Asset</span>
        </button>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-surface border border-border rounded-lg flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Winner Creatives</span>
          <span className="text-base font-mono font-bold text-emerald-400 tabular-nums">
            {winnersCount}
          </span>
        </div>

        <div className="p-3 bg-surface border border-border rounded-lg flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Active in Scaling</span>
          <span className="text-base font-mono font-bold text-blue-400 tabular-nums">
            {activeCount}
          </span>
        </div>

        <div className="p-3 bg-surface border border-border rounded-lg flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Under Test</span>
          <span className="text-base font-mono font-bold text-purple-400 tabular-nums">
            {testingCount}
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
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
            placeholder="Search code, product, hook..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-surface border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Product Sub-filter */}
      <div className="flex items-center gap-1 overflow-x-auto text-xs py-1">
        <span className="text-[11px] font-mono text-muted-foreground mr-2">Product:</span>
        <button
          onClick={() => handleProductFilter("ALL")}
          className={`px-2.5 py-1 rounded text-xs transition-colors ${
            selectedProductId === "ALL"
              ? "bg-surface-subtle text-foreground font-semibold border border-border"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          All
        </button>
        {products.map((p) => (
          <button
            key={p.id}
            onClick={() => handleProductFilter(p.id)}
            className={`px-2.5 py-1 rounded text-xs transition-colors whitespace-nowrap ${
              selectedProductId === p.id
                ? "bg-surface-subtle text-foreground font-semibold border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Assets Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-muted-foreground font-mono">
          Loading creative assets...
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-surface-subtle border border-border flex items-center justify-center mx-auto text-muted-foreground">
            <Inbox className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-semibold text-foreground">
            No creative assets found
          </h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {searchQuery
              ? `No assets match "${searchQuery}".`
              : "Register your first ad creative asset."}
          </p>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-medium hover:bg-blue-600/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register First Creative</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map((asset) => (
            <CreativeAssetCard
              key={asset.id}
              asset={asset}
              onRefresh={() => fetchAssets()}
            />
          ))}
        </div>
      )}

      {/* Registration Dialog */}
      <CreativeAssetDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={() => fetchAssets()}
      />
    </div>
  );
}
