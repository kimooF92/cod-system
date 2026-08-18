import { LineChart } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Analytics &amp; Historical Trends
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Delivered ROAS, CPL trends, and delivery rates by Tunisian governorate
        </p>
      </div>

      <div className="bg-surface border border-border rounded-lg p-8 text-center">
        <LineChart className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-foreground">Analytics Engine Ready</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
          Historical trend visualization and governorate breakdowns will activate in Epic 7.
        </p>
      </div>
    </div>
  );
}
