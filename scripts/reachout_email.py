import os
import csv
import base64
import requests
from dotenv import load_dotenv

load_dotenv()

POSTMARK_API_KEY = os.getenv("POSTMARK_API_KEY")
TEMPLATE_ID = int(os.getenv("POSTMARK_TEMPLATE_ID"))
CSV_FILE = "/home/senku/Downloads/mindrain/data/test_list.csv"
ZIP_FILE = "/home/senku/Downloads/mindrain/data/The Unreal House Docs.zip"
FROM_EMAIL = "Mind Rain <team@mindrain.org>"
POSTMARK_BATCH_URL = "https://api.postmarkapp.com/email/batchWithTemplates"


def load_zip_attachment(zip_path):
    """Read and base64-encode the zip file."""
    with open(zip_path, "rb") as f:
        encoded = base64.b64encode(f.read()).decode("utf-8")
    filename = os.path.basename(zip_path)
    return {
        "Name": filename,
        "Content": encoded,
        "ContentType": "application/zip"
    }


def load_recipients(csv_path):
    """Parse CSV and return list of recipient dicts."""
    recipients = []
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            email = row.get("Email", "").strip()
            if not email:
                print(f"Skipping row with missing email: {row}")
                continue

            name = row.get("Name", "").strip()
            if not name:
                name = "Sir/Madam"

            recipients.append({
                "name": name,
                "designation": row.get("Designation", "").strip(),
                "institution_name": row.get("Institution", "").strip(),
                "state": row.get("State", "").strip(),
                "email": email,
            })
    return recipients


def build_messages(recipients, attachment):
    """Build the Messages payload for the batch endpoint."""
    messages = []
    for r in recipients:
        messages.append({
            "From": FROM_EMAIL,
            "To": r["email"],
            "TemplateId": TEMPLATE_ID,
            "ReplyTo": "team@mindrain.org",
            "TemplateModel": {
                "name": r["name"],
                "designation": r["designation"],
                "institution_name": r["institution_name"],
                "state": r["state"],
            },
            "Attachments": [attachment]
        })
    return messages


def send_batch(messages):
    """Send all messages via Postmark batch endpoint."""
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
        sent = sum(1 for r in results if r.get("ErrorCode") == 0)
        failed = len(results) - sent
        print(f"Done. Sent: {sent} | Failed: {failed}")
        if failed > 0:
            for r in results:
                if r.get("ErrorCode") != 0:
                    print(f"  Failed → {r.get('To')}: {r.get('Message')}")
    else:
        print(f"Postmark API error {response.status_code}: {response.text}")


def main():
    # Validate env
    if not POSTMARK_API_KEY:
        raise ValueError("POSTMARK_API_KEY is not set in .env")
    if not TEMPLATE_ID:
        raise ValueError("POSTMARK_TEMPLATE_ID is not set in .env")
    if not os.path.exists(CSV_FILE):
        raise FileNotFoundError(f"CSV file not found: {CSV_FILE}")
    if not os.path.exists(ZIP_FILE):
        raise FileNotFoundError(f"ZIP file not found: {ZIP_FILE}")

    attachment = load_zip_attachment(ZIP_FILE)
    recipients = load_recipients(CSV_FILE)

    if not recipients:
        print("No valid recipients found in CSV. Exiting.")
        return

    print(f"Loaded {len(recipients)} recipients from {CSV_FILE}")

    # Postmark batch limit is 500 per request — chunk if needed
    BATCH_SIZE = 500
    for i in range(0, len(recipients), BATCH_SIZE):
        chunk = recipients[i:i + BATCH_SIZE]
        messages = build_messages(chunk, attachment)
        send_batch(messages)


if __name__ == "__main__":
    main()
