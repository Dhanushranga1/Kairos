import { Blocker } from "@/lib/types";
import Card from "@/components/ui/Card";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

export default function BlockersCard({ blockers, loading }: { blockers?: Blocker[]; loading: boolean }) {
  return (
    <Card title="Blockers">
      {loading && <LoadingSkeleton rows={3} />}
      {!loading && (!blockers || blockers.length === 0) && (
        <p className="text-gray-600 text-sm">No blockers detected.</p>
      )}
      {!loading && blockers && blockers.length > 0 && (
        <ul className="space-y-3">
          {blockers.map((b, i) => (
            <li key={i} className="pl-3 border-l-2 border-red-600">
              <p className="text-sm font-semibold text-white">{b.person}</p>
              <p className="text-xs text-gray-400 mt-0.5">{b.task}</p>
              <p className="text-xs text-red-400 mt-1">{b.reason}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
