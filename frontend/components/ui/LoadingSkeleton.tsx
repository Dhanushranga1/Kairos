export default function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-800 rounded" style={{ width: `${75 + (i % 3) * 10}%` }} />
      ))}
    </div>
  );
}
