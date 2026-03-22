import json
from pathlib import Path

from sources.base import DataSource
from models import NormalizedTicket, NormalizedEmail, NormalizedMessage, NormalizedMember

DATA_DIR = Path(__file__).parent.parent.parent / "mock_data"

# Status name mapping from Jira canonical -> internal
_STATUS_MAP = {
    "in progress": "in_progress",
    "to do": "todo",
    "in review": "in_review",
    "done": "done",
    "blocked": "blocked",
}


def _parse_adf_text(doc: dict | None) -> str:
    """Extract plain text from Atlassian Document Format."""
    if not doc or not isinstance(doc, dict):
        return ""
    parts = []
    for node in doc.get("content", []):
        for inline in node.get("content", []):
            if inline.get("type") == "text":
                parts.append(inline.get("text", ""))
    return " ".join(parts).strip()


def _get_ext_prop(props: list, name: str) -> str | None:
    """Read a singleValueExtendedProperty by partial name match."""
    for p in props or []:
        if name in p.get("id", ""):
            return p.get("value")
    return None


class MockSource(DataSource):
    def get_tickets(self) -> list[NormalizedTicket]:
        raw = json.loads((DATA_DIR / "jira_issues.json").read_text())
        tickets = []
        for issue in raw["issues"]:
            f = issue["fields"]
            status_raw = f["status"]["name"].lower()
            status = _STATUS_MAP.get(status_raw, status_raw.replace(" ", "_"))

            # Resolve blocked_by from issuelinks
            blocked_by = None
            for link in f.get("issuelinks", []):
                if "inwardIssue" in link and "blocked" in link["type"].get("inward", "").lower():
                    blocked_by = link["inwardIssue"]["key"]
                    break

            assignee = f.get("assignee")
            tickets.append(NormalizedTicket(
                id=issue["key"],
                title=f["summary"],
                description=_parse_adf_text(f.get("description")),
                status=status,
                priority=f["priority"]["name"].lower(),
                assignee=assignee["displayName"] if assignee else None,
                assignee_email=assignee["emailAddress"] if assignee else None,
                due_date=f.get("duedate", ""),
                sprint=f.get("customfield_10020", {}).get("name", "Unknown Sprint"),
                story_points=int(f.get("customfield_10016") or 0),
                blocked_by=blocked_by,
                labels=f.get("labels", []),
            ))
        return tickets

    def get_emails(self) -> list[NormalizedEmail]:
        raw = json.loads((DATA_DIR / "outlook_messages.json").read_text())
        emails = []
        for msg in raw["value"]:
            has_reply_str = _get_ext_prop(msg.get("singleValueExtendedProperties"), "hasReply")
            has_reply = has_reply_str.lower() == "true" if has_reply_str else False

            # Normalize received date to YYYY-MM-DD
            received = msg["receivedDateTime"][:10]

            emails.append(NormalizedEmail(
                id=msg["id"],
                subject=msg["subject"],
                sender_name=msg["from"]["emailAddress"]["name"],
                sender_address=msg["from"]["emailAddress"]["address"],
                received_at=received,
                body=msg["body"]["content"],
                is_read=msg.get("isRead", False),
                has_reply=has_reply,
                importance=msg.get("importance", "normal"),
            ))
        return emails

    def get_messages(self) -> list[NormalizedMessage]:
        raw = json.loads((DATA_DIR / "teams_messages.json").read_text())
        messages = []
        for msg in raw["value"]:
            has_response_str = _get_ext_prop(msg.get("singleValueExtendedProperties"), "hasResponse")
            has_response = has_response_str.lower() == "true" if has_response_str else False

            mentions = [
                m["mentioned"]["user"]["displayName"]
                for m in msg.get("mentions", [])
                if "user" in m.get("mentioned", {})
            ]

            messages.append(NormalizedMessage(
                id=msg["id"],
                author=msg["from"]["user"]["displayName"],
                channel=msg.get("channelDisplayName", ""),
                body=msg["body"]["content"],
                created_at=msg["createdDateTime"],
                mentions=mentions,
                has_response=has_response,
            ))
        return messages

    def get_members(self) -> list[NormalizedMember]:
        raw = json.loads((DATA_DIR / "team_members.json").read_text())
        return [NormalizedMember(**m) for m in raw]
