"use client";

import { useEffect, useRef, useState } from "react";
import { fetchData, runAnalysis, sendChat } from "@/lib/api";
import type { Analysis, ChatMessage, ProjectData } from "@/lib/types";

export default function Home() {
  const [data, setData] = useState<ProjectData | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([fetchData(), runAnalysis()])
      .then(([d, a]) => {
        setData(d);
        setAnalysis(a);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  async function handleAnalyse() {
    setLoading(true);
    setError(null);
    try {
      const a = await runAnalysis();
      setAnalysis(a);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function handleChat(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg: ChatMessage = { role: "user", content: chatInput };
    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory);
    setChatInput("");
    setChatLoading(true);

    try {
      const reply = await sendChat(chatInput, chatHistory);
      setChatHistory([...newHistory, { role: "assistant", content: reply }]);
    } catch {
      setChatHistory([
        ...newHistory,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setChatLoading(false);
    }
  }

  const healthConfig = {
    Green: { bg: "bg-green-500", text: "text-green-700", border: "border-green-300", light: "bg-green-50" },
    Amber: { bg: "bg-amber-400", text: "text-amber-700", border: "border-amber-300", light: "bg-amber-50" },
    Red: { bg: "bg-red-500", text: "text-red-700", border: "border-red-300", light: "bg-red-50" },
  };

  const h = analysis ? healthConfig[analysis.health] : healthConfig["Amber"];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-sm">K</div>
          <span className="font-semibold text-lg tracking-tight">Kairos</span>
          <span className="text-gray-500 text-sm">/ Sprint 4</span>
        </div>
        <button
          type="button"
          onClick={handleAnalyse}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
        >
          {loading ? "Analysing…" : "Run Analysis"}
        </button>
      </header>

      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-900/40 border border-red-700 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Main grid */}
      <main className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          {/* Health card */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="text-xs text-gray-500 uppercase tracking-widest mb-3">Project Health</div>
            {loading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-8 bg-gray-800 rounded w-24" />
                <div className="h-4 bg-gray-800 rounded w-full" />
              </div>
            ) : analysis ? (
              <>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold mb-2 ${h.light} ${h.text}`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${h.bg}`} />
                  {analysis.health}
                </div>
                <p className="text-gray-400 text-sm mt-2">{analysis.health_reason}</p>
                <p className="text-gray-300 text-sm mt-3 leading-relaxed">{analysis.summary}</p>
              </>
            ) : null}
          </div>

          {/* Sprint progress */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="text-xs text-gray-500 uppercase tracking-widest mb-4">Sprint Progress</div>
            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-3 bg-gray-800 rounded" />
                <div className="h-4 bg-gray-800 rounded w-3/4" />
              </div>
            ) : analysis ? (
              <>
                <SprintBar health={analysis.sprint_health} />
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <Stat label="Total" value={analysis.sprint_health.total_tickets} color="text-gray-300" />
                  <Stat label="Done" value={analysis.sprint_health.done} color="text-green-400" />
                  <Stat label="In Progress" value={analysis.sprint_health.in_progress} color="text-blue-400" />
                  <Stat label="Blocked" value={analysis.sprint_health.blocked} color="text-red-400" />
                </div>
              </>
            ) : null}
          </div>

          {/* Data counts */}
          {data && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-4">Data Overview</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Tickets</span><span className="text-gray-200">{data.tickets.length}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Emails</span><span className="text-gray-200">{data.emails.length}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Messages</span><span className="text-gray-200">{data.team_messages.length}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Team</span><span className="text-gray-200">{data.team_members.length}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right columns */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Key issues + Blockers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Key Issues">
              {loading ? (
                <LoadingSkeleton rows={3} />
              ) : analysis?.key_issues.length ? (
                <ul className="space-y-2">
                  {analysis.key_issues.map((issue, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-300">
                      <span className="text-amber-400 mt-0.5 shrink-0">▸</span>
                      {issue}
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty />
              )}
            </Card>

            <Card title="Blockers">
              {loading ? (
                <LoadingSkeleton rows={2} />
              ) : analysis?.blockers.length ? (
                <ul className="space-y-3">
                  {analysis.blockers.map((b, i) => (
                    <li key={i} className="text-sm border-l-2 border-red-500 pl-3">
                      <div className="font-medium text-gray-200">{b.person}</div>
                      <div className="text-gray-400">{b.task}</div>
                      <div className="text-red-400 text-xs mt-0.5">{b.reason}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty text="No blockers" />
              )}
            </Card>
          </div>

          {/* Recommendations */}
          <Card title="Recommendations">
            {loading ? (
              <LoadingSkeleton rows={3} />
            ) : analysis?.recommendations.length ? (
              <ol className="space-y-2">
                {analysis.recommendations.map((rec, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-300">
                    <span className="text-indigo-400 font-bold shrink-0">{i + 1}.</span>
                    {rec}
                  </li>
                ))}
              </ol>
            ) : (
              <Empty />
            )}
          </Card>

          {/* Follow-ups */}
          {analysis?.follow_ups?.length ? (
            <Card title="Suggested Follow-ups">
              <div className="space-y-3">
                {analysis.follow_ups.map((f, i) => (
                  <div key={i} className="bg-gray-800 rounded-lg p-3 text-sm">
                    <div className="flex gap-2 text-gray-400 mb-1">
                      <span>To:</span><span className="text-gray-200">{f.to}</span>
                    </div>
                    <div className="flex gap-2 text-gray-400 mb-2">
                      <span>Subject:</span><span className="text-gray-200">{f.subject}</span>
                    </div>
                    <p className="text-gray-300 text-xs leading-relaxed whitespace-pre-wrap">{f.message}</p>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}
        </div>
      </main>

      {/* Chat */}
      <div className="mx-6 mb-6 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-800 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500" />
          <span className="text-sm font-medium">Chat with Kairos</span>
        </div>

        {/* Messages */}
        <div className="h-64 overflow-y-auto px-5 py-4 space-y-4">
          {chatHistory.length === 0 && (
            <div className="text-gray-600 text-sm text-center mt-8">
              Ask anything about the project — blockers, emails, team, drafts…
            </div>
          )}
          {chatHistory.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-sm"
                    : "bg-gray-800 text-gray-200 rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {chatLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 px-4 py-2.5 rounded-2xl rounded-bl-sm">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleChat} className="px-5 py-3 border-t border-gray-800 flex gap-3">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask about blockers, draft an email, get advice…"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            type="submit"
            disabled={chatLoading || !chatInput.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

// --- Sub-components ---

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="text-xs text-gray-500 uppercase tracking-widest mb-4">{title}</div>
      {children}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className={`font-semibold ${color}`}>{value}</span>
    </div>
  );
}

function SprintBar({ health }: { health: Analysis["sprint_health"] }) {
  const { total_tickets, done, in_progress, blocked, todo } = health;
  if (!total_tickets) return null;

  // Use flex proportions so no inline width styles are needed
  const segments = [
    { flex: done, className: "bg-green-500", label: `Done: ${done}` },
    { flex: in_progress, className: "bg-blue-500", label: `In Progress: ${in_progress}` },
    { flex: blocked, className: "bg-red-500", label: `Blocked: ${blocked}` },
    { flex: todo, className: "bg-gray-700", label: `Todo: ${todo}` },
  ].filter((s) => s.flex > 0);

  return (
    <div className="w-full h-3 rounded-full overflow-hidden flex gap-0.5">
      {segments.map((s, i) => (
        <SprintSegment key={i} flex={s.flex} className={s.className} label={s.label} />
      ))}
    </div>
  );
}

function SprintSegment({ flex, className, label }: { flex: number; className: string; label: string }) {
  // CSS custom property to drive flex-grow without inline width
  return (
    <div
      className={`${className} h-full`}
      title={label}
      data-flex={flex}
      ref={(el) => {
        if (el) el.style.flex = String(flex);
      }}
    />
  );
}

const SKELETON_WIDTHS = ["w-full", "w-4/5", "w-3/4", "w-full", "w-4/5"];

function LoadingSkeleton({ rows }: { rows: number }) {
  return (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`h-4 bg-gray-800 rounded ${SKELETON_WIDTHS[i % SKELETON_WIDTHS.length]}`} />
      ))}
    </div>
  );
}

function Empty({ text = "Nothing to show" }: { text?: string }) {
  return <p className="text-gray-600 text-sm">{text}</p>;
}
