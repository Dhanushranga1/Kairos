import { SprintHealth } from "@/lib/types";

function Segment({ flex, color, label }: { flex: number; color: string; label: string }) {
  if (flex === 0) return null;
  return (
    <div
      className={`${color} h-full rounded-sm`}
      style={{ flex }}
      title={label}
    />
  );
}

export default function SprintBar({ health }: { health: SprintHealth }) {
  const { done, in_progress, blocked, todo } = health;
  return (
    <div className="flex gap-0.5 h-3 w-full rounded overflow-hidden bg-gray-800">
      <Segment flex={done} color="bg-emerald-500" label={`Done: ${done}`} />
      <Segment flex={in_progress} color="bg-blue-500" label={`In Progress: ${in_progress}`} />
      <Segment flex={blocked} color="bg-red-500" label={`Blocked: ${blocked}`} />
      <Segment flex={todo} color="bg-gray-600" label={`Todo: ${todo}`} />
    </div>
  );
}
