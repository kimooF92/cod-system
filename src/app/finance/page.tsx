import { Wallet } from "lucide-react";

export default function FinancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Finance &amp; Cash Buckets
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Advertising Capital, Operations Reserve, Profit Vault, and transaction ledger
        </p>
      </div>

      <div className="bg-surface border border-border rounded-lg p-8 text-center">
        <Wallet className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-foreground">Finance Module Ready</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
          Cash bucket allocation and operating transaction ledger will activate in Epic 5.
        </p>
      </div>
    </div>
  );
}
