# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "cairosvg>=2.9.0",
#     "supabase>=2.0.0",
#     "python-dotenv>=1.0.0",
# ]
# ///

import os
from pathlib import Path

import cairosvg
from dotenv import load_dotenv
from supabase import create_client

# ── Supabase client ───────────────────────────────────────────────────────────
load_dotenv()
supabase = create_client(
    os.getenv("NEXT_PUBLIC_SUPABASE_URL"),
    os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
)

BUCKET = "college_id"
BUCKET_FOLDER = "TUH_participation_certificate"

# ── Load SVG template ─────────────────────────────────────────────────────────
template = Path("scripts/assets/TUH-participation-certificate.svg").read_text()


def cleanup():
    """
    1. Delete all files inside college_id/TUH_participation_certificate.
    2. Set participation_certificates = null on every registration row.
    """
    print("── Cleanup ──────────────────────────────────────────────────────────")

    # List all files in the folder (paginated, 100 at a time)
    all_paths: list[str] = []
    offset = 0
    limit = 100
    while True:
        items = supabase.storage.from_(BUCKET).list(
            BUCKET_FOLDER,
            {"limit": limit, "offset": offset},
        )
        if not items:
            break
        for item in items:
            # Each item is a file directly inside the folder or a sub-"folder" object.
            # Files have a non-None 'id'; folder placeholders may not.
            all_paths.append(f"{BUCKET_FOLDER}/{item['name']}")
        if len(items) < limit:
            break
        offset += limit

    if all_paths:
        print(f"  Deleting {len(all_paths)} object(s) from storage...")
        supabase.storage.from_(BUCKET).remove(all_paths)
    else:
        print("  Storage folder is already empty.")

    # Clear participation_certificates on ALL registrations (paid or not)
    print("  Clearing participation_certificates in registrations table...")
    supabase.from_("registrations").update(
        {"participation_certificates": None}
    ).neq("id", "00000000-0000-0000-0000-000000000000").execute()
    # ^ .neq acts as a no-op filter that matches every row (no .update() without filter allowed)

    print("  ✓ Cleanup complete.\n")


# ── Run cleanup first ─────────────────────────────────────────────────────────
cleanup()

# ── Fetch all PAID registrations ──────────────────────────────────────────────
print("── Generating certificates ──────────────────────────────────────────────")
print("Fetching paid registrations...")
regs_resp = (
    supabase
    .from_("registrations")
    .select("id, team_id, participation_certificates")
    .eq("paid", True)
    .execute()
)

if not regs_resp.data:
    print("No paid registrations found.")
    exit()

registrations = regs_resp.data
print(f"Found {len(registrations)} paid registration(s).")

# ── Process each registration ─────────────────────────────────────────────────
for reg in registrations:
    reg_id = reg["id"]
    team_id = reg.get("team_id", reg_id)

    # Fetch members for this registration
    members_resp = (
        supabase
        .from_("members")
        .select("id, name")
        .eq("registration_id", reg_id)
        .execute()
    )

    members = members_resp.data or []
    if not members:
        print(f"  [SKIP] Registration {team_id} — no members found.")
        continue

    print(f"\nProcessing registration {team_id} ({len(members)} member(s))...")

    cert_urls: list[str] = []

    for member in members:
        member_id = member["id"]
        name = member["name"]

        # 1. Render SVG → PNG in-memory
        svg = template.replace("{{NAME}}", name)
        png_bytes = cairosvg.svg2png(
            bytestring=svg.encode("utf-8"),
            dpi=300,
        )

        # 2. Build storage path: <folder>/<registration_id>/<member_id>.png
        storage_path = f"{BUCKET_FOLDER}/{reg_id}/{member_id}.png"

        # 3. Upload to Supabase Storage
        print(f"  Uploading certificate for '{name}' → {storage_path}")
        supabase.storage.from_(BUCKET).upload(
            path=storage_path,
            file=png_bytes,
            file_options={
                "content-type": "image/png",
                "upsert": "true",
            },
        )

        # 4. Get public URL
        url = supabase.storage.from_(BUCKET).get_public_url(storage_path)
        cert_urls.append(url)

    # 5. Store all URLs back into registrations.participation_certificates
    print(f"  Saving {len(cert_urls)} URL(s) to registrations table...")
    supabase.from_("registrations").update(
        {"participation_certificates": cert_urls}
    ).eq("id", reg_id).execute()

    print(f"  ✓ Done — {team_id}")

print("\n✅ All certificates generated and uploaded.")
