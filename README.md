# Kairos

AI-powered project manager and scrum master. Feed it your sprint data and it tells you what is on fire and what to do about it.

## What it does

- Analyses Jira tickets, emails, and team messages to assess sprint health
- Surfaces blockers, overdue tickets, and unanswered escalations
- Gives specific, actionable recommendations
- Chat interface to ask questions or draft follow-up emails

## Stack

- Backend: FastAPI + LangChain + Groq (llama-3.3-70b-versatile)
- Frontend: Next.js 15 + Tailwind CSS
- Data: JSON mock files (no database)

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

## Project structure

```
backend/        FastAPI app, LangChain agent, prompts
frontend/       Next.js dashboard with chat interface
mock_data/      Sample tickets, emails, messages, and team roster
```

## API endpoints

```
GET  /api/health    health check
GET  /api/data      returns all mock data
POST /api/analyse   runs full analysis, returns structured JSON
POST /api/chat      conversational interface with project context
```
