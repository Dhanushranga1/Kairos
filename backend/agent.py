import json
from datetime import date

from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent

from models import NormalizedData
from prompts import ANALYSIS_SYSTEM_PROMPT, CHAT_SYSTEM_PROMPT

MODEL = "llama-3.3-70b-versatile"


# ---------------------------------------------------------------------------
# Tool computation helpers — pure Python, no LLM needed
# ---------------------------------------------------------------------------

def _sprint_overview(data: NormalizedData) -> str:
    today = date.today().isoformat()
    counts = {"todo": 0, "in_progress": 0, "in_review": 0, "blocked": 0, "done": 0}
    overdue, unassigned_high = [], []

    for t in data.tickets:
        counts[t.status] = counts.get(t.status, 0) + 1
        if t.due_date and t.due_date < today and t.status != "done":
            delta = (date.fromisoformat(today) - date.fromisoformat(t.due_date)).days
            overdue.append(f"{t.id} ({delta} days overdue)")
        if t.assignee is None and t.priority == "high":
            unassigned_high.append(f"{t.id}: {t.title}")

    total = len(data.tickets)
    done = counts.get("done", 0)
    pct = round(done / total * 100) if total else 0

    lines = [
        f"Sprint: {data.tickets[0].sprint if data.tickets else 'Unknown'}",
        f"Total: {total} | Done: {done} | In Progress: {counts.get('in_progress',0)} "
        f"| In Review: {counts.get('in_review',0)} | Blocked: {counts.get('blocked',0)} "
        f"| Todo: {counts.get('todo',0)}",
        f"Completion: {pct}%",
        f"Overdue: {', '.join(overdue) if overdue else 'None'}",
        f"Unassigned high-priority: {', '.join(unassigned_high) if unassigned_high else 'None'}",
    ]
    return "\n".join(lines)


def _find_blockers(data: NormalizedData) -> str:
    today = date.today().isoformat()
    ticket_map = {t.id: t for t in data.tickets}
    chains, unassigned = [], []

    for t in data.tickets:
        if t.status == "blocked" and t.blocked_by:
            blocker = ticket_map.get(t.blocked_by)
            assignee = t.assignee or "UNASSIGNED"
            if blocker:
                b_assignee = blocker.assignee or "UNASSIGNED"
                chains.append(
                    f"  {t.id} ({assignee}) blocked by {blocker.id} "
                    f"[{blocker.status}, {b_assignee}]"
                )
            else:
                chains.append(f"  {t.id} ({assignee}) blocked by {t.blocked_by} [not found]")

        if t.assignee is None and t.priority == "high":
            overdue_note = ""
            if t.due_date and t.due_date < today:
                delta = (date.fromisoformat(today) - date.fromisoformat(t.due_date)).days
                overdue_note = f" — overdue {delta} days"
            unassigned.append(f"  {t.id}: {t.title}{overdue_note}")

    out = ["Blocking chains:"]
    out += chains if chains else ["  None"]
    out += ["", "Unassigned high-priority tickets:"]
    out += unassigned if unassigned else ["  None"]
    return "\n".join(out)


def _unanswered_comms(data: NormalizedData) -> str:
    today = date.today().isoformat()
    unanswered_emails, unanswered_msgs = [], []

    for e in data.emails:
        if not e.has_reply:
            delta = (date.fromisoformat(today) - date.fromisoformat(e.received_at)).days
            unanswered_emails.append(
                f"  [{e.importance.upper()}] {e.sender_address} — \"{e.subject}\" "
                f"({e.received_at}, {delta}d ago)"
            )

    for m in data.messages:
        if not m.has_response:
            unanswered_msgs.append(
                f"  [{m.channel}] {m.author}: {m.body[:100]}{'...' if len(m.body) > 100 else ''}"
            )

    out = [f"Unanswered emails ({len(unanswered_emails)}):"]
    out += unanswered_emails if unanswered_emails else ["  None"]
    out += ["", f"Unanswered team messages ({len(unanswered_msgs)}):"]
    out += unanswered_msgs if unanswered_msgs else ["  None"]
    return "\n".join(out)


