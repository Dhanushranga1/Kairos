import type { Analysis, ChatMessage, ProjectData } from "./types";

const BASE = "http://localhost:8080";

export async function fetchData(): Promise<ProjectData> {
  const res = await fetch(`${BASE}/api/data`);
  if (!res.ok) throw new Error("Failed to load project data");
  return res.json();
}

export async function runAnalysis(): Promise<Analysis> {
  const res = await fetch(`${BASE}/api/analyse`, { method: "POST" });
  if (!res.ok) throw new Error("Analysis failed");
  return res.json();
}

export async function sendChat(
  message: string,
  history: ChatMessage[]
): Promise<string> {
  const res = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });
  if (!res.ok) throw new Error("Chat failed");
  const data = await res.json();
  return data.reply;
}
