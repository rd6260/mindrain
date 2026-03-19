import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
supabase_key = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

if not supabase_url or not supabase_key:
    raise EnvironmentError("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.")

supabase: Client = create_client(supabase_url, supabase_key)

def fetch_data():
    # Fetch all registrations
    reg_res = supabase.table("registrations").select("*").execute()
    registrations = reg_res.data

    # Fetch all related data upfront for efficiency
    event_ids = list({r["event_id"] for r in registrations})
    user_ids = list({r["registration_by"] for r in registrations})
    reg_ids = [r["id"] for r in registrations]

    events_map = {}
    if event_ids:
        ev_res = supabase.table("events").select("id, title").in_("id", event_ids).execute()
        events_map = {e["id"]: e for e in ev_res.data}

    users_map = {}
    if user_ids:
        ui_res = supabase.table("user_info").select("id, name").in_("id", user_ids).execute()
        users_map = {u["id"]: u for u in ui_res.data}

    members_map = {}
    if reg_ids:
        mem_res = supabase.table("members").select("registration_id, email, name").in_("registration_id", reg_ids).execute()
        for m in mem_res.data:
            members_map.setdefault(m["registration_id"], []).append(m)

    payments_map = {}
    if reg_ids:
        pay_res = supabase.table("payments").select("registration_id, status").in_("registration_id", reg_ids).execute()
        for p in pay_res.data:
            rid = p["registration_id"]
            if payments_map.get(rid) != "paid":
                payments_map[rid] = p["status"]

    return registrations, events_map, users_map, members_map, payments_map

def list_unpaid_profiles():
    registrations, events_map, users_map, members_map, payments_map = fetch_data()

    if not registrations:
        print("No registrations found.")
        return

    unpaid_count = 0
    print(f"{'='*80}")
    print(f"{'Unpaid Registrations':^80}")
    print(f"{'='*80}\n")

    for reg in registrations:
        pay_status = payments_map.get(reg["id"])
        
        # Check if unpaid
        if pay_status != "paid" and not reg.get("paid"):
            unpaid_count += 1
            
            event = events_map.get(reg["event_id"], {})
            registered_by = users_map.get(reg["registration_by"], {})
            members = members_map.get(reg["id"], [])
            
            profile_name = registered_by.get("name", "Unknown Profile")
            event_title = event.get("title", "Unknown Event")
            
            print(f"Profile Name : {profile_name}")
            print(f"Event        : {event_title}")
            print(f"Reg ID       : {reg['id']}")
            
            emails = []
            for m in members:
                email = m.get("email")
                name = m.get("name")
                if email:
                    emails.append(f"{name} <{email}>" if name else email)
            
            if emails:
                print("Emails       :")
                for e in emails:
                    print(f"  - {e}")
            else:
                print("Emails       : None found in members")
            
            print("-" * 80)

    print(f"\nTotal Unpaid Registrations: {unpaid_count}")

if __name__ == "__main__":
    list_unpaid_profiles()
