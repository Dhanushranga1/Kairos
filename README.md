# Kairos

AI-powered project manager and scrum master. Feed it your sprint data and it tells you what is on fire and what to do about it.

## What it does

- Runs a LangGraph ReAct agent that calls tools to analyse tickets, emails, and team messages
- Surfaces blockers, overdue items, and unanswered escalations with a health verdict (Green / Amber / Red)
- Gives specific, actionable recommendations and drafts follow-up emails
- Chat interface to ask questions or get drafts on demand

## Stack

- Backend: FastAPI + LangGraph + LangChain + Groq (llama-3.3-70b-versatile)
- Frontend: Next.js 15 + Tailwind CSS
- Data: mock files in Jira Cloud v3 and Microsoft Graph API format (no database)

## Running locally

**Backend**

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
cp .env.example .env   # add your Groq API key
.venv/bin/uvicorn main:app --port 8080
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

## Connecting real APIs

Set these env vars in `.env` and the system switches automatically — no code changes needed.

**Jira Cloud**

```
JIRA_URL=https://your-org.atlassian.net
JIRA_EMAIL=service-account@your-org.com
JIRA_TOKEN=your_api_token
```

**Microsoft 365 (Outlook + Teams)**

```
GRAPH_TENANT_ID=your-azure-tenant-id
GRAPH_CLIENT_ID=your-app-client-id
GRAPH_CLIENT_SECRET=your-app-client-secret
```

Leave these unset to run on mock data.

## Project structure

```
backend/
  main.py          API endpoints
  agent.py         LangGraph ReAct agent and tools
  models.py        Pydantic data models
  sources/         Data source abstraction (mock, Jira, Graph, factory)
frontend/
  app/page.tsx     Dashboard orchestrator
  components/      Header, health card, blockers, chat panel, etc.
mock_data/         Sample data in real Jira v3 and Graph API format
```

## API endpoints

```
GET  /api/health    health check
GET  /api/data      returns normalised project data
POST /api/analyse   runs full agent analysis, returns structured JSON
POST /api/chat      conversational interface with full project context
```
