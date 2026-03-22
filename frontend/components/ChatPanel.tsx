"use client";

import { useEffect, useRef, FormEvent } from "react";
import { ChatMessage } from "@/lib/types";

export default function ChatPanel({
  history,
  input,
  loading,
  onInputChange,
  onSubmit,
}: {
  history: ChatMessage[];
  input: string;
  loading: boolean;
  onInputChange: (v: string) => void;
  onSubmit: (e: FormEvent) => void;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  return (
    <section className="border-t border-gray-800 bg-gray-950">
      <div className="max-w-5xl mx-auto px-6 py-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
          Chat with Kairos
        </h2>

        {/* Message history */}
        <div className="space-y-3 mb-4 max-h-72 overflow-y-auto pr-1">
          {history.length === 0 && (
            <p className="text-gray-600 text-sm">
              Ask anything about the sprint — blockers, status, or draft a follow-up email.
            </p>
          )}
          {history.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-2xl px-4 py-2.5 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-800 text-gray-200"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="px-4 py-2.5 rounded-xl bg-gray-800">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <form onSubmit={onSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder='e.g. "Who is blocked?" or "Draft a follow-up to the client"'
            disabled={loading}
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-2.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </section>
  );
}
