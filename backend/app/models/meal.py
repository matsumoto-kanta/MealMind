import enum
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Date,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    JSON,
)
from sqlalchemy.dialects.postgresql import UUID, ENUM as PG_ENUM
from sqlalchemy.orm import relationship
from app.models.base import Base
import uuid


class MealTypeEnum(str, enum.Enum):
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"


class MealStatusEnum(str, enum.Enum):
    DRAFT = "draft"
    CONFIRMED = "confirmed"


class Meal(Base):
    __tablename__ = "meals"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    meal_date = Column(Date, nullable=False)
    meal_type = Column(
        PG_ENUM("breakfast", "lunch", "dinner", name="mealtypeenum", create_type=False),
        nullable=False,
    )
    status = Column(
        PG_ENUM("draft", "confirmed", name="mealstatusenum", create_type=False),
        nullable=False,
        default="draft",
    )
    name = Column(String, nullable=False)
    kcal = Column(Integer, nullable=False)
    cost = Column(Integer, nullable=False)
    protein = Column(Integer, nullable=False)
    fat = Column(Integer, nullable=False)
    carbohydrates = Column(Integer, nullable=False)
    ingredients = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    user = relationship("User", back_populates="meals")

    # Unique constraint: one meal per user per date per meal type
    __table_args__ = (
        UniqueConstraint(
            "user_id", "meal_date", "meal_type", name="uix_user_meal_date_type"
        ),
    )
