import os
from dotenv import load_dotenv
from supabase import create_client, Client
import pandas as pd

load_dotenv()

pd.set_option("display.max_rows", None)
pd.set_option("display.max_columns", None)
pd.set_option("display.width", None)
pd.set_option("display.max_colwidth", None)




supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
supabase_key = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

supabase: Client = create_client(supabase_url, supabase_key)

registrations_response = supabase.table('registrations').select('*').execute()
users_response = supabase.table('user_info').select('*').execute()
events_response = supabase.table('events').select('*').execute()

registrations_data = registrations_response.data
users_data = users_response.data
events_data = events_response.data

user_data_to_id = {item["id"]: item for item in users_data}
event_data_to_id = {item["id"]: item for item in events_data}

registrations_df = pd.DataFrame(registrations_data)


for critaria, data in registrations_df.groupby(["registration_by", "event_id"]):
    user_id, event_id = critaria
    user_name = user_data_to_id[user_id]["name"]
    event_name = event_data_to_id[event_id]["title"]

    print(
            f"for '{user_name}' in '{event_name}' event "
            )

    print(data)
    print("-"*80)








