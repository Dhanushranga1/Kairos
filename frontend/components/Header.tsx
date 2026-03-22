"use client";

export default function Header({
  loading,
  sprintName,
  onAnalyse,
  dataSource,
}: {
  loading: boolean;
  sprintName: string;
  onAnalyse: () => void;
  dataSource: string;
}) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-950">
      <div className="flex items-center gap-4">
        <div>
          <span className="text-xl font-bold tracking-tight text-white">Kairos</span>
          <span className="ml-2 text-xs text-gray-500 font-medium uppercase tracking-widest">AI Project Manager</span>
        </div>
        <span className="hidden sm:block text-gray-700">|</span>
        <span className="hidden sm:block text-sm text-gray-400">{sprintName}</span>
        <span className="text-xs px-2 py-0.5 rounded-full border border-gray-700 text-gray-500 font-mono">
          {dataSource}
        </span>
      </div>
      <button
        onClick={onAnalyse}
        disabled={loading}
        className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
      >
        {loading ? "Analysing..." : "Run Analysis"}
      </button>
    </header>
  );
}
