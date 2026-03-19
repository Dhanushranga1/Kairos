import json
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "mock_data"


def load_all() -> dict:
    return {
        "tickets": json.loads((DATA_DIR / "tickets.json").read_text()),
        "emails": json.loads((DATA_DIR / "emails.json").read_text()),
        "team_messages": json.loads((DATA_DIR / "team_messages.json").read_text()),
        "team_members": json.loads((DATA_DIR / "team_members.json").read_text()),
    }
