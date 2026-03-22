from pydantic import BaseModel


class NormalizedTicket(BaseModel):
    id: str
    title: str
    description: str
    status: str  # todo | in_progress | in_review | blocked | done
    priority: str  # high | medium | low
    assignee: str | None
    assignee_email: str | None
    due_date: str  # YYYY-MM-DD
    sprint: str
    story_points: int
    blocked_by: str | None  # ticket key or None
    labels: list[str]


class NormalizedEmail(BaseModel):
    id: str
    subject: str
    sender_name: str
    sender_address: str
    received_at: str  # YYYY-MM-DD
    body: str
    is_read: bool
    has_reply: bool
    importance: str  # high | normal | low


class NormalizedMessage(BaseModel):
    id: str
    author: str
    channel: str
    body: str
    created_at: str  # ISO datetime
    mentions: list[str]
    has_response: bool


class NormalizedMember(BaseModel):
    name: str
    email: str
    role: str
    current_tasks: list[str]


class NormalizedData(BaseModel):
    tickets: list[NormalizedTicket]
    emails: list[NormalizedEmail]
    messages: list[NormalizedMessage]
    members: list[NormalizedMember]
