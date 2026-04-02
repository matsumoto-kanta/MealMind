#!/bin/bash

# スクリプトの説明を表示
echo "====================================="
echo "フロントエンド デプロイスクリプト"
echo "====================================="
echo ""

# 設定ファイルの確認
if [ ! -f "../frontend/.env.production" ]; then
  echo "エラー: frontend/.env.productionファイルが見つかりません"
  echo "バックエンドのデプロイ後に.env.productionを作成してください"
  exit 1
fi

# プロジェクトIDの取得
PROJECT_ID=$(gcloud config get-value project)
echo "プロジェクトID: $PROJECT_ID"

# Cloud Runサービス名
SERVICE_NAME="mealmind-frontend"
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

# フロントエンドディレクトリに移動
cd ../frontend

echo ""
echo "1. Dockerイメージをビルド & デプロイ..."

# 環境変数の読み込み
source .env.production

gcloud run deploy $SERVICE_NAME \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars "NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL" \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10 \
  --min-instances 0

# デプロイしたURLを取得
FRONTEND_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format="value(status.url)")

echo ""
echo "====================================="
echo "デプロイ完了！"
echo "====================================="
echo ""
echo "フロントエンドURL: $FRONTEND_URL"
echo ""
echo "次のステップ:"
echo "1. バックエンドのFRONTEND_URL環境変数を更新:"
echo "   FRONTEND_URL=$FRONTEND_URL"
echo ""
echo "2. Google OAuth リダイレクトURIを更新:"
echo "   $FRONTEND_URL/auth/google/callback"
echo ""
