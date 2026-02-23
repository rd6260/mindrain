import os
from dotenv import load_dotenv
from supabase import create_client, Client
import pandas as pd

load_dotenv()

supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
supabase_key = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

if not supabase_url or not supabase_key:
    raise EnvironmentError("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.")

supabase: Client = create_client(supabase_url, supabase_key)


def fetch_registrations():
    # Fetch all registrations
    reg_res = supabase.table("registrations").select("*").execute()
    registrations = reg_res.data

    # Fetch all related data upfront for efficiency
    event_ids = list({r["event_id"] for r in registrations})
    user_ids = list({r["registration_by"] for r in registrations})
    reg_ids = [r["id"] for r in registrations]

    events_map = {}
    if event_ids:
        ev_res = supabase.table("events").select("id, title, code_name").in_("id", event_ids).execute()
        events_map = {e["id"]: e for e in ev_res.data}

    users_map = {}
    if user_ids:
        ui_res = supabase.table("user_info").select("id, name").in_("id", user_ids).execute()
        users_map = {u["id"]: u for u in ui_res.data}

    members_map: dict[str, list] = {}
    if reg_ids:
        mem_res = supabase.table("members").select("*").in_("registration_id", reg_ids).execute()
        for m in mem_res.data:
            members_map.setdefault(m["registration_id"], []).append(m)

    payments_map: dict[str, str] = {}
    if reg_ids:
        pay_res = supabase.table("payments").select("registration_id, status").in_("registration_id", reg_ids).execute()
        for p in pay_res.data:
            # Use the latest/most relevant status; "paid" wins
            rid = p["registration_id"]
            if payments_map.get(rid) != "paid":
                payments_map[rid] = p["status"]

    return registrations, events_map, users_map, members_map, payments_map


def print_registrations():
    registrations, events_map, users_map, members_map, payments_map = fetch_registrations()

    if not registrations:
        print("No registrations found.")
        return

    for i, reg in enumerate(registrations, 1):
        event = events_map.get(reg["event_id"], {})
        registered_by = users_map.get(reg["registration_by"], {})
        members = members_map.get(reg["id"], [])

        # Determine payment status
        pay_status = payments_map.get(reg["id"])
        if pay_status == "paid":
            payment_display = "Paid"
        elif reg.get("paid"):
            payment_display = "Paid"
        else:
            payment_display = "Not Paid"

        # Group label
        group_val = reg.get("group", "")
        group_display = f"{group_val} ({'Monetary Award' if group_val == 'A' else 'No Monetary Award'})" if group_val else "N/A"

        # Category label
        cat_val = reg.get("category", "")
        cat_display = f"{cat_val} ({'1st & 2nd Year' if str(cat_val) == '1' else '3rd–5th Year'})" if cat_val else "N/A"

        # Team type
        team_raw = reg.get("team_type", "")
        team_display = team_raw.capitalize() if team_raw else "N/A"

        print(f"{'='*60}")
        print(f"Registration #{i}  (ID: {reg['id']})")
        print(f"{'='*60}")
        print(f"  Event          : {event.get('title', 'N/A')}")
        print(f"  Team ID        : {reg.get('team_id', 'N/A')}")
        print(f"  Registered By  : {registered_by.get('name', 'N/A')}")
        print(f"  Country        : {reg.get('country', 'N/A')}")
        print(f"  Group          : {group_display}")
        print(f"  Category       : {cat_display}")
        print(f"  Team Type      : {team_display}")
        print(f"  Payment        : {payment_display}")
        print()

        if members:
            print(f"  Members ({len(members)}):")
            for j, m in enumerate(members, 1):
                print(f"    ── Member {j} ──────────────────────────")
                print(f"      Name           : {m.get('name', 'N/A')}")
                print(f"      Email          : {m.get('email', 'N/A')}")
                print(f"      Phone          : {m.get('phone', 'N/A')}")
                print(f"      Institute      : {m.get('institute', 'N/A')}")
                print(f"      Academic Year  : {m.get('academic_year', 'N/A')}")
                print(f"      College ID Card: {m.get('institute_id', 'N/A')}")
        else:
            print("  Members        : None found")

        print()

    print(f"{'='*60}")
    print(f"Total Registrations: {len(registrations)}")


if __name__ == "__main__":
    print_registrations()
