# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "dotenv>=0.9.9",
#     "supabase>=2.31.0",
# ]
# ///

import os
import json
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

supabase = create_client(os.getenv("NEXT_PUBLIC_SUPABASE_URL"), os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY"))

# Fetch all registrations
registrations = supabase.table("registrations").select("*").execute().data

# Fetch all payments
payments = supabase.table("payments").select("*").execute().data

# Build a map: registration_id -> list of payments
payments_by_reg = {}
for p in payments:
    rid = p["registration_id"]
    payments_by_reg.setdefault(rid, []).append(p)

# Find inconsistencies
inconsistencies = []

for reg in registrations:
    rid = reg["id"]
    reg_paid = reg["paid"]  # boolean

    reg_payments = payments_by_reg.get(rid, [])
    has_paid_payment = any(p["status"] == "paid" for p in reg_payments)

    # Case 1: registration marked paid but no payment with status='paid'
    if reg_paid and not has_paid_payment:
        inconsistencies.append({
            "type": "registration is paid=true but no payment with status='paid'",
            "registration": reg,
            "payments": reg_payments,
        })

    # Case 2: registration marked unpaid but has a payment with status='paid'
    elif not reg_paid and has_paid_payment:
        inconsistencies.append({
            "type": "registration is paid=false but has a payment with status='paid'",
            "registration": reg,
            "payments": reg_payments,
        })

# Report
if not inconsistencies:
    print("✅ No inconsistencies found between registrations and payments.")
else:
    print(f"⚠️  Found {len(inconsistencies)} inconsistency(ies):\n")
    for i, entry in enumerate(inconsistencies, 1):
        print(f"{'=' * 60}")
        print(f"[{i}] {entry['type']}")
        print(f"\n  Registration:")
        for k, v in entry["registration"].items():
            print(f"    {k}: {v}")
        print(f"\n  Payments ({len(entry['payments'])} record(s)):")
        if entry["payments"]:
            for p in entry["payments"]:
                print()
                for k, v in p.items():
                    print(f"    {k}: {v}")
        else:
            print("    (none)")
        print()











# ⚠️  Found 3 inconsistency(ies):
#
# ============================================================
# [1] registration is paid=true but no payment with status='paid'
#
#   Registration:
#     id: 1b561bf8-e21a-4775-9726-27ebd1c67609
#     registration_by: 8e447ddc-b6f5-40d8-a943-55f04a70281a
#     event_id: 3f123e78-60d6-494d-b307-18c5b4c8ab7f
#     group: A
#     category: 2
#     team_type: group
#     created_at: 2026-03-22T18:03:04.793226+00:00
#     country: India
#     paid: True
#     team_id: TUH-A-II-GRP-0082
#     referral_used: None
#
#   Payments (2 record(s)):
#
#     payment_id: 7ada6d6a-e030-44c8-a481-e312ed46d3b8
#     registration_id: 1b561bf8-e21a-4775-9726-27ebd1c67609
#     razorpay_order_id: order_SUMb1LS8QOzuwI
#     razorpay_payment_id: None
#     razorpay_signature: None
#     method: None
#     amount: 999
#     currency: INR
#     mindrain_fee: 999
#     razorpay_fee: None
#     tax: 0
#     status: created
#     created_at: 2026-03-22T18:03:25.589322+00:00
#     updated_at: 2026-03-22T18:03:25.589322+00:00
#
#     payment_id: 755a7460-9e46-4de1-ac3e-6086cfc89bab
#     registration_id: 1b561bf8-e21a-4775-9726-27ebd1c67609
#     razorpay_order_id: order_SUMcZMJa0e12UZ
#     razorpay_payment_id: None
#     razorpay_signature: None
#     method: None
#     amount: 999
#     currency: INR
#     mindrain_fee: 999
#     razorpay_fee: None
#     tax: 0
#     status: created
#     created_at: 2026-03-22T18:04:53.700744+00:00
#     updated_at: 2026-03-22T18:04:53.700744+00:00
#
# ============================================================
# [2] registration is paid=false but has a payment with status='paid'
#
#   Registration:
#     id: 4c1410b6-4a2a-4ad7-9f91-18df8f91cf0e
#     registration_by: 3c543051-b80b-48b9-9ef9-82781498d899
#     event_id: 3f123e78-60d6-494d-b307-18c5b4c8ab7f
#     group: A
#     category: 1
#     team_type: group
#     created_at: 2026-03-29T07:49:13.838339+00:00
#     country: India
#     paid: False
#     team_id: TUH-A-I-GRP-0092
#     referral_used: None
#
#   Payments (1 record(s)):
#
#     payment_id: ddf99c1e-731f-4fb7-8990-9c9200507dc2
#     registration_id: 4c1410b6-4a2a-4ad7-9f91-18df8f91cf0e
#     razorpay_order_id: order_SX40488ypkjeut
#     razorpay_payment_id: pay_SX40Z8Rs9En0Au
#     razorpay_signature: 52b3cdecee08c8c7ad29fb189357249d311ef46ca73da87f97a6f6d75d604a01
#     method: None
#     amount: 1499
#     currency: INR
#     mindrain_fee: 1499
#     razorpay_fee: None
#     tax: 0
#     status: paid
#     created_at: 2026-03-29T13:48:57.800541+00:00
#     updated_at: 2026-03-29T14:08:20.83704+00:00
#
# ============================================================
# [3] registration is paid=true but no payment with status='paid'
#
#   Registration:
#     id: b9f91ec8-138a-4925-824b-b148b2dcff49
#     registration_by: 4f8b2984-9191-4397-95ee-ed0ef1364145
#     event_id: 3f123e78-60d6-494d-b307-18c5b4c8ab7f
#     group: A
#     category: 1
#     team_type: group
#     created_at: 2026-03-25T13:14:19.987744+00:00
#     country: India
#     paid: True
#     team_id: TUH-A-I-GRP-0088
#     referral_used: None
#
#   Payments (3 record(s)):
#
#     payment_id: affb9ea7-c154-47ef-839a-d19c5a631cdc
#     registration_id: b9f91ec8-138a-4925-824b-b148b2dcff49
#     razorpay_order_id: order_SWuhPabJMakyRg
#     razorpay_payment_id: None
#     razorpay_signature: None
#     method: None
#     amount: 1499
#     currency: INR
#     mindrain_fee: 1499
#     razorpay_fee: None
#     tax: 0
#     status: created
#     created_at: 2026-03-29T04:43:03.764641+00:00
#     updated_at: 2026-03-29T04:43:03.764641+00:00
#
#     payment_id: 31a459ba-8171-4140-ad85-044a2cac8df8
#     registration_id: b9f91ec8-138a-4925-824b-b148b2dcff49
#     razorpay_order_id: order_SWuhuGnA4L2361
#     razorpay_payment_id: None
#     razorpay_signature: None
#     method: None
#     amount: 1499
#     currency: INR
#     mindrain_fee: 1499
#     razorpay_fee: None
#     tax: 0
#     status: created
#     created_at: 2026-03-29T04:43:31.742701+00:00
#     updated_at: 2026-03-29T04:43:31.742701+00:00
#
#     payment_id: 01720e18-0613-4c75-a2de-75139a84a15e
#     registration_id: b9f91ec8-138a-4925-824b-b148b2dcff49
#     razorpay_order_id: order_SWwd0uBwmGSluj
#     razorpay_payment_id: None
#     razorpay_signature: None
#     method: None
#     amount: 1499
#     currency: INR
#     mindrain_fee: 1499
#     razorpay_fee: None
#     tax: 0
#     status: created
#     created_at: 2026-03-29T06:36:17.118985+00:00
#     updated_at: 2026-03-29T06:36:17.118985+00:00
#
#
# mindrain on  main [?] via  v26.5.0 took 4s 
# ❯ 

