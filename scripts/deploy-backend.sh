#!/bin/bash

# スクリプトの説明を表示
echo "====================================="
echo "バックエンド デプロイスクリプト"
echo "====================================="
echo ""

# 設定ファイルの確認
if [ ! -f "../backend/.env.production" ]; then
  echo "エラー: backend/.env.productionファイルが見つかりません"
  echo ".env.exampleを参考に.env.productionを作成してください"
  exit 1
fi

# プロジェクトIDの取得
PROJECT_ID=$(gcloud config get-value project)
echo "プロジェクトID: $PROJECT_ID"

# 環境変数の読み込み
source ../backend/.env.production

# Cloud Runサービス名
SERVICE_NAME="mealmind-backend"
REGION="asia-northeast1"

echo ""
echo "デプロイ設定:"
echo "  サービス名: $SERVICE_NAME"
echo "  リージョン: $REGION"
echo ""

read -p "デプロイを開始しますか？ (y/N): " confirm
if [ "$confirm" != "y" ]; then
  echo "デプロイをキャンセルしました"
  exit 0
fi

# バックエンドディレクトリに移動
cd ../backend

echo ""
echo "1. Dockerイメージをビルド & デプロイ..."

gcloud run deploy $SERVICE_NAME \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars "ENVIRONMENT=production" \
  --set-env-vars "CLOUD_SQL_CONNECTION_NAME=$CLOUD_SQL_CONNECTION_NAME" \
  --set-env-vars "DB_USER=$DB_USER" \
  --set-env-vars "DB_PASSWORD=$DB_PASSWORD" \
  --set-env-vars "DB_NAME=$DB_NAME" \
  --set-env-vars "SECRET_KEY=$SECRET_KEY" \
  --set-env-vars "ALGORITHM=$ALGORITHM" \
  --set-env-vars "GEMINI_API_KEY=$GEMINI_API_KEY" \
  --set-env-vars "FRONTEND_URL=$FRONTEND_URL" \
  --set-env-vars "GCP_PROJECT_ID=$GCP_PROJECT_ID" \
  --add-cloudsql-instances $CLOUD_SQL_CONNECTION_NAME \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10 \
  --min-instances 0

# デプロイしたURLを取得
BACKEND_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format="value(status.url)")

echo ""
echo "====================================="
echo "デプロイ完了！"
echo "====================================="
echo ""
echo "バックエンドURL: $BACKEND_URL"
echo ""
echo "次のステップ:"
echo "1. データベースマイグレーションを実行:"
echo "   gcloud run jobs create mealmind-migrate \\"
echo "     --image gcr.io/$PROJECT_ID/$SERVICE_NAME \\"
echo "     --region $REGION \\"
echo "     --set-cloudsql-instances $CLOUD_SQL_CONNECTION_NAME \\"
echo "     --set-env-vars=\"DB_USER=$DB_USER,DB_PASSWORD=$DB_PASSWORD,DB_NAME=$DB_NAME\""
echo ""
echo "2. フロントエンドの.env.productionに以下を設定:"
echo "   NEXT_PUBLIC_API_URL=$BACKEND_URL"
echo ""
