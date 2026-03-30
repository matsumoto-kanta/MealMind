from sqlalchemy.orm import Session
from typing import Optional

from app.models.user import User


def get_or_create_user(
    db: Session,
    google_id: str,
    email: str,
    name: Optional[str] = None,
    picture: Optional[str] = None,
) -> User:
    """
    Google IDでユーザーを取得するか、存在しない場合は新規作成します。

    Args:
        db: データベースセッション
        google_id: GoogleユーザーID
        email: メールアドレス
        name: ユーザー名（オプション）
        picture: プロフィール画像URL（オプション）

    Returns:
        Userモデルのインスタンス
    """
    # 既存ユーザーを検索
    user = db.query(User).filter(User.google_id == google_id).first()

    if user:
        # 既存ユーザーの情報を更新（名前や画像が変更されている可能性があるため）
        user.email = email
        user.name = name
        user.picture = picture
        db.commit()
        db.refresh(user)
    else:
        # 新規ユーザーを作成
        user = User(
            google_id=google_id,
            email=email,
            name=name,
            picture=picture,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return user


def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    """
    ユーザーIDでユーザーを取得します。

    Args:
        db: データベースセッション
        user_id: ユーザーID (UUID)

    Returns:
        Userモデルのインスタンス、または存在しない場合はNone
    """
    return db.query(User).filter(User.id == user_id).first()
