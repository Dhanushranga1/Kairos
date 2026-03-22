import { Analysis } from "@/lib/types";
import Card from "@/components/ui/Card";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

const HEALTH_CONFIG = {
  Green: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30", dot: "bg-emerald-400" },
  Amber: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30", dot: "bg-amber-400" },
  Red: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30", dot: "bg-red-400" },
};

export default function HealthCard({ analysis, loading }: { analysis: Analysis | null; loading: boolean }) {
  const cfg = analysis ? HEALTH_CONFIG[analysis.health] : null;

  return (
    <Card title="Sprint Health">
      {loading && <LoadingSkeleton rows={4} />}
      {!loading && !analysis && <p className="text-gray-600 text-sm">Run analysis to see results.</p>}
      {!loading && analysis && cfg && (
        <div className="space-y-3">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${cfg.bg} ${cfg.border}`}>
            <span className={`w-2 h-2 rounded-full ${cfg.dot} animate-pulse`} />
            <span className={`font-bold text-sm ${cfg.text}`}>{analysis.health}</span>
          </div>
          <p className="text-sm text-gray-400">{analysis.health_reason}</p>
          <p className="text-sm text-gray-300 leading-relaxed">{analysis.summary}</p>
        </div>
      )}
    </Card>
  );
}
