"use client";

import { useEffect, useState } from "react";
import { fetchData, runAnalysis, sendChat } from "@/lib/api";
import type { Analysis, ChatMessage, ProjectData } from "@/lib/types";

import Header from "@/components/Header";
import HealthCard from "@/components/HealthCard";
import SprintProgressCard from "@/components/SprintProgressCard";
import DataOverviewCard from "@/components/DataOverviewCard";
import KeyIssuesCard from "@/components/KeyIssuesCard";
import BlockersCard from "@/components/BlockersCard";
import RecommendationsCard from "@/components/RecommendationsCard";
import FollowUpsCard from "@/components/FollowUpsCard";
import ChatPanel from "@/components/ChatPanel";

export default function Home() {
  const [data, setData] = useState<ProjectData | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    Promise.all([fetchData(), runAnalysis()])
      .then(([d, a]) => {
        setData(d);
        setAnalysis(a);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleAnalyse() {
    setLoading(true);
    setError(null);
    try {
      const a = await runAnalysis();
      setAnalysis(a);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function handleChat(e: { preventDefault(): void }) {
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
      setChatHistory([...newHistory, { role: "assistant", content: "Something went wrong. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  }

  const sprintName = data?.tickets[0]?.sprint ?? "Sprint 4";

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans flex flex-col">
      <Header
        loading={loading}
        sprintName={sprintName}
        onAnalyse={handleAnalyse}
        dataSource="mock"
      />

      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-900/40 border border-red-700 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          <HealthCard analysis={analysis} loading={loading} />
          <SprintProgressCard health={analysis?.sprint_health} loading={loading} />
          <DataOverviewCard data={data} />
        </div>

        {/* Right columns */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <KeyIssuesCard issues={analysis?.key_issues} loading={loading} />
            <BlockersCard blockers={analysis?.blockers} loading={loading} />
          </div>
          <RecommendationsCard recommendations={analysis?.recommendations} loading={loading} />
          <FollowUpsCard followUps={analysis?.follow_ups} />
        </div>
      </main>

      <ChatPanel
        history={chatHistory}
        input={chatInput}
        loading={chatLoading}
        onInputChange={setChatInput}
        onSubmit={handleChat}
      />
    </div>
  );
}
