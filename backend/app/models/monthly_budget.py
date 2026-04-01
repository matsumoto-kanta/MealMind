from datetime import datetime
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.models.base import Base


class MonthlyBudget(Base):
    __tablename__ = "monthly_budgets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    year_month = Column(String, nullable=False)  # Format: "YYYY-MM"
    monthly_budget = Column(Integer, nullable=False, default=0)  # 月間予算額
    spent = Column(Integer, nullable=False, default=0)  # 使用金額

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    user = relationship("User", back_populates="monthly_budgets")

    # Unique constraint: one budget per user per month
    __table_args__ = (
        UniqueConstraint("user_id", "year_month", name="uq_user_year_month"),
    )
