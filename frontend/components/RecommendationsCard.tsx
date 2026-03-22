import Card from "@/components/ui/Card";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

export default function RecommendationsCard({ recommendations, loading }: { recommendations?: string[]; loading: boolean }) {
  return (
    <Card title="Recommendations">
      {loading && <LoadingSkeleton rows={3} />}
      {!loading && (!recommendations || recommendations.length === 0) && (
        <p className="text-gray-600 text-sm">No recommendations yet.</p>
      )}
      {!loading && recommendations && recommendations.length > 0 && (
        <ol className="space-y-3">
          {recommendations.map((rec, i) => (
            <li key={i} className="flex gap-3 text-sm text-gray-300">
              <span className="text-indigo-400 font-bold flex-shrink-0">{i + 1}.</span>
              <span>{rec}</span>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
