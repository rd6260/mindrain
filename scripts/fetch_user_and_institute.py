import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

supabase = create_client(os.getenv("NEXT_PUBLIC_SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

users = supabase.auth.admin.list_users()
user_map = {u.id: u.email for u in users}

rows = supabase.table("user_info").select("id, institute").execute().data

for row in rows:
    print(f"{user_map.get(row['id'], 'N/A')} | {row['institute']}")
