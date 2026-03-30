from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from uuid import UUID
from datetime import datetime


class UserResponse(BaseModel):
    """APIレスポンス用のユーザー情報スキーマ"""

    id: UUID
    email: EmailStr
    name: Optional[str] = None
    picture: Optional[str] = Field(None, description="プロフィール画像URL")

    class Config:
        from_attributes = True  # SQLAlchemyモデルからの変換を有効化
