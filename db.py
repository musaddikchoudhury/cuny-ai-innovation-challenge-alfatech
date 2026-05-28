import json
import sqlite3
from pathlib import Path
from typing import Any, Dict

DB_PATH = Path(__file__).resolve().parent / "data" / "app.sqlite3"
DB_PATH.parent.mkdir(parents=True, exist_ok=True)


def _get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    conn = _get_conn()
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            profile_json TEXT NOT NULL,
            matches_json TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    conn.commit()
    conn.close()


def save_profile(profile: Dict[str, Any], matches: Dict[str, Any]) -> int:
    conn = _get_conn()
    cur = conn.cursor()
    cur.execute("INSERT INTO profiles (profile_json, matches_json) VALUES (?, ?)", (json.dumps(profile), json.dumps(matches)))
    conn.commit()
    rowid = cur.lastrowid
    conn.close()
    return rowid


def get_profile(profile_id: int) -> Dict[str, Any]:
    conn = _get_conn()
    cur = conn.cursor()
    cur.execute("SELECT profile_json, matches_json, created_at FROM profiles WHERE id = ?", (profile_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        raise KeyError("not found")
    return {"profile": json.loads(row["profile_json"]), "matches": json.loads(row["matches_json"]), "created_at": row["created_at"]}
