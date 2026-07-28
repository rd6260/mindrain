# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "dotenv>=0.9.9",
#     "supabase>=2.31.0",
# ]
# ///

import os
from collections import defaultdict
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

supabase = create_client(os.getenv("NEXT_PUBLIC_SUPABASE_URL"), os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY"))


def print_totals(table_name):
    rows = supabase.table(table_name).select("amount, currency").eq("status", "paid").execute().data

    totals = defaultdict(float)
    for row in rows:
        try:
            totals[row["currency"]] += float(row["amount"])
        except (ValueError, TypeError):
            print(f"WARNING: Skipping non-numeric amount '{row['amount']}' (currency: {row['currency']})")

    print(f"\n--- Total Payments Received ({table_name}) ---")
    for currency, total in sorted(totals.items()):
        print(f"{currency} total = {total:,.2f}")


print_totals("payments")
print_totals("payments_2")
