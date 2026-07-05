import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

class LockManager:
    @staticmethod
    async def acquire_advisory_lock(db: AsyncSession, lock_id: int) -> bool:
        """
        Acquires a PostgreSQL session-level advisory lock.
        Returns True if successful, False otherwise.
        """
        try:
            res = await db.execute(text("SELECT pg_try_advisory_lock(:lock_id)"), {"lock_id": lock_id})
            return bool(res.scalar())
        except Exception:
            return False

    @staticmethod
    async def release_advisory_lock(db: AsyncSession, lock_id: int) -> bool:
        """
        Releases a PostgreSQL session-level advisory lock.
        """
        try:
            res = await db.execute(text("SELECT pg_advisory_unlock(:lock_id)"), {"lock_id": lock_id})
            return bool(res.scalar())
        except Exception:
            return False
