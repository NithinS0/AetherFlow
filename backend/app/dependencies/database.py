from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import SessionLocal

async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for injecting SQLAlchemy sessions into the Service layer."""
    async with SessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
