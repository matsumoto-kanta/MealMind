from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID

from app.models.user_settings import UserSettings
from app.schemas.settings import ProfileData, GoalData, PreferenceData


def get_user_settings(db: Session, user_id: UUID) -> Optional[UserSettings]:
    """
    ユーザー設定を取得

    Args:
        db: データベースセッション
        user_id: ユーザーID

    Returns:
        UserSettingsモデルのインスタンス、または存在しない場合はNone
    """
    return db.query(UserSettings).filter(UserSettings.user_id == user_id).first()


def create_default_settings(db: Session, user_id: UUID) -> UserSettings:
    """
    デフォルト設定を作成（新規ユーザー向け）

    Args:
        db: データベースセッション
        user_id: ユーザーID

    Returns:
        作成されたUserSettingsモデルのインスタンス
    """
    settings = UserSettings(
        user_id=user_id,
        gender="other",
        age=25,
        height=170,
        weight=60,
        activity_level="medium",
        target_weight=60,
        disliked_foods=[],
        allergies=[],
    )
    db.add(settings)
    db.commit()
    db.refresh(settings)
    return settings


def update_profile(db: Session, user_id: UUID, profile: ProfileData) -> UserSettings:
    """
    プロフィール更新

    Args:
        db: データベースセッション
        user_id: ユーザーID
        profile: 更新するプロフィールデータ

    Returns:
        更新されたUserSettingsモデルのインスタンス
    """
    settings = get_user_settings(db, user_id)
    if not settings:
        settings = create_default_settings(db, user_id)

    settings.gender = profile.gender
    settings.age = profile.age
    settings.height = profile.height
    settings.weight = profile.weight
    settings.activity_level = profile.activity_level

    db.commit()
    db.refresh(settings)
    return settings


def update_goal(db: Session, user_id: UUID, goal: GoalData) -> UserSettings:
    """
    目標更新

    Args:
        db: データベースセッション
        user_id: ユーザーID
        goal: 更新する目標データ

    Returns:
        更新されたUserSettingsモデルのインスタンス
    """
    settings = get_user_settings(db, user_id)
    if not settings:
        settings = create_default_settings(db, user_id)

    settings.target_weight = goal.target_weight

    db.commit()
    db.refresh(settings)
    return settings


def update_preference(
    db: Session, user_id: UUID, preference: PreferenceData
) -> UserSettings:
    """
    食の好み・アレルギー更新

    Args:
        db: データベースセッション
        user_id: ユーザーID
        preference: 更新する好みデータ

    Returns:
        更新されたUserSettingsモデルのインスタンス
    """
    settings = get_user_settings(db, user_id)
    if not settings:
        settings = create_default_settings(db, user_id)

    settings.disliked_foods = preference.disliked_foods
    settings.allergies = preference.allergies

    db.commit()
    db.refresh(settings)
    return settings
