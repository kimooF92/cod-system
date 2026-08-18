import { FlaskConical } from "lucide-react";

export default function TestingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Product Testing Campaigns
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Bounded test management and benchmark comparison
        </p>
      </div>

      <div className="bg-surface border border-border rounded-lg p-8 text-center">
        <FlaskConical className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-foreground">Testing Hub Ready</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
          Active test tracking with budget limits and target CPL comparison will activate in Story 1.5.
        </p>
      </div>
    </div>
  );
}
