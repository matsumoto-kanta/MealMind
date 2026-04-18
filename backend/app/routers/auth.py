from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse, JSONResponse
from google.cloud import firestore
import secrets
from jose import jwt, JWTError
from datetime import datetime, timedelta

from app.core.firestore import get_db
from app.core.security import create_access_token
from app.core.config import settings
from app.services.google_auth import google_auth_service
from app.services.user_service import get_or_create_user, get_user_by_id
from app.schemas.user import UserResponse
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


def create_state_token() -> str:
    """
    CSRF対策用のstateトークンを生成します（JWT署名付き）。
    セッションを使わず、トークン自体に署名を含めることで、
    Cloud Runの複数インスタンス間でも検証可能にします。
    """
    nonce = secrets.token_urlsafe(32)
    expires = datetime.utcnow() + timedelta(minutes=10)

    state_data = {
        "nonce": nonce,
        "exp": expires,
    }

    state_token = jwt.encode(state_data, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return state_token


def verify_state_token(state: str) -> bool:
    """
    stateトークンを検証します。
    """
    try:
        jwt.decode(state, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return True
    except JWTError:
        return False


@router.get("/google")
async def google_login(request: Request):
    """
    Google OAuth認証を開始します。
    Googleのログインページにリダイレクトします。
    """
    # CSRF対策: JWT署名付きstateトークンを生成
    state = create_state_token()

    authorization_url = google_auth_service.get_authorization_url(state=state)
    return RedirectResponse(url=authorization_url)


@router.get("/google/callback")
async def google_callback(
    code: str,
    state: str,
    request: Request,
    db: firestore.Client = Depends(get_db),
):
    """
    Google OAuth認証のコールバックエンドポイント。
    認証コードを検証し、ユーザーを作成/取得してJWTトークンを発行します。
    """
    try:
        # CSRF対策: stateトークンを検証
        if not verify_state_token(state):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid state parameter. Possible CSRF attack.",
            )
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
            data={"sub": str(user['id']), "email": user['email']}
        )

        # フロントエンドにリダイレクト（トークンをURLフラグメントで渡す）
        # URLフラグメント（#）を使用することで、トークンがサーバーログに記録されない
        response = RedirectResponse(
            url=f"{settings.FRONTEND_URL}/auth/callback?token={access_token}",
            status_code=status.HTTP_302_FOUND,
        )

        return response

    except ValueError as e:
        print(f"ValueError in OAuth callback: {str(e)}")
        # エラーの場合はフロントエンドのloginページにリダイレクト（エラー情報付き）
        error_url = f"{settings.FRONTEND_URL}/login?error=invalid_request&message={str(e)}"
        return RedirectResponse(url=error_url, status_code=status.HTTP_302_FOUND)
    except Exception as e:
        print(f"Exception in OAuth callback: {str(e)}")
        import traceback
        traceback.print_exc()
        # エラーの場合はフロントエンドのloginページにリダイレクト（エラー情報付き）
        error_url = f"{settings.FRONTEND_URL}/login?error=authentication_failed&message=An error occurred during authentication"
        return RedirectResponse(url=error_url, status_code=status.HTTP_302_FOUND)


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: dict = Depends(get_current_user),
    db: firestore.Client = Depends(get_db),
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
