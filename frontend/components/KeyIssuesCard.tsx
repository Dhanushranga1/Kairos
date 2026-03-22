import Card from "@/components/ui/Card";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

export default function KeyIssuesCard({ issues, loading }: { issues?: string[]; loading: boolean }) {
  return (
    <Card title="Key Issues">
      {loading && <LoadingSkeleton rows={3} />}
      {!loading && (!issues || issues.length === 0) && (
        <p className="text-gray-600 text-sm">No issues found.</p>
      )}
      {!loading && issues && issues.length > 0 && (
        <ul className="space-y-2">
          {issues.map((issue, i) => (
            <li key={i} className="flex gap-3 text-sm text-gray-300">
              <span className="text-amber-500 mt-0.5 flex-shrink-0">&#9656;</span>
              <span>{issue}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
