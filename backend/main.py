from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from sources.factory import get_source
from agent import run_analysis, chat

app = FastAPI(title="Kairos API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/data")
def get_data():
    source = get_source()
    data = source.get_all()
    return data.model_dump()


@app.post("/api/analyse")
def analyse():
    try:
        data = get_source().get_all()
        result = run_analysis(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat")
def chat_endpoint(req: ChatRequest):
    try:
        data = get_source().get_all()
        reply = chat(req.message, req.history, data)
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
