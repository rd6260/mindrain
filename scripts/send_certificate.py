"""
Send The Unreal House certificates (winners + honorable mentions) by email.

Certificate directory layout:

    <CERT_ROOT>/
        Winner 1st Place/<TEAM_ID>/<Member Name>.pdf
        Winner 2nd Place/<TEAM_ID>/<Member Name>.pdf
        Winner 3rd Place/<TEAM_ID>/<Member Name>.pdf
        Honorable Mentions Certificates/<TEAM_ID>/<Member Name>.pdf

For every team folder we collect, from Supabase:
  * the email of every member in the registration form (`members.email`)
  * the email of the user account that made the registration (auth user)
De-duplicate (case-insensitive) and send ONE email per unique address with all
certificates of that team attached.

Usage:
    python scripts/send_certificate.py            # dry run (default) - nothing is sent
    python scripts/send_certificate.py --send     # actually send via Postmark
    python scripts/send_certificate.py --send --only TUH-A-I-GRP-0017   # single team
"""

import argparse
import base64
import html
import os
import sys
from collections import OrderedDict

import requests
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

# ---------------------------------------------------------------- config ----
CERT_ROOT = "/home/senku/mr home/TUH Certificates"
EVENT_NAME = "The Unreal House"
FROM_EMAIL = "Mind Rain <team@mindrain.org>"
REPLY_TO = "team@mindrain.org"
POSTMARK_BATCH_URL = "https://api.postmarkapp.com/email/batch"
POSTMARK_API_KEY = os.getenv("POSTMARK_API_KEY")

# Postmark limits: 500 messages / 50 MB per batch request, 10 MB per message.
# Messages carry attachments, so keep batches small.
MESSAGES_PER_REQUEST = 10
MAX_MESSAGE_BYTES = 10 * 1024 * 1024

# folder name -> (award label used in the email, sort order)
AWARD_FOLDERS = OrderedDict([
    ("Winner 1st Place", "1st Place Winner"),
    ("Winner 2nd Place", "2nd Place Winner"),
    ("Winner 3rd Place", "3rd Place Winner"),
    ("Honorable Mentions Certificates", "Honorable Mention"),
])

SUBJECT = "Your Certificate – {event} | Mind Rain"


# ------------------------------------------------------- read certificates ---
def scan_certificates(root):
    """Return list of {team_id, award, files:[path, ...]} from the folder tree."""
    teams = []
    for folder, award in AWARD_FOLDERS.items():
        award_dir = os.path.join(root, folder)
        if not os.path.isdir(award_dir):
            print(f"  ! Missing folder: {award_dir}")
            continue
        for team_id in sorted(os.listdir(award_dir)):
            team_dir = os.path.join(award_dir, team_id)
            if not os.path.isdir(team_dir):
                continue
            files = sorted(
                os.path.join(team_dir, f)
                for f in os.listdir(team_dir)
                if f.lower().endswith(".pdf")
            )
            if not files:
                print(f"  ! No PDFs in {team_dir}")
                continue
            teams.append({"team_id": team_id, "award": award, "files": files})
    return teams


# ---------------------------------------------------------- fetch emails ----
def get_account_email(supabase, user_id, cache):
    if user_id in cache:
        return cache[user_id]
    email = None
    try:
        res = supabase.auth.admin.get_user_by_id(user_id)
        email = (res.user.email or "").strip() if res and res.user else None
    except Exception as e:
        print(f"  ! Could not fetch auth user {user_id}: {e}")
    cache[user_id] = email
    return email


def fetch_team_emails(supabase, team_ids):
    """
    Return {team_id: [email, ...]} (de-duplicated, case-insensitive, order kept).
    Looks in `registrations` (+ `members`) first, then falls back to
    `registrations_2` (single-person form with its own email column).
    """
    result = {t: OrderedDict() for t in team_ids}  # lowercase email -> original
    account_cache = {}

    def add(team_id, email):
        email = (email or "").strip()
        if email and "@" in email:
            result[team_id].setdefault(email.lower(), email)

    found = set()

    # --- registrations + members -------------------------------------------
    regs = (
        supabase.from_("registrations")
        .select("id, team_id, registration_by")
        .in_("team_id", list(team_ids))
        .execute()
        .data
        or []
    )
    reg_to_team = {r["id"]: r["team_id"] for r in regs}
    for r in regs:
        found.add(r["team_id"])
        add(r["team_id"], get_account_email(supabase, r["registration_by"], account_cache))

    if reg_to_team:
        members = (
            supabase.from_("members")
            .select("registration_id, name, email")
            .in_("registration_id", list(reg_to_team))
            .execute()
            .data
            or []
        )
        for m in members:
            add(reg_to_team[m["registration_id"]], m.get("email"))

    # --- fallback: registrations_2 ------------------------------------------
    missing = [t for t in team_ids if t not in found]
    if missing:
        regs2 = (
            supabase.from_("registrations_2")
            .select("team_id, registration_by, email")
            .in_("team_id", missing)
            .execute()
            .data
            or []
        )
        for r in regs2:
            found.add(r["team_id"])
            add(r["team_id"], r.get("email"))
            add(r["team_id"], get_account_email(supabase, r["registration_by"], account_cache))

    for t in team_ids:
        if t not in found:
            print(f"  ! Team {t} not found in registrations / registrations_2")

    return {t: list(v.values()) for t, v in result.items()}


# ------------------------------------------------------------- email body ---
def person_name(path):
    return os.path.splitext(os.path.basename(path))[0].strip()


