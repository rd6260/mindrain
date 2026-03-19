from supabase import create_client
from dotenv import load_dotenv
import csv
import os

load_dotenv()

supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
supabase_key = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')



supabase = create_client(supabase_url, supabase_key)

users = supabase.auth.admin.list_users()

data = users
print(data)

# with open("users.csv", "w", newline="") as f:
#     writer = csv.writer(f)
#     writer.writerow(["id", "email", "created_at"])
#
#     for u in data:
#         writer.writerow([
#             u.user.id,
#             u.user.email,
#             u.user.created_at
#         ])
