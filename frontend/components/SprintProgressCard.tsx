import { SprintHealth } from "@/lib/types";
import Card from "@/components/ui/Card";
import SprintBar from "@/components/ui/SprintBar";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-800 last:border-0">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${color}`} />
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

export default function SprintProgressCard({ health, loading }: { health?: SprintHealth; loading: boolean }) {
  return (
    <Card title="Sprint Progress">
      {loading && <LoadingSkeleton rows={5} />}
      {!loading && !health && <p className="text-gray-600 text-sm">No data yet.</p>}
      {!loading && health && (
        <div className="space-y-4">
          <SprintBar health={health} />
          <div>
            <Stat label="Done" value={health.done} color="bg-emerald-500" />
            <Stat label="In Progress" value={health.in_progress} color="bg-blue-500" />
            <Stat label="Blocked" value={health.blocked} color="bg-red-500" />
            <Stat label="To Do" value={health.todo} color="bg-gray-600" />
          </div>
          <p className="text-xs text-gray-600">Total: {health.total_tickets} tickets</p>
        </div>
      )}
    </Card>
  );
}
