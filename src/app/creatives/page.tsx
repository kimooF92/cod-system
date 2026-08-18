import { Sparkles } from "lucide-react";

export default function CreativesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Creative Library &amp; Ad Performance
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage marketing angles, hooks, and Meta Ads CSV performance imports
        </p>
      </div>

      <div className="bg-surface border border-border rounded-lg p-8 text-center">
        <Sparkles className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-foreground">Creatives Module Ready</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
          Creative cards and PapaParse CSV import engine will activate in Epic 2.
        </p>
      </div>
    </div>
  );
}
