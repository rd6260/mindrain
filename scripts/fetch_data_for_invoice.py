import os
import csv
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
supabase = create_client(os.getenv("NEXT_PUBLIC_SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

# 1. Fetch paid registrations (no user_info join — can't cross auth schema)
print("Fetching registrations...")
regs = (
    supabase
    .from_("registrations")
    .select("""
        id,
        registration_by,
        team_id,
        group,
        category,
        created_at,
        events!registrations_event_id_fkey ( title ),
        payments!payments_registration_id_fkey ( amount, currency, status )
    """)
    .eq("paid", True)
    .execute()
)

if not regs.data:
    print("No paid registrations found.")
    exit()

user_ids = list({r["registration_by"] for r in regs.data})
print(f"Found {len(regs.data)} registrations from {len(user_ids)} users.")

# 2. Fetch emails via admin API (paginated)
print("Fetching emails...")
email_map = {}
page = 1
while True:
    users_response = supabase.auth.admin.list_users(page=page, per_page=1000)
    if not users_response:
        break
    for user in users_response:
        if user.id in user_ids:
            email_map[user.id] = user.email
    if len(users_response) < 1000:
        break
    page += 1

# 3. Fetch user names from user_info directly using user IDs
print("Fetching user names...")
name_map = {}
# Query in chunks of 100 to stay within URL limits
chunk_size = 100
for i in range(0, len(user_ids), chunk_size):
    chunk = user_ids[i:i + chunk_size]
    result = (
        supabase
        .from_("user_info")
        .select("id, name")
        .in_("id", chunk)
        .execute()
    )
    for row in result.data:
        name_map[row["id"]] = row["name"]

# 4. Write CSV
output_file = "data_for_invoice.csv"
IST = timezone(timedelta(hours=5, minutes=30))

with open(output_file, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=[
        "Email", "Name", "Event", "Team ID", "Amount",
        "Group", "Category", "Date of Registration"
    ])
    writer.writeheader()

    for row in regs.data:
        # Payment: prefer captured, fallback to first
        payments = row.get("payments") or []
        captured = next((p for p in payments if p["status"] == "captured"), None)
        if not captured and payments:
            captured = payments[0]

        amount_str = ""
        if captured:
            currency = captured.get("currency", "")
            amount_val = captured.get("amount", "")
            try:
                amount_str = f"{currency} {amount_val}"
            except (ValueError, TypeError):
                amount_str = amount_val

        # Date: UTC → IST, human-friendly
        reg_date = ""
        raw_date = row.get("created_at")
        if raw_date:
            try:
                dt = datetime.fromisoformat(raw_date.replace("Z", "+00:00"))
                reg_date = dt.astimezone(IST).strftime("%-d %b %Y, %I:%M %p IST")
            except Exception:
                reg_date = raw_date

        category_raw = row.get("category", "")

        writer.writerow({
            "Email":                email_map.get(row["registration_by"], ""),
            "Name":                 name_map.get(row["registration_by"], ""),
            "Event":                (row.get("events") or {}).get("title", ""),
            "Team ID":              row.get("team_id", ""),
            "Amount":               amount_str,
            "Group":                row.get("group", ""),
            "Category":             category_raw,
            "Date of Registration": reg_date,
        })

print(f"✓ Exported {len(regs.data)} rows to {output_file}")
