import json
from datetime import date

from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage

from prompts import ANALYSIS_SYSTEM_PROMPT, CHAT_SYSTEM_PROMPT

MODEL = "llama-3.3-70b-versatile"

analysis_llm = ChatGroq(model=MODEL, temperature=0.2, max_tokens=1500)
chat_llm = ChatGroq(model=MODEL, temperature=0.5, max_tokens=800)


def build_context(data: dict) -> str:
    today = date.today().isoformat()
    tickets = data["tickets"]
    emails = data["emails"]
    messages = data["team_messages"]
    members = data["team_members"]

    lines = [f"DATE: {today}", f"SPRINT: Sprint 4", ""]

    lines.append(f"=== JIRA TICKETS ({len(tickets)} total) ===")
    for t in tickets:
        overdue = ""
        if t["due_date"] < today and t["status"] != "done":
            overdue = " — OVERDUE"
        lines.append(f"[{t['id']}] {t['title']}")
        lines.append(f"  Status: {t['status']} | Priority: {t['priority']} | Assignee: {t['assignee'] or 'Unassigned'}")
        lines.append(f"  Due: {t['due_date']}{overdue}")
        if t.get("blocked_by"):
            lines.append(f"  Blocked by: {t['blocked_by']}")

    lines.append("")
    lines.append(f"=== OUTLOOK EMAILS ({len(emails)} total) ===")
    for e in emails:
        no_reply = " — NO REPLY" if not e["has_reply"] else ""
        lines.append(f"FROM: {e['from']} | {e['received_date']}{no_reply}")
        lines.append(f"SUBJECT: {e['subject']}")
        lines.append(e["body"][:150])

    lines.append("")
    lines.append(f"=== TEAM MESSAGES ({len(messages)} total) ===")
    for m in messages:
        unanswered = " — UNANSWERED" if not m["has_response"] else ""
        lines.append(f"[{m['channel']}] {m['author']} ({m['timestamp'][:10]}): {m['message']}{unanswered}")

    lines.append("")
    lines.append(f"=== TEAM ({len(members)} members) ===")
    for p in members:
        tasks = ", ".join(p["current_tasks"]) or "nothing"
        lines.append(f"{p['name']} — {p['role']} — assigned to: {tasks}")

    return "\n".join(lines)


def run_analysis(data: dict) -> dict:
    context = build_context(data)
    messages = [
        SystemMessage(content=ANALYSIS_SYSTEM_PROMPT),
        HumanMessage(content=f"Analyse this project data:\n\n{context}"),
    ]
    response = analysis_llm.invoke(messages)
    text = response.content.strip()

    # Strip markdown code fences if present
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
        text = text.strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Retry once with explicit instruction
        messages.append(response)
        messages.append(HumanMessage(content="Return only valid JSON, nothing else."))
        retry = analysis_llm.invoke(messages)
        return json.loads(retry.content.strip())


def chat(message: str, history: list[dict], data: dict) -> str:
    context = build_context(data)

    msgs = [SystemMessage(content=CHAT_SYSTEM_PROMPT)]
    msgs.append(HumanMessage(content=f"Project context:\n{context}"))

    for turn in history[-6:]:
        if turn["role"] == "user":
            msgs.append(HumanMessage(content=turn["content"]))
        else:
            msgs.append(AIMessage(content=turn["content"]))

    msgs.append(HumanMessage(content=message))

    response = chat_llm.invoke(msgs)
    return response.content
