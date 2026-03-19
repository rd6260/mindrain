import os
import csv
import base64
import requests
from dotenv import load_dotenv

load_dotenv()

POSTMARK_API_KEY = os.getenv("POSTMARK_API_KEY")
TEMPLATE_ID = 44004779
# CSV_FILE = "/home/senku/Downloads/mindrain/data/test_list.csv"
CSV_FILE = "/home/senku/Downloads/mindrain/data/batch-1-2.csv"
ZIP_FILE = "/home/senku/Downloads/mindrain/data/The-Unreal-House-Docs.zip"
POSTER_FILE = "/home/senku/Downloads/mindrain/data/campain-poster-extended-dates.jpg"
FROM_EMAIL = "Mind Rain <team@mindrain.org>"
POSTMARK_BATCH_URL = "https://api.postmarkapp.com/email/batchWithTemplates"
REPLY_TO = "team@mindrain.org"
EMAILS_PER_RUN = 5


def load_zip_attachment(zip_path):
    with open(zip_path, "rb") as f:
        encoded = base64.b64encode(f.read()).decode("utf-8")
    return {
        "Name": os.path.basename(zip_path),
        "Content": encoded,
        "ContentType": "application/zip"
    }


def load_poster_attachment(poster_path):
    with open(poster_path, "rb") as f:
        encoded = base64.b64encode(f.read()).decode("utf-8")
    return {
        "Name": os.path.basename(poster_path),
        "Content": encoded,
        "ContentType": "image/jpeg"
    }


def load_recipients(csv_path):
    recipients = []
    with open(csv_path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            email = row.get("Email", "").strip()
            if not email:
                print(f"Skipping row with missing email: {row}")
                continue

            college    = row.get("College", "").strip()
            university = row.get("University", "").strip()
            state      = row.get("State", "").strip()
            country    = row.get("Country", "").strip()

            # Build "institution_name" from all non-empty parts
            institution_parts = [p for p in [college, university, state, country] if p]
            institution_name = ", ".join(institution_parts)

            recipients.append({
                "email": email,
                "college_name": college,
                "institution_name": institution_name,
            })
    return recipients


def build_messages(recipients, attachments):
    messages = []
    for r in recipients:
        messages.append({
            "From": FROM_EMAIL,
            "To": r["email"],
            "TemplateId": TEMPLATE_ID,
            "ReplyTo": REPLY_TO,
            "TemplateModel": {
                "college_name": r["college_name"],
                "institution_name": r["institution_name"],
            },
            "Attachments": attachments
        })
    return messages


def send_batch(messages):
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": POSTMARK_API_KEY,
    }
    payload = {"Messages": messages}

    print(f"Sending {len(messages)} emails via Postmark...")
    response = requests.post(POSTMARK_BATCH_URL, json=payload, headers=headers)

    if response.status_code == 200:
        results = response.json()
        sent   = sum(1 for r in results if r.get("ErrorCode") == 0)
        failed = len(results) - sent
        print(f"Done. Sent: {sent} | Failed: {failed}")
        if failed > 0:
            for r in results:
                if r.get("ErrorCode") != 0:
                    print(f"  Failed → {r.get('To')}: {r.get('Message')}")
    else:
        print(f"Postmark API error {response.status_code}: {response.text}")


def main():
    if not POSTMARK_API_KEY:
        raise ValueError("POSTMARK_API_KEY is not set in .env")
    if not os.path.exists(CSV_FILE):
        raise FileNotFoundError(f"CSV file not found: {CSV_FILE}")
    if not os.path.exists(ZIP_FILE):
        raise FileNotFoundError(f"ZIP file not found: {ZIP_FILE}")
    if not os.path.exists(POSTER_FILE):
        raise FileNotFoundError(f"POSTER file not found: {POSTER_FILE}")

    zip_attachment    = load_zip_attachment(ZIP_FILE)
    poster_attachment = load_poster_attachment(POSTER_FILE)
    attachments       = [poster_attachment, zip_attachment]

    recipients = load_recipients(CSV_FILE)
    if not recipients:
        print("No valid recipients found in CSV. Exiting.")
        return

    print(f"Loaded {len(recipients)} recipients from {CSV_FILE}")

    BATCH_SIZE = 500
    for i in range(0, len(recipients), EMAILS_PER_RUN):
        run_chunk = recipients[i:i + EMAILS_PER_RUN]
        batch_num = i // EMAILS_PER_RUN + 1
        print(f"\n{'='*60}")
        print(f"  BATCH {batch_num} — {len(run_chunk)} email(s)")
        print(f"{'='*60}")
        for idx, r in enumerate(run_chunk, start=1):
            print(f"  {idx}. {r['college_name']}")
            print(f"     Email        : {r['email']}")
            print(f"     Institution  : {r['institution_name']}")
        print(f"{'-'*60}")

        for j in range(0, len(run_chunk), BATCH_SIZE):
            api_chunk = run_chunk[j:j + BATCH_SIZE]
            messages  = build_messages(api_chunk, attachments)
            send_batch(messages)


if __name__ == "__main__":
    main()