def build_bodies(team):
    names = [person_name(f) for f in team["files"]]
    award = team["award"]
    event = EVENT_NAME

    if award == "Honorable Mention":
        achievement = f"an <b>Honorable Mention</b> in <b>{event}</b>"
        achievement_text = f"an Honorable Mention in {event}"
    else:
        achievement = f"the <b>{award}</b> position in <b>{event}</b>"
        achievement_text = f"the {award} position in {event}"

    li = "".join(f"<li>{html.escape(n)}</li>" for n in names)
    html_body = f"""\
<div style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; color: #222; line-height: 1.6;">
  <p>Dear Participant,</p>
  <p>Congratulations! Team <b>{html.escape(team['team_id'])}</b> has been awarded {achievement}.</p>
  <p>We are pleased to share the certificate(s) for the following team member(s), attached to this email:</p>
  <ul>{li}</ul>
  <p>Please check that the names on the certificates are correct and reach out to us by replying to this email if any correction is needed.</p>
  <p>Thank you for being a part of {event}. We wish you all the best for your future endeavours.</p>
  <p>Warm regards,<br><b>Team Mind Rain</b><br>
  <a href="https://www.mindrain.org">www.mindrain.org</a></p>
</div>"""

    text_body = (
        "Dear Participant,\n\n"
        f"Congratulations! Team {team['team_id']} has been awarded {achievement_text}.\n\n"
        "The certificate(s) for the following team member(s) are attached:\n"
        + "\n".join(f"  - {n}" for n in names)
        + "\n\nPlease check that the names are correct and reply to this email if any correction is needed.\n\n"
        f"Thank you for being a part of {event}.\n\n"
        "Warm regards,\nTeam Mind Rain\nhttps://www.mindrain.org\n"
    )
    return html_body, text_body


def load_attachments(files):
    attachments = []
    for path in files:
        with open(path, "rb") as f:
            content = base64.b64encode(f.read()).decode("utf-8")
        attachments.append({
            "Name": os.path.basename(path),
            "Content": content,
            "ContentType": "application/pdf",
        })
    return attachments


def build_message(to_email, team, attachments):
    html_body, text_body = build_bodies(team)
    return {
        "From": FROM_EMAIL,
        "To": to_email,
        "ReplyTo": REPLY_TO,
        "Subject": SUBJECT.format(event=EVENT_NAME),
        "HtmlBody": html_body,
        "TextBody": text_body,
        "Attachments": attachments,
        "MessageStream": "outbound",
    }


# ---------------------------------------------------------------- sending ---
def send_batch(messages):
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": POSTMARK_API_KEY,
    }
    response = requests.post(POSTMARK_BATCH_URL, json=messages, headers=headers)
    if response.status_code != 200:
        print(f"  Postmark API error {response.status_code}: {response.text}")
        return 0, len(messages)

    results = response.json()
    sent = sum(1 for r in results if r.get("ErrorCode") == 0)
    failed = len(results) - sent
    print(f"  Result -> Sent: {sent} | Failed: {failed}")
    for r in results:
        if r.get("ErrorCode") != 0:
            print(f"    x {r.get('To')}: {r.get('Message')}")
    return sent, failed


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--send", action="store_true", help="Actually send emails (default: dry run)")
    parser.add_argument("--only", nargs="+", metavar="TEAM_ID", help="Only process these team IDs")
    args = parser.parse_args()
    dry_run = not args.send

    supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not supabase_url or not service_key:
        sys.exit("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing in .env")
    if not dry_run and not POSTMARK_API_KEY:
        sys.exit("POSTMARK_API_KEY is not set in .env")
    if not os.path.isdir(CERT_ROOT):
        sys.exit(f"Certificate directory not found: {CERT_ROOT}")

    supabase = create_client(supabase_url, service_key)

    print(f"Mode: {'DRY RUN (no emails sent)' if dry_run else 'LIVE SEND'}")
    teams = scan_certificates(CERT_ROOT)
    if args.only:
        wanted = set(args.only)
        teams = [t for t in teams if t["team_id"] in wanted]
    if not teams:
        sys.exit("No certificate folders found.")
    print(f"Found {len(teams)} teams, {sum(len(t['files']) for t in teams)} certificates\n")

    emails_by_team = fetch_team_emails(supabase, [t["team_id"] for t in teams])

    messages = []  # (label, message)
    skipped = []
    for team in teams:
        emails = emails_by_team.get(team["team_id"], [])
        print(f"{team['team_id']}  [{team['award']}]")
        for f in team["files"]:
            print(f"    cert : {os.path.basename(f)}")
        if not emails:
            print("    emails: NONE FOUND - skipping")
            skipped.append(team["team_id"])
            continue
        for e in emails:
            print(f"    email: {e}")

        attachments = load_attachments(team["files"])
        size = sum(len(a["Content"]) for a in attachments)
        if size > MAX_MESSAGE_BYTES:
            print(f"    ! attachments ~{size / 1e6:.1f} MB exceed Postmark's 10 MB limit - skipping")
            skipped.append(team["team_id"])
            continue
        for e in emails:
            messages.append((team["team_id"], build_message(e, team, attachments)))

    print(f"\n{len(messages)} emails prepared across {len(teams) - len(skipped)} teams")
    if skipped:
        print(f"Skipped teams: {', '.join(skipped)}")

    if dry_run:
        print("Dry run complete. Re-run with --send to send the emails.")
        return

    total_sent = total_failed = 0
    for i in range(0, len(messages), MESSAGES_PER_REQUEST):
        chunk = [m for _, m in messages[i:i + MESSAGES_PER_REQUEST]]
        print(f"\nBatch {i // MESSAGES_PER_REQUEST + 1}: sending {len(chunk)} email(s)")
        sent, failed = send_batch(chunk)
        total_sent += sent
        total_failed += failed
    print(f"\nDone. Sent: {total_sent} | Failed: {total_failed}")


if __name__ == "__main__":
    main()
