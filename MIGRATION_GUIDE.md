# Firestore移行ガイド

## 概要

このガイドでは、Cloud SQLからFirestoreへのデータ移行手順を説明します。

## 前提条件

1. ✅ Firestoreデータベースが作成済み
2. ✅ Firebase Admin SDK認証情報（firestore-key.json）が設定済み
3. ✅ 新しいコードがFirestore対応済み
4. ✅ Cloud SQL接続情報が環境変数に設定済み

## 移行手順

### Step 1: 準備

```bash
cd /Users/matsumotokano/Desktop/個人/MealMind/backend

# 環境変数を確認
cat .env

# 必要な変数:
# - FIRESTORE_CREDENTIALS_PATH
# - DATABASE_URL（または DB_USER, DB_PASSWORD, DB_NAME, DB_HOST）
```

### Step 2: Dry Run（テスト実行）

まず、dry-runモードで移行内容を確認します。

```bash
python scripts/migrate_to_firestore.py --dry-run
```

**出力例:**
```
🚀 Cloud SQL → Firestore Migration
============================================================
Connecting to Cloud SQL...
Connecting to Firestore...
Connected! (Dry run: True)
------------------------------------------------------------

📊 Migrating Users...
Found 5 users
  [DRY RUN] Would migrate user: user1@example.com (ID: abc-123)
  [DRY RUN] Would migrate user: user2@example.com (ID: def-456)
  ...

============================================================
📊 Migration Summary
============================================================
✓ Users: 5 migrated, 0 errors
✓ Settings: 5 migrated, 0 errors
✓ Budgets: 12 migrated, 0 errors
✓ Meals: 45 migrated, 0 errors
------------------------------------------------------------
Total: 67 records migrated, 0 errors
============================================================

⚠️  DRY RUN MODE - No data was actually written to Firestore
```

### Step 3: 本番移行

dry-runで問題がなければ、本番移行を実行します。

```bash
# 全データを移行
python scripts/migrate_to_firestore.py

# 検証付きで移行
python scripts/migrate_to_firestore.py --verify
```

### Step 4: データ整合性の確認

移行後、Firestoreコンソールでデータを確認します。

```bash
# Firestoreコンソールを開く
open "https://console.firebase.google.com/project/mealmind-491802/firestore"
```

確認項目:
- ✅ Usersコレクションに全ユーザーが存在
- ✅ 各ユーザーのサブコレクション（settings, monthly_budgets, meals）が存在
- ✅ データの内容が正しい

### Step 5: アプリケーションのテスト

```bash
# アプリケーションを起動
cd /Users/matsumotokano/Desktop/個人/MealMind/backend
uvicorn app.main:app --reload

# 別のターミナルで
curl http://localhost:8000/health
```

**期待される出力:**
```json
{
  "status": "healthy",
  "database": "connected"
}
```

各APIエンドポイントをテスト:
```bash
# 認証（ブラウザで実行）
open "http://localhost:8000/auth/google"

# 設定取得（トークン必要）
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/settings

# 予算取得
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/monthlyBudget

# 今日の食事取得
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/meals
```

### Step 6: Cloud SQLの停止

⚠️ **重要**: アプリケーションが正常に動作することを確認してから実行してください。

```bash
# バックアップを作成（念のため）
gcloud sql backups create --instance=mealmind-db

# インスタンスを停止（課金停止、データは保持）
gcloud sql instances patch mealmind-db --activation-policy=NEVER
```

### Step 7: Cloud SQLの削除（オプション）

⚠️ **非常に重要**: この操作は取り消せません。必ず全ての動作確認を完了してから実行してください。

```bash
# 最終確認
gcloud sql instances describe mealmind-db

# インスタンスを削除
gcloud sql instances delete mealmind-db

# 確認プロンプトで "mealmind-db" を入力
```

## オプション機能

### 部分的な移行

特定のデータタイプのみを移行する場合:

```bash
# ユーザーのみ移行
python scripts/migrate_to_firestore.py --skip-settings --skip-budgets --skip-meals

# 食事記録のみ移行
python scripts/migrate_to_firestore.py --skip-users --skip-settings --skip-budgets
```

### エラーハンドリング

移行中にエラーが発生した場合:

1. エラーメッセージを確認
2. 問題のあるデータを特定
3. 手動で修正または削除
4. 再度移行を実行

```bash
# エラーログを確認
python scripts/migrate_to_firestore.py 2>&1 | tee migration.log
```

## トラブルシューティング

### 認証エラー

```
Error: Could not automatically determine credentials
```

**解決方法:**
```bash
# 認証情報のパスを確認
ls -la backend/firestore-key.json

# 環境変数を確認
echo $FIRESTORE_CREDENTIALS_PATH
```

### データベース接続エラー

```
Error: could not connect to server
```

**解決方法:**
```bash
# Cloud SQL Proxyを起動
cloud-sql-proxy mealmind-491802:asia-northeast1:mealmind-db

# または、DATABASE_URLを確認
echo $DATABASE_URL
```

### バッチサイズエラー

```
Error: Batch size exceeds maximum
```

Firestoreのバッチ書き込みは最大500ドキュメントまでです。スクリプトは自動的にバッチを分割しますが、問題がある場合はコードの `max_batch_size` を調整してください。

## ロールバック手順

移行後に問題が発生した場合:

### Cloud SQLに戻る

1. `.env`ファイルを編集
   ```bash
   # Firestoreを無効化
   # FIRESTORE_CREDENTIALS_PATH=firestore-key.json

   # Cloud SQLを有効化
   DATABASE_URL=postgresql://dbuser:password@localhost:5432/mealmind
   ```

2. コードを元に戻す
   ```bash
   git stash  # 現在の変更を退避
   # または
   git checkout <previous-commit>
   ```

3. アプリケーションを再起動

### Firestoreのデータを削除

```bash
# 全ユーザーのデータを削除（注意！）
# Firestoreコンソールから手動で削除するか、スクリプトを作成
```

## チェックリスト

移行前:
- [ ] Firestoreデータベース作成済み
- [ ] 認証情報設定済み
- [ ] Dry-run実行済み
- [ ] バックアップ作成済み

移行後:
- [ ] データ整合性確認済み
- [ ] 全APIエンドポイント動作確認済み
- [ ] フロントエンドから動作確認済み
- [ ] 本番環境で動作確認済み

Cloud SQL削除前:
- [ ] 1週間以上問題なく運用できた
- [ ] 最終バックアップ作成済み
- [ ] チーム全員が確認済み

## サポート

問題が発生した場合:
1. このドキュメントのトラブルシューティングセクションを確認
2. migration.logファイルを確認
3. Firestoreコンソールでデータを確認
4. 必要に応じてロールバック
