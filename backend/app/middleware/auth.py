from fastapi import Request, HTTPException, status, Depends
from jose import JWTError
from typing import Dict, Any

from app.core.security import decode_access_token


async def get_current_user(request: Request) -> Dict[str, Any]:
    """
    リクエストのCookieまたはAuthorizationヘッダーからJWTトークンを取得し、ユーザー情報を返します。

    Args:
        request: FastAPIのRequestオブジェクト

    Returns:
        デコードされたユーザー情報の辞書

    Raises:
        HTTPException: トークンが無効または存在しない場合
    """
    # Cookieからアクセストークンを取得
    access_token = request.cookies.get("accessToken")

    # Cookieにない場合、Authorizationヘッダーから取得
    if not access_token:
        authorization = request.headers.get("Authorization")
        if authorization and authorization.startswith("Bearer "):
            access_token = authorization.replace("Bearer ", "")

    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        # トークンをデコード
        payload = decode_access_token(access_token)

        # ユーザーIDが含まれているか確認
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
            )

        return payload

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )
