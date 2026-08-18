"use client";

import * as React from "react";
import { ResearchItemCard } from "./research-item-card";
import { ResearchFormDialog } from "./research-form-dialog";
import { getResearchItems, type ResearchItem } from "@/actions/research";
import { Plus, Search, Filter, Sparkles, Inbox } from "lucide-react";

interface ResearchListProps {
  initialItems: ResearchItem[];
}

const filterTabs = [
  { id: "ALL", label: "All Items" },
  { id: "READY_FOR_TEST", label: "Ready For Test" },
  { id: "VALIDATING", label: "Validating" },
  { id: "IDEA", label: "Ideas" },
  { id: "CONVERTED", label: "Converted" },
  { id: "DISCARDED", label: "Discarded" },
];

export function ResearchList({ initialItems }: ResearchListProps) {
  const [items, setItems] = React.useState<ResearchItem[]>(initialItems);
  const [activeTab, setActiveTab] = React.useState("ALL");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const fetchItems = async (status = activeTab) => {
    setLoading(true);
    const data = await getResearchItems(status);
    setItems(data);
    setLoading(false);
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    fetchItems(tabId);
  };

  const filteredItems = items.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.problem.toLowerCase().includes(query) ||
      item.target_customer.toLowerCase().includes(query) ||
      item.promise.toLowerCase().includes(query) ||
      (item.creative_opportunities && item.creative_opportunities.toLowerCase().includes(query))
    );
  });

  // Calculate quick stats
  const readyCount = items.filter((i) => i.status === "READY_FOR_TEST").length;
  const validatingCount = items.filter((i) => i.status === "VALIDATING").length;
  const ideaCount = items.filter((i) => i.status === "IDEA").length;

  return (
    <div className="space-y-6">
      {/* Top Bar: Title, Quick Stats, New Item CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Product Research &amp; Backlog
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Log ideas, validate unit economics, and prepare products for test campaigns
          </p>
        </div>

        <button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Research Item</span>
        </button>
      </div>

      {/* Quick Summary Pill Bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-surface border border-border rounded-lg flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Ready for Test</span>
          <span className="text-base font-mono font-bold text-emerald-400 tabular-nums">
            {readyCount}
          </span>
        </div>

        <div className="p-3 bg-surface border border-border rounded-lg flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Validating</span>
          <span className="text-base font-mono font-bold text-blue-400 tabular-nums">
            {validatingCount}
          </span>
        </div>

        <div className="p-3 bg-surface border border-border rounded-lg flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Raw Ideas</span>
          <span className="text-base font-mono font-bold text-muted-foreground tabular-nums">
            {ideaCount}
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-1 overflow-x-auto">
          {filterTabs.map((tab) => (
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
            placeholder="Search problem, customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-surface border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Research Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-muted-foreground font-mono">
          Loading research backlog...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-surface-subtle border border-border flex items-center justify-center mx-auto text-muted-foreground">
            <Inbox className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-semibold text-foreground">
            No research items found
          </h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {searchQuery
              ? `No items match the search query "${searchQuery}".`
              : `No items currently in status "${activeTab}".`}
          </p>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-medium hover:bg-blue-600/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Idea</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <ResearchItemCard
              key={item.id}
              item={item}
              onRefresh={() => fetchItems()}
            />
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      <ResearchFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={() => fetchItems()}
      />
    </div>
  );
}
