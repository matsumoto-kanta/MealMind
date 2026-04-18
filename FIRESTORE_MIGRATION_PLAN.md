# Firestore移行計画

## 1. 準備

### 必要なパッケージ
```bash
# requirements.txtに追加
firebase-admin==6.5.0
```

### 削除するパッケージ
```bash
# 不要になるもの
sqlalchemy
alembic
psycopg2-binary
cloud-sql-python-connector
```

## 2. データモデルの再設計

### Users Collection
```
users/
  {user_id}/
    - google_id: string
    - email: string
    - name: string
    - picture: string
    - created_at: timestamp
    - updated_at: timestamp

    settings/  # サブコレクション
      default/
        - daily_kcal_target: number
        - daily_protein_target: number
        - ...

    monthly_budgets/  # サブコレクション
      {year_month}/
        - budget_amount: number
        - ...

    meals/  # サブコレクション
      {meal_id}/
        - meal_date: timestamp
        - meal_type: string
        - status: string
        - name: string
        - kcal: number
        - cost: number
        - ...
```

## 3. 移行ステップ

### Step 1: Firestore SDK のセットアップ
```python
# app/core/firestore.py
import firebase_admin
from firebase_admin import credentials, firestore
from app.core.config import settings

cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
firebase_admin.initialize_app(cred)
db = firestore.client()
```

### Step 2: リポジトリパターンの実装
```python
# app/repositories/user_repository.py
from google.cloud.firestore import Client

class UserRepository:
    def __init__(self, db: Client):
        self.db = db
        self.collection = db.collection('users')

    async def create_user(self, user_data: dict):
        doc_ref = self.collection.document()
        doc_ref.set(user_data)
        return doc_ref.id

    async def get_user_by_email(self, email: str):
        query = self.collection.where('email', '==', email).limit(1)
        docs = query.get()
        return docs[0].to_dict() if docs else None
```

### Step 3: データ移行スクリプト
```python
# scripts/migrate_to_firestore.py
import asyncio
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models import User, Meal, UserSettings, MonthlyBudget
from google.cloud import firestore

def migrate_data():
    db_sql = SessionLocal()
    db_firestore = firestore.Client()

    # Usersを移行
    users = db_sql.query(User).all()
    for user in users:
        user_ref = db_firestore.collection('users').document(str(user.id))
        user_ref.set({
            'google_id': user.google_id,
            'email': user.email,
            'name': user.name,
            'picture': user.picture,
            'created_at': user.created_at,
            'updated_at': user.updated_at,
        })

        # Settings を移行
        if user.settings:
            settings_ref = user_ref.collection('settings').document('default')
            settings_ref.set({
                'daily_kcal_target': user.settings.daily_kcal_target,
                # ... 他のフィールド
            })

        # Meals を移行
        for meal in user.meals:
            meal_ref = user_ref.collection('meals').document(meal.id)
            meal_ref.set({
                'meal_date': meal.meal_date,
                'meal_type': meal.meal_type,
                'status': meal.status,
                # ... 他のフィールド
            })

    db_sql.close()

if __name__ == "__main__":
    migrate_data()
```

### Step 4: API エンドポイントの書き換え
全てのエンドポイントでSQLAlchemy操作をFirestore操作に置き換え

### Step 5: テスト
- 全機能のテスト
- パフォーマンステスト
- データ整合性チェック

## 4. Cloud SQLの停止と削除

### 停止
```bash
gcloud sql instances patch mealmind-db --no-activation-policy
```

### 削除（バックアップ確認後）
```bash
# バックアップの作成
gcloud sql backups create --instance=mealmind-db

# インスタンスの削除
gcloud sql instances delete mealmind-db
```

## 5. 見積もり

### 作業時間
- データモデル再設計: 4-6時間
- リポジトリ層実装: 8-12時間
- API書き換え: 12-16時間
- データ移行スクリプト: 4-6時間
- テスト: 8-12時間
**合計: 36-52時間**

### 料金比較（月額概算）
- **Cloud SQL（db-f1-micro）**: $7-9
- **Firestore（小規模利用）**: $0-5（無料枠内で収まる可能性大）

## 注意事項
- リレーショナルDBの機能を失う
- 複雑なクエリが難しくなる
- ロールバックが困難（大規模な作業）
- テストが重要（データ整合性）
