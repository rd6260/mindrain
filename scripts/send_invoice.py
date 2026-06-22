import os
import csv
import requests
from dotenv import load_dotenv

load_dotenv()

POSTMARK_API_KEY = os.getenv("POSTMARK_API_KEY")
TEMPLATE_ID = 45364057
CSV_FILE = "data_for_invoice.csv"
FROM_EMAIL = "Mind Rain <team@mindrain.org>"
REPLY_TO = "support@mindrain.org"
POSTMARK_BATCH_URL = "https://api.postmarkapp.com/email/batchWithTemplates"

# Number of emails to send per run (set low to test safely)
EMAILS_PER_RUN = 50
BATCH_SIZE = 500  # Postmark hard limit per API request

GROUP_LABELS = {
    "A": "A (Monetary Award)",
    "B": "B (No Monetary Award)",
}


def load_recipients(csv_path):
    recipients = []
    with open(csv_path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            email = row.get("Email", "").strip()
            if not email:
                print(f"  Skipping row with missing email: {row}")
                continue

            group_raw = row.get("Group", "").strip()
            amount_raw = row.get("Amount", "").strip()
            # Strip currency prefix — "INR 549" → "549"
            amount = amount_raw.split()[-1] if amount_raw else ""

            recipients.append({
                "email": email,
                "NAME": row.get("Name", "").strip() or "Participant",
                "EVENT_NAME": row.get("Event", "").strip(),
                "TEAM_ID": row.get("Team ID", "").strip(),
                "GROUP": GROUP_LABELS.get(group_raw, group_raw),
                "CATEGORY": row.get("Category", "").strip(),
                "PAID_AMOUNT": amount,
                "DATE_OF_REGISTRATION": row.get("Date of Registration", "").strip(),
            })
    return recipients


def build_messages(recipients):
    messages = []
    for r in recipients:
        messages.append({
            "From": FROM_EMAIL,
            "To": r["email"],
            "ReplyTo": REPLY_TO,
            "TemplateId": TEMPLATE_ID,
            "TemplateModel": {
                "NAME": r["NAME"],
                "EVENT_NAME": r["EVENT_NAME"],
                "TEAM_ID": r["TEAM_ID"],
                "GROUP": r["GROUP"],
                "CATEGORY": r["CATEGORY"],
                "PAID_AMOUNT": r["PAID_AMOUNT"],
                "DATE_OF_REGISTRATION": r["DATE_OF_REGISTRATION"],
            },
        })
    return messages


def send_batch(messages):
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": POSTMARK_API_KEY,
    }
    response = requests.post(
        POSTMARK_BATCH_URL,
        json={"Messages": messages},
        headers=headers,
    )

    if response.status_code == 200:
        results = response.json()
        sent = sum(1 for r in results if r.get("ErrorCode") == 0)
        failed = len(results) - sent
        print(f"  Result → Sent: {sent} | Failed: {failed}")
        for r in results:
            if r.get("ErrorCode") != 0:
                print(f"    ✗ {r.get('To')}: {r.get('Message')}")
    else:
        print(f"  Postmark API error {response.status_code}: {response.text}")


def main():
    if not POSTMARK_API_KEY:
        raise ValueError("POSTMARK_API_KEY is not set in .env")
    if not os.path.exists(CSV_FILE):
        raise FileNotFoundError(f"CSV not found: {CSV_FILE}")

    recipients = load_recipients(CSV_FILE)
    if not recipients:
        print("No valid recipients found. Exiting.")
        return

    print(f"Loaded {len(recipients)} recipients from {CSV_FILE}")
    print(f"Sending in runs of {EMAILS_PER_RUN}\n")

    for i in range(0, len(recipients), EMAILS_PER_RUN):
        chunk = recipients[i:i + EMAILS_PER_RUN]
        batch_num = i // EMAILS_PER_RUN + 1

        print(f"{'='*60}")
        print(f"  BATCH {batch_num} — {len(chunk)} email(s)")
        print(f"{'='*60}")
        for idx, r in enumerate(chunk, start=1):
            print(f"  {idx}. {r['NAME']}")
            print(f"     Email    : {r['email']}")
            print(f"     Team ID  : {r['TEAM_ID']}")
            print(f"     Event    : {r['EVENT_NAME']}")
            print(f"     Group    : {r['GROUP']}")
            print(f"     Category : {r['CATEGORY']}")
            print(f"     Amount   : {r['PAID_AMOUNT']}")
        print(f"{'-'*60}")

        # Chunk further if somehow exceeds Postmark's per-request limit
        for j in range(0, len(chunk), BATCH_SIZE):
            api_chunk = chunk[j:j + BATCH_SIZE]
            messages = build_messages(api_chunk)
            send_batch(messages)

        print()


if __name__ == "__main__":
    main()
