from sqlalchemy import func, create_engine
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column, DeclarativeBase, Session, sessionmaker
from sqlalchemy.ext.asyncio import AsyncAttrs, async_sessionmaker, create_async_engine, AsyncSession
database_url = 'sqlite+aiosqlite:///db.sqlite3'
engine1 = create_async_engine(url=database_url)
engine2 = create_engine(database_url, connect_args={"check_same_thread": False})
async_session_maker = async_sessionmaker(engine1, class_=AsyncSession)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine2)


def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class Base(AsyncAttrs, DeclarativeBase):
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())
