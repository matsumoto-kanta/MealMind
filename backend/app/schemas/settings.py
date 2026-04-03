from pydantic import BaseModel, Field, field_validator
from typing import List, Literal


class ProfileData(BaseModel):
    gender: Literal["male", "female", "other"]
    age: int = Field(..., ge=0, le=150, description="年齢は0〜150歳の範囲で指定してください")
    height: int = Field(
        ..., ge=0, le=300, description="身長は0〜300cmの範囲で指定してください"
    )  # cm
    weight: int = Field(
        ..., ge=0, le=500, description="体重は0〜500kgの範囲で指定してください"
    )  # kg
    activity_level: Literal["low", "medium", "high"] = Field(..., alias="activityLevel")

    class Config:
        populate_by_name = True


class GoalData(BaseModel):
    target_weight: int = Field(
        ...,
        ge=0,
        le=500,
        alias="targetWeight",
        description="目標体重は0〜500kgの範囲で指定してください",
    )
    target_period_months: int = Field(
        ...,
        ge=0,
        le=24,
        alias="targetPeriodMonths",
        description="目標期間は0〜24ヶ月の範囲で指定してください",
    )

    class Config:
        populate_by_name = True


class PreferenceData(BaseModel):
    disliked_foods: List[str] = Field(
        default=[],
        alias="dislikedFoods",
        max_length=50,
        description="嫌いな食べ物のリスト（最大50件）",
    )
    allergies: List[str] = Field(
        default=[], max_length=50, description="アレルギーのリスト（最大50件）"
    )

    @field_validator("disliked_foods", "allergies", mode="before")
    @classmethod
    def remove_duplicates_and_validate(cls, v: List[str]) -> List[str]:
        """重複を削除し、空文字列を除外し、長さを制限"""
        if not isinstance(v, list):
            return []
        # 重複削除、空文字除外、前後の空白を削除
        cleaned = list(dict.fromkeys([item.strip() for item in v if item.strip()]))
        # 各項目の長さを制限（100文字まで）
        cleaned = [item[:100] for item in cleaned]
        return cleaned

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
