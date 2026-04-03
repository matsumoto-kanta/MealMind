from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse, JSONResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import create_access_token
from app.core.config import settings
from app.services.google_auth import google_auth_service
from app.services.user_service import get_or_create_user, get_user_by_id
from app.schemas.user import UserResponse
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/google")
async def google_login():
    """
    Google OAuth認証を開始します。
    Googleのログインページにリダイレクトします。
    """
    # TODO: CSRF対策のためstateパラメータを実装
    authorization_url = google_auth_service.get_authorization_url()
    return RedirectResponse(url=authorization_url)


@router.get("/google/callback")
async def google_callback(
    code: str,
    db: Session = Depends(get_db),
):
    """
    Google OAuth認証のコールバックエンドポイント。
    認証コードを検証し、ユーザーを作成/取得してJWTトークンを発行します。
    """
    try:
        # 認証コードを検証してユーザー情報を取得
        user_info = google_auth_service.verify_oauth_token(code)

        # ユーザーを作成または取得
        user = get_or_create_user(
            db=db,
            google_id=user_info["google_id"],
            email=user_info["email"],
            name=user_info.get("name"),
            picture=user_info.get("picture"),
        )

        # JWTトークンを生成
        access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email}
        )

        # フロントエンドにリダイレクト（トークンをURLパラメータで渡す）
        # 異なるドメイン間ではCookieが共有できないため、URLパラメータを使用
        response = RedirectResponse(
            url=f"{settings.FRONTEND_URL}/main?token={access_token}",
            status_code=status.HTTP_302_FOUND,
        )

        return response

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication failed",
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    現在ログイン中のユーザー情報を取得します。
    JWTトークンが必要です。
    """
    user_id = current_user.get("sub")
    user = get_user_by_id(db, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return user


@router.post("/logout")
async def logout():
    """
    ログアウトします。
    Cookieからアクセストークンを削除します。
    """
    response = JSONResponse(
        content={"message": "Successfully logged out"},
        status_code=status.HTTP_200_OK,
    )

    # Cookieを削除
    response.delete_cookie(key="accessToken")

    return response
