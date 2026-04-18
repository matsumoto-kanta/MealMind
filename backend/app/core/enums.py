"""
Application-wide enum definitions.
"""
import enum


class GenderEnum(str, enum.Enum):
    """Gender options for user settings."""
    male = "male"
    female = "female"
    other = "other"


class ActivityLevelEnum(str, enum.Enum):
    """Activity level options for user settings."""
    low = "low"
    medium = "medium"
    high = "high"
