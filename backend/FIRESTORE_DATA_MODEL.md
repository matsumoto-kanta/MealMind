# Firestore データモデル設計

## 概要

SQLAlchemyのリレーショナルモデルからFirestoreのドキュメント指向モデルへの変換設計。

## コレクション構造

```
users (collection)
  └─ {user_id} (document)
      ├─ settings (subcollection)
      │   └─ default (document)
      ├─ monthly_budgets (subcollection)
      │   └─ {year_month} (document)
      └─ meals (subcollection)
          └─ {meal_id} (document)
```

## 詳細スキーマ

### 1. users コレクション

**Document ID**: `{user_id}` (UUID)

**フィールド**:
```json
{
  "google_id": "string",           // unique, indexed
  "email": "string",                // unique, indexed
  "name": "string",                 // nullable
  "picture": "string",              // nullable (profile picture URL)
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

**インデックス**:
- `google_id` (ASC)
- `email` (ASC)

**SQL → Firestore マッピング**:
- テーブル: `users`
- リレーション: settings (1対1), monthly_budgets (1対多), meals (1対多)
- 外部キー制約 → サブコレクションで表現

---

### 2. users/{user_id}/settings サブコレクション

**Document ID**: `default` (固定)

**フィールド**:
```json
{
  // Profile
  "gender": "string",               // enum: "male", "female", "other"
  "age": "number",                  // integer
  "height": "number",               // integer (cm)
  "weight": "number",               // integer (kg)
  "activity_level": "string",       // enum: "low", "medium", "high"

  // Goal
  "target_weight": "number",        // integer (kg)
  "target_period_months": "number", // integer (months)

  // Preferences
  "disliked_foods": ["string"],     // array of strings
  "allergies": ["string"],          // array of strings

  // Timestamps
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

**SQL → Firestore マッピング**:
- テーブル: `user_settings`
- リレーション: user (多対1) → サブコレクションで親を暗黙的に参照
- Unique制約 (`user_id`) → ドキュメントIDを"default"固定で実現

---

### 3. users/{user_id}/monthly_budgets サブコレクション

**Document ID**: `{year_month}` (例: "2026-04")

**フィールド**:
```json
{
  "monthly_budget": "number",       // integer (月間予算額)
  "spent": "number",                // integer (使用金額)
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

**インデックス**:
- なし（ドキュメントIDでソート可能）

**SQL → Firestore マッピング**:
- テーブル: `monthly_budgets`
- リレーション: user (多対1) → サブコレクションで親を暗黙的に参照
- Unique制約 (`user_id`, `year_month`) → ドキュメントIDを`year_month`で実現

---

### 4. users/{user_id}/meals サブコレクション

**Document ID**: `{meal_id}` (UUID)

**フィールド**:
```json
{
  "meal_date": "timestamp",         // Date型 → Timestamp変換
  "meal_type": "string",            // enum: "breakfast", "lunch", "dinner"
  "status": "string",               // enum: "draft", "confirmed"
  "name": "string",
  "kcal": "number",                 // integer
  "cost": "number",                 // integer
  "protein": "number",              // integer
  "fat": "number",                  // integer
  "carbohydrates": "number",        // integer
  "ingredients": [                  // array of objects (JSON)
    {
      "name": "string",
      "quantity": "string",
      "unit": "string"
    }
  ],
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

**インデックス**:
- `meal_date` (ASC)
- `meal_type` (ASC)
- 複合インデックス: `meal_date` (ASC) + `meal_type` (ASC)

**SQL → Firestore マッピング**:
- テーブル: `meals`
- リレーション: user (多対1) → サブコレクションで親を暗黙的に参照
- Unique制約 (`user_id`, `meal_date`, `meal_type`) → クエリ時にアプリケーション層でチェック

---

## データ型の変換

| SQLAlchemy | PostgreSQL | Firestore |
|------------|-----------|-----------|
| UUID | UUID | String (str(uuid)) |
| String | VARCHAR | String |
| Integer | INTEGER | Number |
| ARRAY(String) | TEXT[] | Array |
| JSON | JSONB | Map/Array |
| Date | DATE | Timestamp (00:00:00) |
| DateTime | TIMESTAMP | Timestamp |
| Enum | ENUM | String |

---

## クエリパターン

### ユーザー取得（メールアドレスで検索）
```python
# SQL (旧)
SELECT * FROM users WHERE email = 'user@example.com';

# Firestore (新)
users_ref = db.collection('users')
query = users_ref.where('email', '==', 'user@example.com').limit(1)
docs = query.get()
```

### 特定月の予算取得
```python
# SQL (旧)
SELECT * FROM monthly_budgets
WHERE user_id = '...' AND year_month = '2026-04';

# Firestore (新)
doc_ref = db.collection('users').document(user_id) \
           .collection('monthly_budgets').document('2026-04')
doc = doc_ref.get()
```

### 食事一覧取得（日付範囲）
```python
# SQL (旧)
SELECT * FROM meals
WHERE user_id = '...'
  AND meal_date >= '2026-04-01'
  AND meal_date <= '2026-04-30'
ORDER BY meal_date, meal_type;

# Firestore (新)
from datetime import datetime
start = datetime(2026, 4, 1)
end = datetime(2026, 4, 30, 23, 59, 59)

meals_ref = db.collection('users').document(user_id).collection('meals')
query = meals_ref.where('meal_date', '>=', start) \
                 .where('meal_date', '<=', end) \
                 .order_by('meal_date') \
                 .order_by('meal_type')
docs = query.get()
```

### 特定日・特定タイプの食事取得（Unique制約チェック）
```python
# SQL (旧)
SELECT * FROM meals
WHERE user_id = '...'
  AND meal_date = '2026-04-18'
  AND meal_type = 'lunch';

# Firestore (新)
from datetime import datetime
target_date = datetime(2026, 4, 18)

meals_ref = db.collection('users').document(user_id).collection('meals')
query = meals_ref.where('meal_date', '==', target_date) \
                 .where('meal_type', '==', 'lunch') \
                 .limit(1)
docs = query.get()
```

---

## 制約の実装

### 1. Unique制約

| モデル | SQL制約 | Firestore実装方法 |
|--------|---------|------------------|
| User | google_id, email | アプリケーション層でチェック + クエリ |
| UserSettings | user_id (1対1) | ドキュメントID固定 ("default") |
| MonthlyBudget | user_id + year_month | ドキュメントIDを year_month に設定 |
| Meal | user_id + meal_date + meal_type | アプリケーション層でチェック |

### 2. 外部キー制約（CASCADE DELETE）

- **SQL**: `ON DELETE CASCADE`
- **Firestore**: サブコレクションは親ドキュメント削除時に自動削除されない
- **実装**: アプリケーション層で親削除時にサブコレクションも削除
  ```python
  # ユーザー削除時
  def delete_user(user_id):
      user_ref = db.collection('users').document(user_id)

      # サブコレクションを削除
      delete_collection(user_ref.collection('settings'))
      delete_collection(user_ref.collection('monthly_budgets'))
      delete_collection(user_ref.collection('meals'))

      # ユーザードキュメントを削除
      user_ref.delete()
  ```

### 3. NOT NULL制約

- **SQL**: `nullable=False`
- **Firestore**: フィールドが存在しない場合、クエリ結果に含まれない
- **実装**: バリデーション層（Pydantic）でチェック

---

## インデックス設定

Firestoreコンソールまたはgcloudコマンドで以下のインデックスを作成：

### users コレクション
```bash
gcloud firestore indexes composite create \
  --collection-group=users \
  --field-config field-path=google_id,order=ascending

gcloud firestore indexes composite create \
  --collection-group=users \
  --field-config field-path=email,order=ascending
```

### meals サブコレクション
```bash
# meal_date単独インデックス
gcloud firestore indexes composite create \
  --collection-group=meals \
  --field-config field-path=meal_date,order=ascending

# meal_date + meal_type 複合インデックス
gcloud firestore indexes composite create \
  --collection-group=meals \
  --field-config field-path=meal_date,order=ascending \
  --field-config field-path=meal_type,order=ascending
```

---

## トランザクション

### SQLAlchemy（旧）
```python
from app.core.database import SessionLocal
db = SessionLocal()
try:
    user = User(...)
    db.add(user)
    settings = UserSettings(user_id=user.id, ...)
    db.add(settings)
    db.commit()
except:
    db.rollback()
    raise
finally:
    db.close()
```

### Firestore（新）
```python
from google.cloud.firestore import firestore

@firestore.transactional
def create_user_with_settings(transaction, db, user_data, settings_data):
    user_ref = db.collection('users').document()
    transaction.set(user_ref, user_data)

    settings_ref = user_ref.collection('settings').document('default')
    transaction.set(settings_ref, settings_data)

    return user_ref.id

# 使用例
transaction = db.transaction()
user_id = create_user_with_settings(transaction, db, user_data, settings_data)
```

**制約**:
- 最大500ドキュメントまで
- 読み取り操作は書き込み前に実行すること
- 競合時は自動リトライ

---

## バッチ書き込み

複数ドキュメントを効率的に書き込む：

```python
batch = db.batch()

# 複数の食事を一括作成
for meal_data in meals:
    meal_ref = db.collection('users').document(user_id) \
                .collection('meals').document()
    batch.set(meal_ref, meal_data)

batch.commit()
```

**制約**:
- 最大500ドキュメントまで
- トランザクションなし（部分的成功あり）

---

## パフォーマンス考慮事項

### 1. データの非正規化
- **推奨**: 頻繁にアクセスするデータは親ドキュメントに埋め込む
- **例**: ユーザーの名前をmealドキュメントに埋め込む（不要、サブコレクションなので）

### 2. クエリ最適化
- **複数条件**: 複合インデックスを作成
- **範囲クエリ**: 1つのフィールドのみ（meal_dateなど）
- **ソート**: インデックスが必要

### 3. コスト最適化
- **読み取り**: 1ドキュメント = 1読み取り
- **書き込み**: 1ドキュメント = 1書き込み
- **削除**: 1ドキュメント = 1書き込み扱い
- **リスナー**: 変更通知は無料（ドキュメント読み取りは有料）

---

## 移行時の注意事項

1. **UUID型**: PostgreSQLのUUID → FirestoreではString型で保存
2. **Date型**: PostgreSQLのDATE → FirestoreのTimestamp（00:00:00）
3. **配列型**: PostgreSQLのARRAY → FirestoreのArray（そのまま）
4. **JSON型**: PostgreSQLのJSONB → FirestoreのMap/Array
5. **Enum型**: 文字列として保存（バリデーションはアプリ層）

---

## セキュリティルール（参考）

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usersコレクション
    match /users/{userId} {
      // 自分のドキュメントのみ読み書き可能
      allow read, write: if request.auth != null && request.auth.uid == userId;

      // サブコレクション
      match /{subcollection=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

**注意**: Cloud Runから Admin SDKを使用する場合、セキュリティルールは適用されない（サーバー側で認証管理）。
