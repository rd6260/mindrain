import os
import requests
from dotenv import load_dotenv

load_dotenv()

POSTMARK_API_KEY = os.getenv("POSTMARK_API_KEY")
TEMPLATE_ID = 45184792
FROM_EMAIL = "Mind Rain <no-reply@mindrain.org>"
REPLY_TO = "support@mindrain.org"
POSTMARK_BATCH_URL = "https://api.postmarkapp.com/email/batchWithTemplates"

# Postmark's hard limit per API request
POSTMARK_BATCH_LIMIT = 500

EMAIL_IDS = [

]

def build_messages(emails: list[str]) -> list[dict]:
    """Build the Messages payload for the Postmark batch endpoint."""
    return [
        {
            "From": FROM_EMAIL,
            "To": email,
            "TemplateId": TEMPLATE_ID,
            "ReplyTo": REPLY_TO,
            "TemplateModel": {}
        }
        for email in emails
    ]


def send_batch(messages: list[dict], batch_label: str = "") -> tuple[int, int]:
    """Send a batch of messages via Postmark. Returns (sent, failed) counts."""
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": POSTMARK_API_KEY,
    }

    print(f"  Sending {len(messages)} email(s){f' [{batch_label}]' if batch_label else ''}...")
    response = requests.post(POSTMARK_BATCH_URL, json={"Messages": messages}, headers=headers)

    if response.status_code != 200:
        print(f"  Postmark API error {response.status_code}: {response.text}")
        return 0, len(messages)

    results = response.json()
    sent = sum(1 for r in results if r.get("ErrorCode") == 0)
    failed = len(results) - sent

    print(f"  Done — Sent: {sent} | Failed: {failed}")
    for r in results:
        if r.get("ErrorCode") != 0:
            print(f"    ✗ {r.get('To')}: {r.get('Message')}")

    return sent, failed


def main():
    if not POSTMARK_API_KEY:
        raise ValueError("POSTMARK_API_KEY is not set in .env")

    total_emails = len(EMAIL_IDS)
    print(f"Loaded {total_emails} recipient(s)\n")

    total_sent = 0
    total_failed = 0

    # Chunk into Postmark's 500-email API limit
    for i in range(0, total_emails, POSTMARK_BATCH_LIMIT):
        chunk = EMAIL_IDS[i : i + POSTMARK_BATCH_LIMIT]
        batch_num = i // POSTMARK_BATCH_LIMIT + 1
        total_batches = -(-total_emails // POSTMARK_BATCH_LIMIT)  # ceiling division

        print(f"{'='*50}")
        print(f"Batch {batch_num}/{total_batches} — {len(chunk)} email(s)")
        print(f"{'='*50}")
        for email in chunk:
            print(f"  → {email}")
        print()

        messages = build_messages(chunk)
        sent, failed = send_batch(messages, batch_label=f"batch {batch_num}")
        total_sent += sent
        total_failed += failed

    print(f"\n{'='*50}")
    print(f"All done — Total sent: {total_sent} | Total failed: {total_failed}")
    print(f"{'='*50}")


if __name__ == "__main__":
    main()
