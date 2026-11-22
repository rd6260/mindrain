# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "dotenv>=0.9.9",
#     "requests>=2.34.2",
#     "supabase>=2.34.1",
# ]
# ///
"""Send The Unreal House certificates to winners and honorable mentions.

<CERT_ROOT>/<award folder>/<TEAM_ID>/<Person Name>.pdf
Recipients per team = all member emails + registering account email (deduplicated).
Each recipient gets one email with all the team's certificates attached.
"""

import base64
import os

import requests
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

CERT_ROOT = "/home/senku/mr home/TUH Certificates"
FROM_EMAIL = "Mind Rain <team@mindrain.org>"
REPLY_TO = "team@mindrain.org"
SUBJECT = "Your Certificate - The Unreal House | Mind Rain"
AWARDS = {
    "Winner 1st Place": "1st Place",
    "Winner 2nd Place": "2nd Place",
    "Winner 3rd Place": "3rd Place",
    "Honorable Mentions Certificates": "an Honorable Mention",
}

supabase = create_client(os.getenv("NEXT_PUBLIC_SUPABASE_URL"), os.getenv("SUPABASE_SECRET_KEY"))
LINE = "-" * 70

TEST = True  # if True, every email goes to TEST_EMAIL instead of the real recipients
TEST = False
TEST_EMAIL = "rohandas.zero@gmail.com"


def get_emails(team_id):
    """Member emails + account email, deduplicated (case-insensitive)."""
    reg = supabase.from_("registrations").select("id, registration_by").eq("team_id", team_id).single().execute().data
    emails = [supabase.auth.admin.get_user_by_id(reg["registration_by"]).user.email]
    members = supabase.from_("members").select("email").eq("registration_id", reg["id"]).execute().data
    emails += [m["email"] for m in members]

    unique = {}
    for e in emails:
        unique.setdefault(e.strip().lower(), e.strip())
    return list(unique.values())


def send(to, award, team_id, paths):
    attachments = []
    for p in paths:
        with open(p, "rb") as f:
            attachments.append({
                "Name": os.path.basename(p),
                "Content": base64.b64encode(f.read()).decode(),
                "ContentType": "application/pdf",
            })
    body = (
        f"Dear Participant,\n\nCongratulations! Team {team_id} has secured {award} in The Unreal House.\n\n"
        "We noticed you haven't had a chance to download your certificate from our portal yet, "
        "so we have attached the document directly to this email for your convenience.\n\n"
        "Warm regards,\nTeam Mind Rain\nhttps://www.mindrain.org"
    )
    res = requests.post(
        "https://api.postmarkapp.com/email",
        headers={"Accept": "application/json", "X-Postmark-Server-Token": os.getenv("POSTMARK_API_KEY")},
        json={"From": FROM_EMAIL, "To": to, "ReplyTo": REPLY_TO, "Subject": SUBJECT,
              "TextBody": body, "Attachments": attachments},
    )
    return res.ok and res.json().get("ErrorCode") == 0, res.text


for folder, award in AWARDS.items():
    for team_id in sorted(os.listdir(f"{CERT_ROOT}/{folder}")):
        team_dir = f"{CERT_ROOT}/{folder}/{team_id}"
        paths = sorted(f"{team_dir}/{f}" for f in os.listdir(team_dir) if f.endswith(".pdf"))
        emails = get_emails(team_id)
        to = TEST_EMAIL if TEST else ", ".join(emails)  # Postmark accepts comma-separated "To" (max 50)
        print(LINE)
        print(f"Award   : {folder}")
        print(f"Team ID : {team_id}")
        print(f"To      : {to}" + (f"  (TEST, real: {', '.join(emails)})" if TEST else ""))
        for p in paths:
            print(f"File    : {p}")
        ok, response = send(to, award, team_id, paths)
        print(f"Status  : {'SUCCESS' if ok else 'FAILURE'}")
        print(f"Response: {response}")
print(LINE)
