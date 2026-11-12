# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "dotenv>=0.9.9",
#     "supabase>=2.34.1",
# ]
# ///
"""Export users to CSV: email, name, role, institute, academic year, academic level.

Usage: uv run scripts/export_users_csv.py
Output: exports/users_<timestamp>.csv
"""
import csv
import os
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

# The service role key is required: auth.admin (emails) rejects the anon key with 403,
# and the anon key is also subject to RLS on user_info.
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SERVICE_ROLE_KEY = os.getenv("SUPABASE_SECRET_KEY")
if not SUPABASE_URL or not SERVICE_ROLE_KEY:
    raise SystemExit(
        "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env/.env.\n"
        "Get the service_role key from Supabase Dashboard -> Project Settings -> API Keys."
    )

supabase = create_client(SUPABASE_URL, SERVICE_ROLE_KEY)

EXPORT_DIR = Path(__file__).resolve().parent.parent / "exports"
PAGE_SIZE = 1000


def fetch_email_map() -> dict[str, str]:
    """auth.admin.list_users is paginated, so walk every page."""
    emails: dict[str, str] = {}
    page = 1
    while True:
        users = supabase.auth.admin.list_users(page=page, per_page=PAGE_SIZE)
        if not users:
            break
        emails.update({u.id: u.email for u in users})
        if len(users) < PAGE_SIZE:
            break
        page += 1
    return emails


def fetch_user_info() -> list[dict]:
    """PostgREST caps rows per request, so page through with range()."""
    rows: list[dict] = []
    start = 0
    while True:
        batch = (
            supabase.table("user_info")
            .select("id, name, role, institute, academic_year, academic_level")
            .range(start, start + PAGE_SIZE - 1)
            .execute()
            .data
        )
        rows.extend(batch)
        if len(batch) < PAGE_SIZE:
            break
        start += PAGE_SIZE
    return rows


def main():
    email_map = fetch_email_map()
    rows = fetch_user_info()

    EXPORT_DIR.mkdir(exist_ok=True)
    out_path = EXPORT_DIR / f"users_{datetime.now():%Y%m%d_%H%M%S}.csv"

    with out_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["email", "name", "role", "institute", "academic_year", "academic_level"])
        for row in rows:
            writer.writerow([
                email_map.get(row["id"], ""),
                row.get("name") or "",
                row.get("role") or "",
                row.get("institute") or "",
                row.get("academic_year") or "",
                row.get("academic_level") or "",
            ])

    print(f"Wrote {len(rows)} rows to {out_path}")


if __name__ == "__main__":
    main()
