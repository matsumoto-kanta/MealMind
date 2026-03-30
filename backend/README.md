# MealMind Backend

予算と体型から逆算して、今日の食事を決めてくれる AI 栄養士のバックエンドAPI

## 技術スタック

- **Python 3.11+**
- **FastAPI** - Web フレームワーク
- **SQLAlchemy** - ORM
- **Cloud SQL (PostgreSQL)** - データベース (Google Cloud)
- **Google OAuth 2.0** - 認証
- **OpenAI API** - AI献立生成
- **Cloud Run** - コンテナホスティング (Google Cloud)
- **Cloud Storage** - ファイルストレージ (オプション)

## 開発環境セットアップ

### 前提条件

- **Rancher Desktop** がインストール済み
- **PostgreSQL** がローカルで起動している (またはCloud SQL Proxyを使用)

### セットアップ方法

#### 方法1: ローカルPython環境で開発

```bash
# 1. Pythonの仮想環境を作成
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2. 依存関係をインストール
pip install -r requirements.txt

# 3. 環境変数を設定
cp .env.example .env
# .env ファイルを編集して必要な設定を入力

# 4. PostgreSQLが起動していることを確認
# brew services list | grep postgresql

# 5. 【初回のみ】データベースを作成（docker-composeを使わない場合）
createdb -U postgres mealmind

# 6. 【初回のみ】データベースのマイグレーション
alembic upgrade head

# 7. 開発サーバーを起動
uvicorn app.main:app --reload --port 8000
```

#### 方法2: Rancher Desktopでコンテナ開発 (ローカルDB)

```bash
# 1. 環境変数を設定
cp .env.example .env
# .env ファイルを編集

# 2. docker-compose を使用してコンテナを起動 (推奨)
docker-compose up -d

# 3. 【初回のみ】データベースのマイグレーションを実行
docker-compose exec backend alembic upgrade head

# 4. ログを確認
docker-compose logs -f backend

# 5. 停止
docker-compose down

# データベース管理ツール (pgAdmin) も起動する場合
docker-compose --profile tools up -d
# pgAdmin: http://localhost:5050 (admin@mealmind.local / admin)
```

**⚠️ 重要: 初回セットアップ時の注意点**
- `alembic upgrade head` は**初回のみ**実行が必要です
- データベースのデータは `postgres_data` ボリュームで永続化されるため、2回目以降のコンテナ起動時は不要です
- ただし、以下の場合は再実行が必要です：
  - `docker-compose down -v` でボリュームを削除した場合
  - 新しいマイグレーションファイルが追加された場合

#### 方法3: Cloud SQLに接続して開発 (本番環境と同じDB)

```bash
# 1. Google Cloud認証
gcloud auth application-default login

# 2. 環境変数を設定
cp .env.example .env
# .env ファイルで以下を設定:
# CLOUD_SQL_CONNECTION_NAME=your-project:region:instance-name
# DB_USER=your-db-user
# DB_PASSWORD=your-db-password
# DB_NAME=mealmind

# 3. Cloud SQL Proxy経由で起動
docker-compose -f docker-compose.cloudsql.yml up -d

# 4. ログを確認
docker-compose -f docker-compose.cloudsql.yml logs -f backend

# 5. 停止
docker-compose -f docker-compose.cloudsql.yml down
```

**構成の比較:**

| 項目 | ローカルDB | Cloud SQL |
|------|-----------|-----------|
| 構成ファイル | `docker-compose.yml` | `docker-compose.cloudsql.yml` |
| データベース | ローカルPostgreSQL | Google Cloud SQL |
| セットアップ | `docker-compose up -d` | `gcloud auth` + `docker-compose -f docker-compose.cloudsql.yml up -d` |
| インターネット | 不要 | 必要 |
| データ共有 | ❌ | ✅ チームで共有可能 |
| 本番環境一致 | ❌ | ✅ 完全一致 |
| 料金 | 無料 | GCP課金 |
| おすすめ | 個人開発・オフライン作業 | チーム開発・本番データ確認 |

### 🎯 どちらを選ぶ?

**個人開発・学習目的の場合:**
→ **ローカルPostgreSQLのみでOK**
- `docker-compose.yml` だけ使う
- `docker-compose.cloudsql.yml` は削除してもOK

**本格的な開発・チーム開発の場合:**
→ **両方残して使い分ける**
- 普段の開発: ローカルPostgreSQL
- 本番データ確認: Cloud SQL
- CI/CD: Cloud SQL

