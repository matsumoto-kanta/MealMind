from fastapi import APIRouter, Depends, HTTPException, status
from google.cloud import firestore

from app.core.firestore import get_db
from app.middleware.auth import get_current_user
from app.schemas.settings import (
    SettingsResponse,
    ProfileData,
    GoalData,
    PreferenceData,
    SettingsData,
)
from app.services import settings_service

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("", response_model=SettingsResponse)
def get_settings(
    current_user: dict = Depends(get_current_user),
    db: firestore.Client = Depends(get_db),
):
    """
    ユーザー設定��取得
    """
    user_id = current_user["sub"]
    settings = settings_service.get_user_settings(db, user_id)

    if not settings:
        # 設定が存在しない場合はデフォルト設定を作成
        settings = settings_service.create_default_settings(db, user_id)

    # Firestoreデ���タ（辞書）からSettingsDataに変換
    settings_data = SettingsData(
        profile={
            "gender": settings['gender'],
            "age": settings['age'],
            "height": settings['height'],
            "weight": settings['weight'],
            "activityLevel": settings['activity_level'],
        },
        goal={
            "targetWeight": settings['target_weight'],
            "targetPeriodMonths": settings['target_period_months'],
        },
        preference={
            "dislikedFoods": settings['disliked_foods'],
            "allergies": settings['allergies'],
        },
    )

    return {"settings": settings_data}


@router.put("/profile", response_model=SettingsResponse)
def update_profile(
    profile: ProfileData,
    current_user: dict = Depends(get_current_user),
    db: firestore.Client = Depends(get_db),
):
    """
    プロフィール更新
    """
    user_id = current_user["sub"]

    try:
        settings = settings_service.update_profile(db, user_id, profile)

        settings_data = SettingsData(
            profile={
                "gender": settings['gender'],
                "age": settings['age'],
                "height": settings['height'],
                "weight": settings['weight'],
                "activityLevel": settings['activity_level'],
            },
            goal={
                "targetWeight": settings['target_weight'],
                "targetPeriodMonths": settings['target_period_months'],
            },
            preference={
                "dislikedFoods": settings['disliked_foods'],
                "allergies": settings['allergies'],
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
    db: firestore.Client = Depends(get_db),
):
    """
    目標更新
    """
    user_id = current_user["sub"]

    try:
        settings = settings_service.update_goal(db, user_id, goal)

        settings_data = SettingsData(
            profile={
                "gender": settings['gender'],
                "age": settings['age'],
                "height": settings['height'],
                "weight": settings['weight'],
                "activityLevel": settings['activity_level'],
            },
            goal={
                "targetWeight": settings['target_weight'],
                "targetPeriodMonths": settings['target_period_months'],
            },
            preference={
                "dislikedFoods": settings['disliked_foods'],
                "allergies": settings['allergies'],
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
    db: firestore.Client = Depends(get_db),
):
    """
    食の好み・アレルギー更新
    """
    user_id = current_user["sub"]

    try:
        settings = settings_service.update_preference(db, user_id, preference)

        settings_data = SettingsData(
            profile={
                "gender": settings['gender'],
                "age": settings['age'],
                "height": settings['height'],
                "weight": settings['weight'],
                "activityLevel": settings['activity_level'],
            },
            goal={
                "targetWeight": settings['target_weight'],
                "targetPeriodMonths": settings['target_period_months'],
            },
            preference={
                "dislikedFoods": settings['disliked_foods'],
                "allergies": settings['allergies'],
            },
        )

        return {"settings": settings_data}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
