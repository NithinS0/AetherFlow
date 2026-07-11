import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.core.config import settings

db_url = settings.DATABASE_URL
if db_url.startswith("sqlite"):
    parts = db_url.split("sqlite+aiosqlite:///")
    if len(parts) == 2:
        path_part = parts[1]
        if path_part.startswith("./"):
            path_part = path_part[2:]
        if not os.path.isabs(path_part) and not (len(path_part) > 1 and path_part[1] == ":"):
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            db_path = os.path.abspath(os.path.join(base_dir, path_part))
            db_url = f"sqlite+aiosqlite:///{db_path}"

async_engine = create_async_engine(db_url, echo=False, pool_pre_ping=True)

AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)
SessionLocal = AsyncSessionLocal

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
