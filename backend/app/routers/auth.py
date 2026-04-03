from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse, JSONResponse
from sqlalchemy.orm import Session
import secrets

from app.core.database import get_db
from app.core.security import create_access_token
from app.core.config import settings
from app.services.google_auth import google_auth_service
from app.services.user_service import get_or_create_user, get_user_by_id
from app.schemas.user import UserResponse
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/google")
async def google_login(request: Request):
    """
    Google OAuth認証を開始します。
    Googleのログインページにリダイレクトします。
    """
    # CSRF対策: stateパラメータを生成してセッションに保存
    state = secrets.token_urlsafe(32)
    request.session["oauth_state"] = state

    authorization_url = google_auth_service.get_authorization_url(state=state)
    return RedirectResponse(url=authorization_url)


@router.get("/google/callback")
async def google_callback(
    code: str,
    state: str,
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Google OAuth認証のコールバックエンドポイント。
    認証コードを検証し、ユーザーを作成/取得してJWTトークンを発行します。
    """
    try:
        # CSRF対策: stateパラメータを検証
        saved_state = request.session.get("oauth_state")
        if not saved_state or saved_state != state:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid state parameter. Possible CSRF attack.",
            )

        # セッションからstateを削除（一度きりの使用）
        request.session.pop("oauth_state", None)
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

        # フロントエンドにリダイレクト（トークンはHTTP-only Cookieで設定）
        response = RedirectResponse(
            url=f"{settings.FRONTEND_URL}/main",
            status_code=status.HTTP_302_FOUND,
        )

        # HTTP-only、Secure、SameSite属性付きのCookieでトークンを設定
        response.set_cookie(
            key="accessToken",
            value=access_token,
            httponly=True,  # JavaScriptからアクセス不可（XSS対策）
            secure=True,  # HTTPS通信のみ（本番環境）
            samesite="lax",  # CSRF対策
            max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # 秒単位
            path="/",
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
