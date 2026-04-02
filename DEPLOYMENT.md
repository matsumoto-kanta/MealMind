# MealMind Cloud Run デプロイガイド

このガイドでは、MealMindアプリケーションをGoogle Cloud Runにデプロイする手順を説明します。

## 前提条件

- Google Cloudプロジェクトが作成済み
- gcloud CLIがインストール済み
- Dockerがインストール済み（ローカルテストする場合）

## デプロイ手順

### 1. Google Cloud CLIの認証とプロジェクト設定

```bash
# Google Cloudにログイン
gcloud auth login

# プロジェクトIDを確認
gcloud projects list

# プロジェクトを設定
gcloud config set project YOUR_PROJECT_ID
```

### 2. Cloud SQLのセットアップ

```bash
cd scripts
./setup-cloud-sql.sh
```

このスクリプトは以下を実行します：
- 必要なAPIの有効化
- Cloud SQLインスタンスの作成
- データベースとユーザーの作成
- 接続情報の表示

スクリプト実行後、表示される接続情報をメモしてください。

### 3. バックエンドの環境変数設定

```bash
# テンプレートをコピー
cp backend/.env.production.template backend/.env.production

# エディタで編集
nano backend/.env.production
```

以下の項目を設定：
- `CLOUD_SQL_CONNECTION_NAME`: setup-cloud-sql.shで表示された接続名
- `DB_USER`: データベースユーザー名
- `DB_PASSWORD`: データベースパスワード
- `GCP_PROJECT_ID`: Google CloudプロジェクトID
- `SECRET_KEY`: 以下のコマンドで生成
  ```bash
  openssl rand -hex 32
  ```
- `GEMINI_API_KEY`: Google AI StudioのAPIキー
- `GOOGLE_CLIENT_ID`: Google OAuth認証情報
- `GOOGLE_CLIENT_SECRET`: Google OAuthシークレット

### 4. バックエンドのデプロイ

```bash
cd scripts
./deploy-backend.sh
```

デプロイが完了すると、バックエンドのURLが表示されます。このURLをメモしてください。

### 5. データベースマイグレーション

バックエンドのデプロイ後、データベーステーブルを作成します。

```bash
# Cloud Runサービスに接続してマイグレーションを実行
gcloud run services proxy mealmind-backend --port=8080 &
PROXY_PID=$!

# マイグレーション実行
cd backend
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@127.0.0.1:8080/${DB_NAME}" \
  alembic upgrade head

# プロキシを停止
kill $PROXY_PID
```

または、Cloud Runのコンソールから直接実行：

```bash
# Cloud Runのターミナルで実行
alembic upgrade head
```

### 6. フロントエンドの環境変数設定

```bash
# テンプレートをコピー
cp frontend/.env.production.template frontend/.env.production

# エディタで編集
nano frontend/.env.production
```

`NEXT_PUBLIC_API_URL`にバックエンドのURLを設定します。

### 7. フロントエンドのデプロイ

```bash
cd scripts
./deploy-frontend.sh
```

デプロイが完了すると、フロントエンドのURLが表示されます。

### 8. バックエンドの環境変数を更新

フロントエンドのURLを取得したら、バックエンドの環境変数を更新します。

```bash
# backend/.env.productionを編集
FRONTEND_URL=https://mealmind-frontend-xxxxx-an.a.run.app
GOOGLE_REDIRECT_URI=https://mealmind-frontend-xxxxx-an.a.run.app/auth/google/callback

# バックエンドを再デプロイ
cd scripts
./deploy-backend.sh
```

### 9. Google OAuth設定の更新

[Google Cloud Console](https://console.cloud.google.com/apis/credentials)で、OAuth 2.0クライアントIDの設定を更新します。

承認済みのリダイレクトURIに以下を追加：
```
https://mealmind-frontend-xxxxx-an.a.run.app/auth/google/callback
```

承認済みのJavaScript生成元に以下を追加：
```
https://mealmind-frontend-xxxxx-an.a.run.app
```

## 自動デプロイ

全てを一度にデプロイする場合：

```bash
cd scripts
./deploy-all.sh
```

## トラブルシューティング

### Cloud SQLに接続できない

```bash
# Cloud SQL Proxyを使用してローカルから接続
cloud-sql-proxy YOUR_PROJECT:REGION:INSTANCE_NAME
```

### ログの確認

```bash
# バックエンドのログ
gcloud run services logs read mealmind-backend --limit=50

# フロントエンドのログ
gcloud run services logs read mealmind-frontend --limit=50
```

### サービスの削除

```bash
# Cloud Runサービスを削除
gcloud run services delete mealmind-backend --region=asia-northeast1
gcloud run services delete mealmind-frontend --region=asia-northeast1

# Cloud SQLインスタンスを削除
gcloud sql instances delete mealmind-db
```

## コスト最適化

### 無料枠を活用

- Cloud Run: 月間200万リクエストまで無料
- Cloud SQL: db-f1-micro（1vCPU、614MB RAM）は非常に安価
- Cloud Build: 1日120分のビルド時間が無料

### コスト削減のヒント

1. **最小インスタンス数を0に設定**
   - トラフィックがない時はインスタンスが0になる
   - コールドスタートが発生するが、コストを大幅に削減

2. **Cloud SQLの自動バックアップを調整**
   ```bash
   gcloud sql instances patch mealmind-db \
     --backup-start-time=03:00 \
     --retained-backups-count=7
   ```

3. **不要なログを削減**
   - ログのレベルを`info`以上に設定
   - 古いログを定期的に削除

## カスタムドメインの設定

1. Cloud Runのコンソールで「カスタムドメインをマッピング」
2. DNS設定でCNAMEレコードを追加
3. SSL証明書は自動で発行されます

## 継続的デプロイ（CI/CD）

GitHub Actionsを使用して自動デプロイを設定できます。

`.github/workflows/deploy.yml`の例：

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - id: 'auth'
        uses: 'google-github-actions/auth@v1'
        with:
          credentials_json: '${{ secrets.GCP_SA_KEY }}'

      - name: Deploy Backend
        run: |
          cd scripts
          ./deploy-backend.sh

      - name: Deploy Frontend
        run: |
          cd scripts
          ./deploy-frontend.sh
```

## 参考リンク

- [Cloud Run ドキュメント](https://cloud.google.com/run/docs)
- [Cloud SQL ドキュメント](https://cloud.google.com/sql/docs)
- [Next.js デプロイガイド](https://nextjs.org/docs/deployment)
- [FastAPI デプロイガイド](https://fastapi.tiangolo.com/deployment/)
