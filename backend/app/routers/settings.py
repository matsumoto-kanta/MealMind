from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.middleware.auth import get_current_user
from app.schemas.settings import (
    SettingsResponse,
    ProfileData,
    GoalData,
    PreferenceData,
)
from app.services import settings_service

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("", response_model=SettingsResponse)
def get_settings(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    ユーザー設定を取得
    """
    user_id = UUID(current_user["sub"])
    settings = settings_service.get_user_settings(db, user_id)

    if not settings:
        # 設定が存在しない場合はデフォルト設定を作成
        settings = settings_service.create_default_settings(db, user_id)

    # UserSettingsモデルからSettingsDataに変換
    from app.schemas.settings import SettingsData

    settings_data = SettingsData(
        profile={
            "gender": settings.gender.value,
            "age": settings.age,
            "height": settings.height,
            "weight": settings.weight,
            "activityLevel": settings.activity_level.value,
        },
        goal={"targetWeight": settings.target_weight},
        preference={
            "dislikedFoods": settings.disliked_foods,
            "allergies": settings.allergies,
        },
    )

    return {"settings": settings_data}


@router.put("/profile", response_model=SettingsResponse)
def update_profile(
    profile: ProfileData,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    プロフィール更新
    """
    user_id = UUID(current_user["sub"])

    try:
        settings = settings_service.update_profile(db, user_id, profile)

        from app.schemas.settings import SettingsData

        settings_data = SettingsData(
            profile={
                "gender": settings.gender.value,
                "age": settings.age,
                "height": settings.height,
                "weight": settings.weight,
                "activityLevel": settings.activity_level.value,
            },
            goal={"targetWeight": settings.target_weight},
            preference={
                "dislikedFoods": settings.disliked_foods,
                "allergies": settings.allergies,
            },
        )

        return {"settings": settings_data}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.put("/goal", response_model=SettingsResponse)
def update_goal(
    goal: GoalData,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    目標更新
    """
    user_id = UUID(current_user["sub"])

    try:
        settings = settings_service.update_goal(db, user_id, goal)

        from app.schemas.settings import SettingsData

        settings_data = SettingsData(
            profile={
                "gender": settings.gender.value,
                "age": settings.age,
                "height": settings.height,
                "weight": settings.weight,
                "activityLevel": settings.activity_level.value,
            },
            goal={"targetWeight": settings.target_weight},
            preference={
                "dislikedFoods": settings.disliked_foods,
                "allergies": settings.allergies,
            },
        )

        return {"settings": settings_data}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.put("/preference", response_model=SettingsResponse)
def update_preference(
    preference: PreferenceData,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    食の好み・アレルギー更新
    """
    user_id = UUID(current_user["sub"])

    try:
        settings = settings_service.update_preference(db, user_id, preference)

        from app.schemas.settings import SettingsData

        settings_data = SettingsData(
            profile={
                "gender": settings.gender.value,
                "age": settings.age,
                "height": settings.height,
                "weight": settings.weight,
                "activityLevel": settings.activity_level.value,
            },
            goal={"targetWeight": settings.target_weight},
            preference={
                "dislikedFoods": settings.disliked_foods,
                "allergies": settings.allergies,
            },
        )

        return {"settings": settings_data}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