**Cloud SQLのみ使う場合:**
→ **ローカルPostgreSQLは不要**
- `docker-compose.simple.yml` を使用 (最小構成)
- または不要なファイルを削除:
  ```bash
  rm docker-compose.yml  # ローカルPostgreSQL構成を削除
  mv docker-compose.cloudsql.yml docker-compose.yml  # Cloud SQL構成をメインに
  ```

### 📁 Docker Compose ファイル一覧

| ファイル名 | 用途 | データベース |
|-----------|------|-------------|
| `docker-compose.yml` | ローカル開発(推奨) | PostgreSQLコンテナ + pgAdmin |
| `docker-compose.cloudsql.yml` | Cloud SQL接続 | Cloud SQL Proxy → GCP |
| `docker-compose.simple.yml` | Cloud SQLのみ(最小構成) | Cloud SQL Proxy → GCP |

**初めての方は `docker-compose.yml` から始めるのがおすすめです!**

### Rancher Desktop の設定

Rancher Desktopの設定で以下を確認:
- **Container Runtime**: `dockerd (moby)` または `containerd`
- **Kubernetes**: 有効 (オプション)
- **Port Forwarding**: 有効

### コンテナの動作確認

```bash
# APIの動作確認
curl http://localhost:8000/docs

# Swagger UIでAPIドキュメントを確認
open http://localhost:8000/docs

# データベース接続確認
docker-compose exec backend alembic upgrade head
```

### 📊 ローカル開発環境の構成

**ローカルDB構成 (`docker-compose.yml`)**
```
┌─────────────────────────────────────┐
│     Rancher Desktop                 │
│                                     │
│  ┌──────────────┐  ┌────────────┐  │
│  │   Backend    │  │ PostgreSQL │  │
│  │ (FastAPI)    │──│  (Local)   │  │
│  │ :8000→8080   │  │   :5432    │  │
│  └──────────────┘  └────────────┘  │
│         │                           │
│  ┌──────────────┐                  │
│  │   pgAdmin    │                  │
│  │    :5050     │                  │
│  └──────────────┘                  │
└─────────────────────────────────────┘
```

**Cloud SQL構成 (`docker-compose.cloudsql.yml`)**
```
┌─────────────────────────────────────┐
│     Rancher Desktop                 │
│                                     │
│  ┌──────────────┐  ┌──────────────┐ │
│  │   Backend    │  │  Cloud SQL   │ │
│  │ (FastAPI)    │──│    Proxy     │─┼───┐
│  │ :8000→8080   │  │    :5432     │ │   │
│  └──────────────┘  └──────────────┘ │   │
└─────────────────────────────────────┘   │
                                          │
                                          ▼
                                    ┌────────────┐
                                    │ Cloud SQL  │
                                    │   (GCP)    │
                                    └────────────┘
```

### 開発時のヒント

**docker-compose使用時のホットリロード:**
- `app/`ディレクトリがコンテナにマウントされているため、ファイル変更が自動で反映されます
- `--reload`フラグでuvicornが自動リロードします

**データベースのリセット:**
```bash
# コンテナとボリュームを削除して再構築
docker-compose down -v
docker-compose up -d
```

**マイグレーション:**
```bash
# 新しいマイグレーションを作成
docker-compose exec backend alembic revision --autogenerate -m "migration message"

# マイグレーションを適用
docker-compose exec backend alembic upgrade head
```

## API仕様

API仕様は `openapi.yaml` を参照してください。

Swagger UIでドキュメントを確認:
- http://localhost:8000/docs

ReDocでドキュメントを確認:
- http://localhost:8000/redoc

## アーキテクチャ

このプロジェクトは **レイヤードアーキテクチャ** を採用しています:

```
Router (API層)
  ↓
Service (ビジネスロジック層)
  ↓
CRUD (データアクセス層)
  ↓
Models (データベース層)
```

### 各層の役割

