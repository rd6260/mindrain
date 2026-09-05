# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "dotenv>=0.9.9",
#     "supabase>=2.31.0",
# ]
# ///
import os
from dotenv import load_dotenv
from supabase import create_client, Client
from collections import defaultdict

load_dotenv()

supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
supabase_key = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

if not supabase_url or not supabase_key:
    raise EnvironmentError("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.")

supabase: Client = create_client(supabase_url, supabase_key)


def fetch_brief_emails() -> list[dict]:
    """Fetch all rows from brief_emails, paginated."""
    all_rows = []
    page_size = 1000
    offset = 0

    while True:
        response = (
            supabase.table("brief_emails")
            .select("id, email, event_id, created_at")
            .range(offset, offset + page_size - 1)
            .execute()
        )

        rows = response.data or []
        all_rows.extend(rows)

        if len(rows) < page_size:
            break

        offset += page_size

    return all_rows


def fetch_events(event_ids: list[str]) -> dict[str, dict]:
    """Fetch event details for the given IDs and return a map of id -> event."""
    if not event_ids:
        return {}

    events_map = {}
    # Supabase `in_` has a practical limit, batch if needed
    batch_size = 100
    for i in range(0, len(event_ids), batch_size):
        batch = event_ids[i:i + batch_size]
        ev_res = supabase.table("events").select("id, title, code_name").in_("id", batch).execute()
        for e in ev_res.data:
            events_map[e["id"]] = e

    return events_map


def print_event_wise_emails():
    """Print emails grouped by event."""
    brief_emails = fetch_brief_emails()

    if not brief_emails:
        print("No brief emails found.")
        return

    # Collect unique event IDs (excluding None)
    event_ids = list({row["event_id"] for row in brief_emails if row.get("event_id")})
    events_map = fetch_events(event_ids)

    # Group emails by event_id
    grouped: dict[str | None, list[dict]] = defaultdict(list)
    for row in brief_emails:
        grouped[row.get("event_id")].append(row)

    # Print each event group
    total = 0
    for event_id, rows in sorted(grouped.items(), key=lambda x: (x[0] is None, x[0] or "")):
        event = events_map.get(event_id, {}) if event_id else {}
        event_title = event.get("title", "Unknown Event")
        event_code = event.get("code_name", "")
        header = f"{event_title} ({event_code})" if event_code else event_title

        if event_id is None:
            header = "No Event Assigned"

        print(f"{'=' * 60}")
        print(f"  {header}")
        print(f"  Emails: {len(rows)}")
        print(f"{'=' * 60}")

        for i, row in enumerate(rows, 1):
            print(f"  {i:03}. {row['email']}")

        print()
        total += len(rows)

    print(f"{'=' * 60}")
    print(f"  Total Emails: {total}")
    print(f"  Total Events: {len(grouped)}")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    print_event_wise_emails()
