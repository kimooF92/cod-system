import { Settings, Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            System &amp; Decision Settings
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure sample size thresholds, target delivery rates, and default fulfillment costs
          </p>
        </div>

        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors shadow-sm">
          <Save className="w-3.5 h-3.5" />
          <span>Save Settings</span>
        </button>
      </div>

      <div className="bg-surface border border-border rounded-lg p-6 space-y-5">
        <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
          Decision Engine Sample Thresholds
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Medium Confidence Minimum Leads
            </label>
            <input
              type="number"
              defaultValue={10}
              className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs font-mono text-foreground focus:outline-none focus:border-blue-500"
            />
            <p className="text-[11px] text-muted-foreground">
              Default: 10 leads before issuing preliminary recommendations.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              High Confidence Minimum Leads (3+ days)
            </label>
            <input
              type="number"
              defaultValue={25}
              className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs font-mono text-foreground focus:outline-none focus:border-blue-500"
            />
            <p className="text-[11px] text-muted-foreground">
              Default: 25 leads with at least 3 observed days for high-confidence decisions.
            </p>
          </div>
        </div>

        <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2 pt-2">
          Default Fulfillment Costs (Tunisian Dinar)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Packaging Cost (DT)
            </label>
            <input
              type="number"
              step="0.100"
              defaultValue={1.5}
              className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs font-mono text-foreground focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Delivery Cost (DT)
            </label>
            <input
              type="number"
              step="0.500"
              defaultValue={7.0}
              className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs font-mono text-foreground focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Return Cost (DT)
            </label>
            <input
              type="number"
              step="0.500"
              defaultValue={3.5}
              className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs font-mono text-foreground focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