- **models/** - SQLAlchemyモデル。DBテーブルの定義
- **schemas/** - Pydanticスキーマ。API リクエスト/レスポンスの型定義 + **基本的なバリデーション**
- **crud/** - CRUD操作。データベースへの基本的な読み書き
- **services/** - ビジネスロジック。複雑な処理やAI連携 + **ビジネスルールのバリデーション**
- **routers/** - APIエンドポイント。HTTPリクエストを受け取り、レスポンスを返す

### バリデーションの配置

1. **schemas/ (Pydantic)** - 基本的なバリデーション
   - 型チェック、必須フィールド、文字列の長さ、数値の範囲
   - `@field_validator` でカスタムバリデーション
   ```python
   # 例: schemas/settings.py
   class ProfileData(BaseModel):
       age: int = Field(..., ge=1, le=150)  # 1〜150の範囲

       @field_validator('weight')
       def validate_weight(cls, v):
           if v < 20 or v > 300:
               raise ValueError('体重は20〜300kgの範囲で入力してください')
           return v
   ```

2. **services/** - ビジネスロジックのバリデーション
   - 複数モデル間の整合性チェック
   - 権限チェック、データの存在チェック
   ```python
   # 例: services/meal_service.py
   async def confirm_meal(meal_id: str, user_id: str):
       # 献立が存在するか、ユーザーのものか検証
       meal = await crud_meal.get_by_id(meal_id)
       if not meal or meal.user_id != user_id:
           raise HTTPException(404, "献立が見つかりません")
       # ビジネスロジックを実行
   ```

3. **utils/validators.py** (オプション) - 再利用可能なバリデーション関数
   - 共通のバリデーションロジック
   ```python
   # 例: utils/validators.py
   def validate_budget(value: int) -> int:
       if value < 0:
           raise ValueError("予算は0以上である必要があります")
       if value > 10000000:
           raise ValueError("予算が大きすぎます")
       return value

   def validate_meal_type(meal_type: str) -> str:
       allowed = ["breakfast", "lunch", "dinner"]
       if meal_type not in allowed:
           raise ValueError(f"meal_typeは {allowed} のいずれかである必要があります")
       return meal_type
   ```

### バリデーションの使い分け

| 種類 | 配置場所 | 例 |
|------|----------|-----|
| 型・範囲チェック | `schemas/` | 年齢は1〜150、体重は20〜300 |
| フォーマット検証 | `schemas/` | メールアドレス、日付形式 |
| 必須チェック | `schemas/` | 必須フィールドの検証 |
| ビジネスルール | `services/` | 予算超過チェック、権限チェック |
| DB整合性 | `services/` | ユーザーの献立かどうか |
| 共通ロジック | `utils/validators.py` | 複数箇所で使う検証ロジック |

## ディレクトリ構造

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPIアプリケーションのエントリーポイント
│   ├── config.py            # 設定管理
│   ├── database.py          # データベース接続
│   ├── dependencies.py      # 依存性注入
│   │
│   ├── models/              # SQLAlchemyモデル (DBテーブル定義)
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── meal.py
│   │   ├── budget.py
│   │   └── settings.py
│   │
│   ├── schemas/             # Pydanticスキーマ (リクエスト/レスポンス)
│   │   ├── __init__.py
│   │   ├── meal.py
│   │   ├── budget.py
│   │   └── settings.py
│   │
│   ├── crud/                # CRUD操作 (データベースアクセス層)
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── meal.py
│   │   ├── budget.py
│   │   └── settings.py
│   │
│   ├── routers/             # APIルーター (エンドポイント定義)
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── meals.py
│   │   ├── history.py
│   │   ├── budget.py
│   │   └── settings.py
│   │
│   ├── services/            # ビジネスロジック (複雑な処理)
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── meal_service.py
│   │   ├── ai_service.py    # AI献立生成
│   │   └── nutrition_service.py
│   │
│   └── utils/               # ユーティリティ
│       ├── __init__.py
│       ├── security.py      # 認証・セキュリティ関連
│       ├── validators.py    # 共通バリデーション関数
│       └── exceptions.py    # カスタム例外
│
├── alembic/                 # データベースマイグレーション
├── tests/                   # テスト
├── openapi.yaml             # OpenAPI仕様
├── requirements.txt         # 依存関係
├── .env.example             # 環境変数のサンプル
└── README.md
```

## 環境変数

`.env` ファイルに以下の環境変数を設定してください:

```env
# 環境
ENVIRONMENT=development  # development, production

# データベース (ローカル開発用)
DATABASE_URL=postgresql://user:password@localhost:5432/mealmind

# データベース (Cloud SQL接続用 - 本番環境)
# Cloud SQL Proxyを使う場合
CLOUD_SQL_CONNECTION_NAME=your-project:region:instance-name
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=mealmind

# Google Cloud Platform
GCP_PROJECT_ID=your-gcp-project-id

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/callback

# JWT
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=30

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# CORS
FRONTEND_URL=http://localhost:3000

# Cloud Storage (オプション)
GCS_BUCKET_NAME=your-bucket-name
```

## API エンドポイント

### 認証
- `POST /logout` - ログアウト

### 献立
- `GET /meals` - 今日の献立取得
- `POST /meals/generate` - 献立生成
- `POST /meals/{id}/regenerate` - 献立再生成
- `PUT /meals/{id}/confirm` - 献立確定

### 履歴
- `POST /history` - 履歴取得

### 予算
- `GET /monthlyBudget` - 月間予算取得
- `PUT /monthlyBudget` - 月間予算更新

### 設定
- `GET /settings` - 設定取得
- `PUT /settings/profile` - プロフィール更新
- `PUT /settings/goal` - 目標更新
- `PUT /settings/preference` - 食の好み・アレルギー更新

## データベーススキーマ

### users テーブル
- id: UUID (PK)
- google_id: String (Unique)
- email: String (Unique)
- name: String
- created_at: DateTime
- updated_at: DateTime

### user_settings テーブル
- id: UUID (PK)
- user_id: UUID (FK)
- gender: Enum (male, female, other)
- age: Integer
- height: Integer
- weight: Integer
- activity_level: Enum (low, medium, high)
- target_weight: Integer
- disliked_foods: JSON
- allergies: JSON
- created_at: DateTime
- updated_at: DateTime

### meals テーブル
- id: UUID (PK)
- user_id: UUID (FK)
- date: Date
- meal_type: Enum (breakfast, lunch, dinner)
- name: String
- kcal: Integer
- protein: Integer
- fat: Integer
- carbohydrates: Integer
- cost: Integer
- status: Enum (draft, confirmed)
- ingredients: JSON
- created_at: DateTime
- updated_at: DateTime

### budgets テーブル
- id: UUID (PK)
- user_id: UUID (FK)
- year_month: String (YYYY-MM)
- budget: Integer
- spent: Integer
- created_at: DateTime
- updated_at: DateTime

## AI献立生成ロジック

OpenAI APIを使用して献立を生成します。

### プロンプト例

```
あなたは栄養士です。以下の条件で献立を提案してください。

【ユーザー情報】
- 性別: 男性
- 年齢: 28歳
- 身長: 172cm
- 体重: 68kg
- 目標体重: 63kg
- 活動量: 中程度
- 嫌いな食べ物: パクチー、セロリ
- アレルギー: えび、かに

【制約条件】
- 1日の食費: 920円以内
- 朝食: 300kcal前後
- 昼食: 450kcal前後
- 夕食: 400kcal前後

【出力形式】
JSON形式で、料理名、カロリー、PFC、コスト、食材リストを出力してください。
```

## テスト

```bash
# すべてのテストを実行
pytest

# カバレッジレポートを生成
pytest --cov=app --cov-report=html
```

## Google Cloud Platform セットアップ

### 1. Cloud SQL インスタンスの作成

```bash
# Cloud SQLインスタンスを作成
gcloud sql instances create mealmind-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=asia-northeast1

# データベースを作成
gcloud sql databases create mealmind --instance=mealmind-db

# ユーザーを作成
gcloud sql users create dbuser \
  --instance=mealmind-db \
  --password=your-password
```

### 2. Cloud SQL Proxy (ローカル開発用)

```bash
# Cloud SQL Proxyをダウンロード
curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.8.0/cloud-sql-proxy.darwin.amd64
chmod +x cloud-sql-proxy

# Proxyを起動
./cloud-sql-proxy --port 5432 your-project:asia-northeast1:mealmind-db
```

### 3. Cloud Run へのデプロイ

```bash
# Dockerイメージをビルド
docker build -t gcr.io/your-project-id/mealmind-backend .

# イメージをプッシュ
docker push gcr.io/your-project-id/mealmind-backend

# Cloud Runにデプロイ
gcloud run deploy mealmind-backend \
  --image gcr.io/your-project-id/mealmind-backend \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --add-cloudsql-instances your-project:asia-northeast1:mealmind-db \
  --set-env-vars "ENVIRONMENT=production" \
  --set-env-vars "CLOUD_SQL_CONNECTION_NAME=your-project:asia-northeast1:mealmind-db"
```

### 4. Secret Manager で環境変数を管理

```bash
# シークレットを作成
echo -n "your-openai-api-key" | gcloud secrets create openai-api-key --data-file=-
echo -n "your-secret-key" | gcloud secrets create jwt-secret-key --data-file=-

# Cloud Runにシークレットをマウント
gcloud run services update mealmind-backend \
  --update-secrets OPENAI_API_KEY=openai-api-key:latest \
  --update-secrets SECRET_KEY=jwt-secret-key:latest
```

## デプロイ構成図

```
┌─────────────────┐
│   Frontend      │
│  (Cloud Run)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│   Backend       │─────▶│  Cloud SQL   │
│  (Cloud Run)    │      │ (PostgreSQL) │
└────────┬────────┘      └──────────────┘
         │
         ├─────▶ Google OAuth 2.0
         │
         └─────▶ OpenAI API
```

## ライセンス

(ライセンス情報)
