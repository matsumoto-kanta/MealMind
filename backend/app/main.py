"""
FastAPI アプリケーションのメインエントリーポイント
"""

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
import yaml
from pathlib import Path
from sqlalchemy.orm import Session

from app.routers import auth, settings, budget, meals, history
from app.core.database import get_db

app = FastAPI(
    title="MealMind API",
    description="予算と体型から逆算して、今日の食事を決めてくれる AI 栄養士",
    version="0.1.0",
)

# CORS設定
from app.core.config import settings as config_settings

origins = [
    "http://localhost:3000",  # Next.js開発サーバー
    "http://localhost:8000",
    config_settings.FRONTEND_URL,  # 本番環境のフロントエンドURL
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# セッション管理ミドルウェア（CSRF対策用）
app.add_middleware(
    SessionMiddleware,
    secret_key=config_settings.SESSION_SECRET_KEY,
    session_cookie="session",
    max_age=1800,  # 30分
    same_site="lax",
    https_only=True,  # 本番環境ではHTTPSのみ
)


# openapi.yaml から OpenAPI スキーマを読み込む
def custom_openapi():
    # キャッシュをクリアして、常に YAML から読み込む
    # openapi.yaml のパスを取得（/workspace/backend/openapi.yaml）
    openapi_path = Path("/workspace/backend/openapi.yaml")

    try:
        # YAML ファイルを読み込む
        with open(openapi_path, "r", encoding="utf-8") as f:
            openapi_schema = yaml.safe_load(f)

        print(f"✓ OpenAPI schema loaded from {openapi_path}")
        print(f"✓ Paths found: {list(openapi_schema.get('paths', {}).keys())}")

        app.openapi_schema = openapi_schema
        return app.openapi_schema
    except Exception as e:
        print(f"✗ Error loading OpenAPI schema: {e}")
        # エラーの場合はデフォルトのスキーマを生成
        from fastapi.openapi.utils import get_openapi

        return get_openapi(
            title=app.title,
            version=app.version,
            description=app.description,
            routes=app.routes,
        )


app.openapi = custom_openapi

# ルーター登録
app.include_router(auth.router)
app.include_router(settings.router)
app.include_router(budget.router)
app.include_router(meals.router)
app.include_router(history.router)


@app.on_event("startup")
async def startup_event():
    """
    アプリケーション起動時の処理
    """
    print("=" * 50)
    print("Starting MealMind API...")
    print(f"app.openapi function: {app.openapi}")
    print(f"custom_openapi function: {custom_openapi}")
    print("=" * 50)


@app.get("/")
async def root():
    """
    ヘルスチェックエンドポイント
    """
    return {
        "message": "MealMind API is running",
        "version": "0.1.0",
        "status": "healthy",
    }


@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """
    詳細なヘルスチェック（データベース接続確認含む）
    """
    db_status = "disconnected"
    try:
        # データベース接続確認（簡単なクエリを実行）
        db.execute("SELECT 1")
        db_status = "connected"
    except Exception:
        db_status = "disconnected"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": db_status,
    }
