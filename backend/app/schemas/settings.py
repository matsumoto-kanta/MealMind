from pydantic import BaseModel, Field
from typing import List, Literal


class ProfileData(BaseModel):
    gender: Literal["male", "female", "other"]
    age: int = Field(..., ge=1, le=150)
    height: int = Field(..., ge=50, le=300)  # cm
    weight: int = Field(..., ge=20, le=500)  # kg
    activity_level: Literal["low", "medium", "high"] = Field(..., alias="activityLevel")

    class Config:
        populate_by_name = True


class GoalData(BaseModel):
    target_weight: int = Field(..., ge=20, le=500, alias="targetWeight")
    target_period_months: int = Field(..., ge=1, le=24, alias="targetPeriodMonths")

    class Config:
        populate_by_name = True


class PreferenceData(BaseModel):
    disliked_foods: List[str] = Field(default=[], alias="dislikedFoods")
    allergies: List[str] = Field(default=[])

    class Config:
        populate_by_name = True


class SettingsData(BaseModel):
    profile: ProfileData
    goal: GoalData
    preference: PreferenceData

    class Config:
        from_attributes = True


class SettingsResponse(BaseModel):
    settings: SettingsData