def _project_health(data: NormalizedData) -> str:
    today = date.today().isoformat()
    blocked_count = sum(1 for t in data.tickets if t.status == "blocked")
    overdue_count = sum(
        1 for t in data.tickets
        if t.due_date and t.due_date < today and t.status != "done"
    )
    unanswered_high = sum(
        1 for e in data.emails
        if not e.has_reply and e.importance == "high"
    )
    unassigned_high = sum(
        1 for t in data.tickets
        if t.assignee is None and t.priority == "high"
    )
    client_escalation = any(
        not e.has_reply and "client" in e.subject.lower() or "escalation" in e.subject.lower()
        for e in data.emails
    )

    if blocked_count >= 2 or (overdue_count >= 3 and unanswered_high >= 1) or client_escalation:
        health = "Red"
    elif blocked_count == 1 or overdue_count >= 2 or unanswered_high >= 1:
        health = "Amber"
    else:
        health = "Green"

    factors = [
        f"  Blocked tickets: {blocked_count}",
        f"  Overdue tickets: {overdue_count}",
        f"  Unanswered high-importance emails: {unanswered_high}",
        f"  Unassigned high-priority tickets: {unassigned_high}",
        f"  Active client escalation: {client_escalation}",
    ]

    return f"Health: {health}\nFactors:\n" + "\n".join(factors)


# ---------------------------------------------------------------------------
# Agent builder
# ---------------------------------------------------------------------------

def build_agent(data: NormalizedData):
    @tool
    def get_sprint_overview() -> str:
        """Returns current sprint ticket counts, completion rate, and overdue items."""
        return _sprint_overview(data)

    @tool
    def find_blockers() -> str:
        """Identifies all blocking chains and unassigned high-priority tickets."""
        return _find_blockers(data)

    @tool
    def check_unanswered_comms() -> str:
        """Lists all unanswered emails and team messages grouped by urgency."""
        return _unanswered_comms(data)

    @tool
    def assess_project_health() -> str:
        """Produces an overall project health verdict (Green/Amber/Red) with risk factors."""
        return _project_health(data)

    llm = ChatGroq(model=MODEL, temperature=0.2, max_tokens=1500)
    tools = [get_sprint_overview, find_blockers, check_unanswered_comms, assess_project_health]
    return create_react_agent(llm, tools)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def run_analysis(data: NormalizedData) -> dict:
    agent = build_agent(data)
    today = date.today().isoformat()
    prompt = (
        f"Today is {today}. Run a full project analysis. "
        "Call all four tools: assess_project_health, find_blockers, "
        "check_unanswered_comms, get_sprint_overview. "
        "Then return ONLY valid JSON with no markdown:\n"
        + ANALYSIS_SYSTEM_PROMPT
    )
    result = agent.invoke({"messages": [HumanMessage(content=prompt)]})
    text = result["messages"][-1].content.strip()

    # Strip markdown fences if present
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
        text = text.strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Retry with explicit instruction
        result2 = agent.invoke({
            "messages": [
                HumanMessage(content=prompt),
                AIMessage(content=text),
                HumanMessage(content="Return only valid JSON, nothing else."),
            ]
        })
        return json.loads(result2["messages"][-1].content.strip())


def chat(message: str, history: list[dict], data: NormalizedData) -> str:
    agent = build_agent(data)

    msgs: list = [SystemMessage(content=CHAT_SYSTEM_PROMPT)]
    for turn in history[-6:]:
        cls = HumanMessage if turn["role"] == "user" else AIMessage
        msgs.append(cls(content=turn["content"]))
    msgs.append(HumanMessage(content=message))

    result = agent.invoke({"messages": msgs})
    return result["messages"][-1].content
