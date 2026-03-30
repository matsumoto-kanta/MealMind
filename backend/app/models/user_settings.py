from datetime import datetime
from sqlalchemy import Column, String, Integer, ARRAY, ForeignKey, Enum as SQLEnum, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum

from app.models.base import Base


class GenderEnum(str, enum.Enum):
    male = "male"
    female = "female"
    other = "other"


class ActivityLevelEnum(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"


class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )

    # Profile
    gender = Column(SQLEnum(GenderEnum), nullable=False)
    age = Column(Integer, nullable=False)
    height = Column(Integer, nullable=False)  # cm
    weight = Column(Integer, nullable=False)  # kg
    activity_level = Column(SQLEnum(ActivityLevelEnum), nullable=False)

    # Goal
    target_weight = Column(Integer, nullable=False)  # kg

    # Preferences
    disliked_foods = Column(ARRAY(String), nullable=False, default=[])
    allergies = Column(ARRAY(String), nullable=False, default=[])

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    user = relationship("User", back_populates="settings")
