from google.cloud import firestore
from typing import Optional, Dict, Any

from app.repositories import UserRepository


def get_or_create_user(
    db: firestore.Client,
    google_id: str,
    email: str,
    name: Optional[str] = None,
    picture: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Google IDでユーザーを取得するか、存在しない場合は新規作成します。

    Args:
        db: Firestoreクライアント
        google_id: GoogleユーザーID
        email: メールアドレス
        name: ユーザー名（オプション）
        picture: プロフィール画像URL（オプション）

    Returns:
        ユーザーデータ（辞書形式）
    """
    user_repo = UserRepository(db)

    # 既存ユーザーを検索
    user = user_repo.get_by_google_id(google_id)

    if user:
        # 既存ユーザーの情報を更新（名前や画像が変更されている可能性があるため）
        update_data = {
            'email': email,
            'name': name,
            'picture': picture,
        }
        user_repo.update(user['id'], update_data)
        # 更新後のデータを取得
        user = user_repo.get_by_id(user['id'])
    else:
        # 新規ユーザーを作成
        user_data = {
            'google_id': google_id,
            'email': email,
            'name': name,
            'picture': picture,
        }
        user_id = user_repo.create(user_data)
        user = user_repo.get_by_id(user_id)

    return user


def get_user_by_id(db: firestore.Client, user_id: str) -> Optional[Dict[str, Any]]:
    """
    ユーザーIDでユーザーを取得します。

    Args:
        db: Firestoreクライアント
        user_id: ユーザーID (UUID)

    Returns:
        ユーザーデータ（辞書形式）、または存在しない場合はNone
    """
    user_repo = UserRepository(db)
    return user_repo.get_by_id(user_id)
