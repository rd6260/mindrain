import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

FILTER_OUT_REGISTERED_USER = True


def get_client() -> Client:
    """Create and return a Supabase client with service role privileges."""
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def fetch_auth_users(supabase: Client) -> list[dict]:
    """Fetch all users from auth.users via Supabase Admin API."""
    all_users = []
    page = 1
    per_page = 100  # max allowed

    while True:
        response = supabase.auth.admin.list_users(
            page=page,
            per_page=per_page,
        )

        users = response if isinstance(response, list) else []
        all_users.extend([u.model_dump() if hasattr(u, "model_dump") else vars(u) for u in users])

        if len(users) < per_page:
            break

        page += 1

    return all_users


def fetch_registered_users(supabase: Client) -> set[str]:
    """Fetch the set of user IDs that have at least one paid registration."""
    all_user_ids = set()
    page_size = 1000
    offset = 0

    while True:
        response = (
            supabase.table("registrations")
            .select("registration_by")
            .eq("paid", True)
            .range(offset, offset + page_size - 1)
            .execute()
        )

        rows = response.data or []
        for row in rows:
            all_user_ids.add(row["registration_by"])

        if len(rows) < page_size:
            break

        offset += page_size

    return all_user_ids


if __name__ == "__main__":
    supabase = get_client()

    users = fetch_auth_users(supabase)
    print(f"Total users fetched: {len(users)}\n")

    paid_user_ids = set()
    if FILTER_OUT_REGISTERED_USER:
        paid_user_ids = fetch_registered_users(supabase)
        print(f"Users with paid registrations:   {len(paid_user_ids)}\n")
        print(f"Users with unpaid registrations: {len(users) - len(paid_user_ids)}\n")

    for index, user in enumerate(users):
        email = user.get("email")
        user_id = user.get("id")

        if FILTER_OUT_REGISTERED_USER and user_id in paid_user_ids:
            continue

        print(f"{index+1:03} | Email: {email}")
