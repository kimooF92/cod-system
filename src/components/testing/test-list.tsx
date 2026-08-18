"use client";

import * as React from "react";
import { TestCard } from "./test-card";
import { TestFormDialog } from "./test-form-dialog";
import { getProductTests, type ProductTest } from "@/actions/tests";
import { Plus, Search, FlaskConical, Inbox, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface TestListProps {
  initialTests: ProductTest[];
}

const filterTabs = [
  { id: "ALL", label: "All Tests" },
  { id: "RUNNING", label: "Running Tests" },
  { id: "COMPLETED", label: "Completed" },
  { id: "CANCELLED", label: "Cancelled" },
];

export function TestList({ initialTests }: TestListProps) {
  const [tests, setTests] = React.useState<ProductTest[]>(initialTests);
  const [activeTab, setActiveTab] = React.useState("ALL");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const fetchTests = async (status = activeTab) => {
    setLoading(true);
    const data = await getProductTests(status);
    setTests(data);
    setLoading(false);
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    fetchTests(tabId);
  };

  const filteredTests = tests.filter((t) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (t.product?.name && t.product.name.toLowerCase().includes(query)) ||
      (t.product?.sku && t.product.sku.toLowerCase().includes(query)) ||
      (t.notes && t.notes.toLowerCase().includes(query))
    );
  });

  const runningCount = tests.filter((t) => t.status === "RUNNING").length;
  const totalSpend = tests.reduce((sum, t) => sum + (t.performance?.adSpend || 0), 0);
  const totalLeads = tests.reduce((sum, t) => sum + (t.performance?.leads || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Product Testing Campaigns
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Bounded ad testing with budget caps, benchmark metrics &amp; profit per lead
          </p>
        </div>

        <button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Launch Bounded Test</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-surface border border-border rounded-lg flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Active Tests</span>
          <span className="text-base font-mono font-bold text-blue-400 tabular-nums">
            {runningCount}
          </span>
        </div>

        <div className="p-3 bg-surface border border-border rounded-lg flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Total Test Spend</span>
          <span className="text-base font-mono font-bold text-foreground tabular-nums">
            {formatCurrency(totalSpend)}
          </span>
        </div>

        <div className="p-3 bg-surface border border-border rounded-lg flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Test Leads Gathered</span>
          <span className="text-base font-mono font-bold text-emerald-400 tabular-nums">
            {totalLeads}
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
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
            placeholder="Search test campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-surface border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Tests Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-muted-foreground font-mono">
          Loading testing campaigns...
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-surface-subtle border border-border flex items-center justify-center mx-auto text-muted-foreground">
            <Inbox className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-semibold text-foreground">
            No test campaigns found
          </h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {searchQuery
              ? `No campaigns match "${searchQuery}".`
              : `No test campaigns in status "${activeTab}".`}
          </p>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-medium hover:bg-blue-600/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Launch First Test</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredTests.map((test) => (
            <TestCard key={test.id} test={test} onRefresh={() => fetchTests()} />
          ))}
        </div>
      )}

      {/* Launch Dialog */}
      <TestFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={() => fetchTests()}
      />
    </div>
  );
}
