# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "dotenv>=0.9.9",
#     "requests>=2.34.2",
#     "supabase>=2.34.1",
# ]
# ///
"""Re-send certificates for the teams that failed, ONE EMAIL PER ADDRESS,
so a single inactive address can't block the others."""

import base64
import os

import requests
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

CERT_ROOT = "/home/senku/mr home/TUH Certificates"
FROM_EMAIL = "Mind Rain <team@mindrain.org>"
REPLY_TO = "no-reply@mindrain.org"
SUBJECT = "Your Certificate - The Unreal House | Mind Rain"
AWARD = "an Honorable Mention"

# team_id -> award folder (the teams that failed in the group send)
TEAMS = {
    "TUH-A-I-GRP-0101": "Honorable Mentions Certificates",
    "TUH-A-I-GRP-0108": "Honorable Mentions Certificates",
}

TEST = False  # if True, every email goes to TEST_EMAIL instead of the real recipients
TEST_EMAIL = os.getenv("TEST_EMAIL")  # set TEST_EMAIL in .env
AUTH_ONLY = True  # if True, send only to the auth account email (skip member emails)

supabase = create_client(os.getenv("NEXT_PUBLIC_SUPABASE_URL"), os.getenv("SUPABASE_SECRET_KEY"))
LINE = "-" * 70


def get_emails(team_id):
    """Member emails + account email, deduplicated (case-insensitive)."""
    reg = supabase.from_("registrations").select("id, registration_by").eq("team_id", team_id).single().execute().data
    emails = [supabase.auth.admin.get_user_by_id(reg["registration_by"]).user.email]
    if AUTH_ONLY:
        return emails
    members = supabase.from_("members").select("email").eq("registration_id", reg["id"]).execute().data
    emails += [m["email"] for m in members]

    unique = {}
    for e in emails:
        unique.setdefault(e.strip().lower(), e.strip())
    return list(unique.values())


def send(to, team_id, paths):
    attachments = []
    for p in paths:
        with open(p, "rb") as f:
            attachments.append({
                "Name": os.path.basename(p),
                "Content": base64.b64encode(f.read()).decode(),
                "ContentType": "application/pdf",
            })
    body = (
        f"Dear Participant,\n\nCongratulations! Team {team_id} has secured {AWARD} in The Unreal House.\n\n"
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


for team_id, folder in TEAMS.items():
    team_dir = f"{CERT_ROOT}/{folder}/{team_id}"
    paths = sorted(f"{team_dir}/{f}" for f in os.listdir(team_dir) if f.endswith(".pdf"))
    for email in get_emails(team_id):
        to = TEST_EMAIL if TEST else email
        print(LINE)
        print(f"Award   : {folder}")
        print(f"Team ID : {team_id}")
        print(f"To      : {to}" + (f"  (TEST, real: {email})" if TEST else ""))
        for p in paths:
            print(f"File    : {p}")
        ok, response = send(to, team_id, paths)
        print(f"Status  : {'SUCCESS' if ok else 'FAILURE'}")
        print(f"Response: {response}")
print(LINE)
