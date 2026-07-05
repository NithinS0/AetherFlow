import logging
import uuid
from typing import Dict, Any, Optional
from supabase import create_client, Client
from app.core.config import settings
from app.core.security import get_password_hash, create_access_token

logger = logging.getLogger("aetherflow.supabase")

class SupabaseService:
    def __init__(self):
        self.supabase: Optional[Client] = None
        key = settings.SUPABASE_KEY or settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
        if settings.SUPABASE_URL and key:
            try:
                self.supabase = create_client(settings.SUPABASE_URL, key)
                logger.info("Supabase client initialized successfully.")
            except Exception as e:
                logger.error(f"Failed to initialize Supabase client: {e}")
        else:
            logger.error("Supabase configuration keys missing. Supabase services are disabled.")

    def is_configured(self) -> bool:
        return self.supabase is not None

    async def auth_register(self, email: str, password: str) -> Dict[str, Any]:
        """
        Registers a user. If Supabase is active, registers via Supabase GoTrue;
        otherwise triggers local password-backed registry mock.
        """
        if self.is_configured():
            try:
                res = self.supabase.auth.sign_up({"email": email, "password": password})
                return {
                    "id": uuid.UUID(res.user.id),
                    "email": res.user.email,
                    "created_at": res.user.created_at
                }
            except Exception as e:
                raise ValueError(f"Supabase Sign-Up failed: {e}")
        raise RuntimeError("Supabase is not configured. Register endpoint cannot run without SUPABASE_URL and keys.")

    async def auth_login(self, email: str, password: str) -> Dict[str, Any]:
        """
        Logs in a user. Returns access token, refresh token, and token type.
        """
        if self.is_configured():
            try:
                res = self.supabase.auth.sign_in_with_password({"email": email, "password": password})
                return {
                    "access_token": res.session.access_token,
                    "refresh_token": res.session.refresh_token,
                    "token_type": "bearer"
                }
            except Exception as e:
                raise ValueError(f"Supabase Sign-In failed: {e}")
        raise RuntimeError("Supabase is not configured. Login endpoint cannot run without SUPABASE_URL and keys.")

    async def auth_reset_password(self, email: str) -> None:
        """
        Dispatches a password reset email via Supabase.
        """
        if self.is_configured():
            try:
                self.supabase.auth.reset_password_email(email)
            except Exception as e:
                raise ValueError(f"Supabase Password Reset failed: {e}")
        else:
            raise RuntimeError("Supabase is not configured. Reset endpoint cannot run without SUPABASE_URL and keys.")

    async def upload_file(self, bucket: str, path: str, file_bytes: bytes) -> str:
        """
        Uploads an asset to Supabase Storage and returns the public URL.
        If mock mode, returns a mock local public URL.
        """
        if self.is_configured():
            try:
                self.supabase.storage.from_(bucket).upload(path, file_bytes, {"x-upsert": "true"})
                public_url = self.supabase.storage.from_(bucket).get_public_url(path)
                return public_url
            except Exception as e:
                logger.error(f"Supabase Storage Upload failed: {e}")
                raise
        raise RuntimeError("Supabase is not configured. Storage upload cannot run without SUPABASE_URL and keys.")

    async def broadcast_realtime(self, channel: str, event: str, payload: Dict[str, Any]) -> None:
        """
        Broadcasts a message to Supabase Realtime channel.
        """
        if self.is_configured():
            try:
                # supabase-py has realtime support through websockets or direct REST edge push channels
                self.supabase.realtime.channel(channel).send({
                    "type": "broadcast",
                    "event": event,
                    "payload": payload
                })
            except Exception as e:
                logger.error(f"Supabase Realtime Broadcast failed: {e}")
                raise
        else:
            raise RuntimeError("Supabase is not configured. Realtime broadcast cannot run without SUPABASE_URL and keys.")

supabase_service = SupabaseService()
