import logging
import os
from typing import Optional
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("aetherflow.supabase")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.warning("Supabase credentials missing from environment. Supabase client will not be initialized.")
    supabase_admin: Optional[Client] = None
else:
    supabase_admin: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

if supabase_admin is None:
    def _raise_missing_config() -> None:
        raise RuntimeError("Missing Supabase configuration. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY.")
else:
    def _raise_missing_config() -> None:
        return None


def get_supabase_client(jwt: str = None) -> Client:
    """
    Returns a Supabase client. If a JWT is provided, it initializes the client
    with that JWT to enforce Row Level Security (RLS) for the current user.
    Otherwise, returns the admin client.
    """
    if not SUPABASE_URL or not SUPABASE_KEY:
        _raise_missing_config()

    if jwt:
        if not os.getenv("SUPABASE_ANON_KEY"):
            raise RuntimeError("Supabase JWT client requires SUPABASE_ANON_KEY to be configured.")
        client = create_client(SUPABASE_URL, os.getenv("SUPABASE_ANON_KEY"))
        client.postgrest.auth(jwt)
        return client

    if supabase_admin is None:
        raise RuntimeError("Supabase admin client is not configured.")
    return supabase_admin
