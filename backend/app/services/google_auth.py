from typing import Dict
from google_auth_oauthlib.flow import Flow
from google.auth.transport import requests
from google.oauth2 import id_token

from app.core.config import settings


class GoogleAuthService:
    """Google OAuth 2.0認証サービス"""

    def __init__(self):
        self.client_config = {
            "web": {
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [settings.GOOGLE_REDIRECT_URI],
            }
        }
        self.scopes = [
            "openid",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
        ]

    def get_authorization_url(self, state: str = None) -> str:
        """
        Google OAuth認証URLを生成します。

        Args:
            state: CSRFトークン（オプション）

        Returns:
            Google認証ページのURL
        """
        flow = Flow.from_client_config(
            client_config=self.client_config,
            scopes=self.scopes,
            redirect_uri=settings.GOOGLE_REDIRECT_URI,
        )

        authorization_url, _ = flow.authorization_url(
            access_type="offline",
            include_granted_scopes="true",
            state=state,
        )

        return authorization_url

    def verify_oauth_token(self, code: str) -> Dict[str, str]:
        """
        OAuth認証コードを検証し、ユーザー情報を取得します。

        Args:
            code: Googleから返された認証コード

        Returns:
            ユーザー情報の辞書 (google_id, email, name, picture)

        Raises:
            ValueError: トークン検証に失敗した場合
        """
        try:
            # 認証コードをトークンに交換
            flow = Flow.from_client_config(
                client_config=self.client_config,
                scopes=self.scopes,
                redirect_uri=settings.GOOGLE_REDIRECT_URI,
            )
            flow.fetch_token(code=code)

            # IDトークンを検証
            credentials = flow.credentials
            id_info = id_token.verify_oauth2_token(
                credentials.id_token,
                requests.Request(),
                settings.GOOGLE_CLIENT_ID,
            )

            # ユーザー情報を抽出
            user_info = {
                "google_id": id_info.get("sub"),
                "email": id_info.get("email"),
                "name": id_info.get("name"),
                "picture": id_info.get("picture"),
            }

            return user_info

        except Exception as e:
            raise ValueError(f"Failed to verify OAuth token: {str(e)}")


# シングルトンインスタンス
google_auth_service = GoogleAuthService()
