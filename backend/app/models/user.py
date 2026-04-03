from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.models.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    google_id = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=True)
    picture = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    settings = relationship("UserSettings", back_populates="user", uselist=False)
    monthly_budgets = relationship("MonthlyBudget", back_populates="user")
    meals = relationship("Meal", back_populates="user")
