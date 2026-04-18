from google.cloud import firestore
from typing import Optional, Dict, Any

from app.repositories import UserSettingsRepository
from app.schemas.settings import ProfileData, GoalData, PreferenceData


def get_user_settings(db: firestore.Client, user_id: str) -> Optional[Dict[str, Any]]:
    """
    ユーザー設定を取得

    Args:
        db: Firestoreクライアント
        user_id: ユーザーID

    Returns:
        設定データ（辞書形式）、または存在しない場合はNone
    """
    settings_repo = UserSettingsRepository(db)
    return settings_repo.get(user_id)


def create_default_settings(db: firestore.Client, user_id: str) -> Dict[str, Any]:
    """
    デフォルト設定を作成（新規ユーザー向け）

    Args:
        db: Firestoreクライアント
        user_id: ユーザーID

    Returns:
        作成された設定データ（辞書形式）
    """
    settings_repo = UserSettingsRepository(db)

    settings_data = {
        'gender': 'male',
        'age': 0,
        'height': 0,
        'weight': 0,
        'activity_level': 'low',
        'target_weight': 0,
        'target_period_months': 0,
        'disliked_foods': [],
        'allergies': [],
    }

    settings_repo.create(user_id, settings_data)
    return settings_repo.get(user_id)


def update_profile(db: firestore.Client, user_id: str, profile: ProfileData) -> Dict[str, Any]:
    """
    プロフィール更新

    Args:
        db: Firestoreクライアント
        user_id: ユーザーID
        profile: 更新するプロフィールデータ

    Returns:
        更新された設定データ（辞書形式）
    """
    settings_repo = UserSettingsRepository(db)
    settings = get_user_settings(db, user_id)

    if not settings:
        settings = create_default_settings(db, user_id)

    update_data = {
        'gender': profile.gender,
        'age': profile.age,
        'height': profile.height,
        'weight': profile.weight,
        'activity_level': profile.activity_level,
    }

    settings_repo.update(user_id, update_data)
    return settings_repo.get(user_id)


def update_goal(db: firestore.Client, user_id: str, goal: GoalData) -> Dict[str, Any]:
    """
    目標更新

    Args:
        db: Firestoreクライアント
        user_id: ユーザーID
        goal: 更新する目標データ

    Returns:
        更新された設定データ（辞書形式）
    """
    settings_repo = UserSettingsRepository(db)
    settings = get_user_settings(db, user_id)

    if not settings:
        settings = create_default_settings(db, user_id)

    update_data = {
        'target_weight': goal.target_weight,
        'target_period_months': goal.target_period_months,
    }

    settings_repo.update(user_id, update_data)
    return settings_repo.get(user_id)


def update_preference(
    db: firestore.Client, user_id: str, preference: PreferenceData
) -> Dict[str, Any]:
    """
    食の好み・アレルギー更新

    Args:
        db: Firestoreクライアント
        user_id: ユーザーID
        preference: 更新する好みデータ

    Returns:
        更新された設定データ（辞書形式）
    """
    settings_repo = UserSettingsRepository(db)
    settings = get_user_settings(db, user_id)

    if not settings:
        settings = create_default_settings(db, user_id)

    update_data = {
        'disliked_foods': preference.disliked_foods,
        'allergies': preference.allergies,
    }

    settings_repo.update(user_id, update_data)
    return settings_repo.get(user_id)
