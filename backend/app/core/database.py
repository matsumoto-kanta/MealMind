from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
import os

from app.core.config import settings

# Create SQLAlchemy engine
# 本番環境ではSQL echoを無効化
is_production = os.getenv("ENVIRONMENT") == "production"
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    echo=not is_production,  # 開発環境のみSQLログを出力
    pool_size=5,
    max_overflow=10,
    pool_timeout=30,
    pool_recycle=1800,  # 30分ごとに接続をリサイクル
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    Dependency function to get database session.
    Yields a database session and closes it after use.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
