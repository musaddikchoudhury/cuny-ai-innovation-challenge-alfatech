import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_match_ledger():
    profile = {
        "gpa": 3.0,
        "credits": 30,
        "income": 15000,
        "major": "CS",
        "skills": ["python"],
        "citizenship": "us",
        "enrollment": "full-time",
        "borough": "Manhattan",
        "is_first_gen": False,
        "has_dependents": False,
    }

    resp = client.post("/match/ledger", json=profile)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data.get("matches"), list)
