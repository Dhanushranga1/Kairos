# Kairos — AI Project Manager Agent
### Build Spec for Code Agent

---

## What Is This

Kairos is a simple AI-powered project manager / scrum master agent.
It ingests mock project data (Jira tickets, Outlook emails, Teams messages) and uses Groq to reason over it — surfacing blockers, risks, and recommended actions through a clean dashboard with a chat interface.

**One sentence:** Feed it your project data, it tells you what's on fire and what to do about it.

---

## Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Backend | FastAPI (Python) | Simple, fast, minimal boilerplate |
| Frontend | Single `index.html` — vanilla JS | No build step, no React overhead |
| AI | Groq API — `llama-3.3-70b-versatile` | Free, fast, already have key |
| Data | JSON files in `/mock_data/` | No database needed for POC |
| Styling | Tailwind CSS via CDN | No setup, looks good fast |

---

## Project Structure

```
kairos/
  backend/
    main.py              ← FastAPI app
    agent.py             ← Groq calls + prompt logic
    data_loader.py       ← loads mock JSON files
    prompts.py           ← all system prompts (see PROMPTS.md)
    requirements.txt
    .env.example
  frontend/
    index.html           ← entire frontend, single file
  mock_data/
    tickets.json         ← Jira-style tickets
    emails.json          ← Outlook-style emails
    team_messages.json   ← Teams-style messages
    team_members.json    ← team roster with roles
  README.md
```

---

## Mock Data

### `/mock_data/tickets.json`
Array of 8–10 tickets. Must include:
- Mix of statuses: `todo`, `in_progress`, `blocked`, `done`, `in_review`
- At least 2 overdue tickets (due_date in the past)
- At least 2 blocked tickets with `blocked_by` referencing another ticket ID
- At least 1 high priority ticket with no assignee
- Fields: `id`, `title`, `description`, `assignee`, `status`, `priority`, `due_date`, `sprint`, `story_points`, `blocked_by`, `labels`

### `/mock_data/emails.json`
Array of 6–8 emails. Must include:
- At least 2 unanswered (no reply, received 3+ days ago)
- 1 email from a client flagging a concern
- 1 escalation from a stakeholder
- Fields: `id`, `subject`, `from`, `to`, `received_date`, `body`, `is_read`, `has_reply`, `priority`

### `/mock_data/team_messages.json`
Array of 10–12 Teams/Slack messages. Must include:
- At least 2 unanswered questions (ends with `?`, no response)
- 1 message flagging a blocker
- 1 message about a delay
- Fields: `id`, `author`, `channel`, `message`, `timestamp`, `mentions`, `has_response`

### `/mock_data/team_members.json`
Array of 5–6 people:
- Fields: `name`, `email`, `role`, `current_tasks` (array of ticket IDs)

---

## Backend

### `main.py` — FastAPI endpoints

```
GET  /api/health          → { status: "ok" }
GET  /api/data            → returns all mock data merged
POST /api/analyse         → runs full PM analysis, returns structured JSON
POST /api/chat            → takes { message, history[] }, returns agent reply
```

CORS enabled for `localhost:*` so frontend can call it freely.

### `data_loader.py`
- One function: `load_all()` — reads all 4 JSON files, returns a single dict
- No transformation, just loads and returns

### `agent.py`
Two functions only:

**`run_analysis(data)`**
- Builds context string from all mock data
- Calls Groq with the ANALYSIS system prompt (see PROMPTS.md)
- Asks Groq to respond in **strict JSON** (no markdown, no preamble)
- Returns parsed JSON with this shape:
```json
{
  "health": "Amber",
  "health_reason": "2 blocked tickets and 1 unanswered client email",
  "summary": "Sprint is at risk...",
  "key_issues": ["Issue 1", "Issue 2", "Issue 3"],
  "blockers": [
    { "person": "name", "task": "ticket title", "reason": "why blocked" }
  ],
  "recommendations": ["Action 1", "Action 2", "Action 3"],
  "follow_ups": [
    { "to": "email", "subject": "subject", "message": "body" }
  ],
  "sprint_health": {
    "total_tickets": 10,
    "done": 3,
    "in_progress": 4,
    "blocked": 2,
    "todo": 1
  }
}
```

**`chat(message, history, data)`**
- Builds context string (same as above, shorter version)
- Includes conversation history in messages array
- Calls Groq with the CHAT system prompt (see PROMPTS.md)
- Returns plain text response string

Temperature for analysis: `0.2` (consistent, factual)
Temperature for chat: `0.5` (slightly more conversational)

### `requirements.txt`
```
fastapi
uvicorn
groq
python-dotenv
```

### `.env.example`
```
GROQ_API_KEY=your_key_here
```

---

## Frontend — `index.html`

Single file. No build step. Tailwind CSS from CDN.

### Layout
```
┌─────────────────────────────────────────┐
│  HELM  [project name]    [Run Analysis] │  ← header
├──────────────┬──────────────────────────┤
│              │                          │
│  Health card │   Key Issues (3 items)   │
│  Sprint bar  │   Blockers list          │
│  Stats grid  │   Recommendations        │
│              │                          │
├──────────────┴──────────────────────────┤
│  Chat with Kairos                         │
│  [message input]          [Send]        │
│  [conversation history]                 │
└─────────────────────────────────────────┘
```

### Behaviour
1. On page load → call `GET /api/data` to populate the raw data counts in the stats grid
2. Auto-trigger `POST /api/analyse` on load — show a loading spinner while waiting
3. Render analysis results into the cards
4. Chat input sends `POST /api/chat` with message + last 6 messages of history
5. Chat responses stream into the conversation (or just append on complete — streaming not required)

### Health badge colours
- `Green` → green background
- `Amber` → amber/yellow background
- `Red` → red background

### Sprint progress bar
Visual bar showing done / in_progress / blocked / todo as coloured segments. Calculate from `sprint_health` in analysis response.

### No frameworks. No imports beyond:
- Tailwind CSS CDN
- No React, no Vue, no Alpine

---

## Running It

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env  # add Groq key
uvicorn main:app --reload --port 8000
```

Open `frontend/index.html` directly in browser (or serve with `python -m http.server 3000` from frontend/).

---

## What NOT to Build

- No auth
- No database
- No user accounts
- No file upload UI
- No deployment config
- No tests
- No WebSockets (polling or on-demand is fine)
- Do not use LangChain, LangGraph, or any agent framework — raw Groq SDK only

---

## Definition of Done

The demo works when:
1. Opening `index.html` shows a dashboard that auto-populates with analysis
2. Health badge shows Amber or Red (mock data should trigger this)
3. Blockers, issues, and recommendations are visible
4. User can type "who is blocked?" in the chat and get a sensible response
5. User can type "draft a follow-up email to the client" and get a draft

That's it. Ship that.
