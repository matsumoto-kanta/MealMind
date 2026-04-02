#!/bin/bash

# スクリプトの説明を表示
echo "====================================="
echo "MealMind 完全デプロイスクリプト"
echo "====================================="
echo ""
echo "このスクリプトは以下を実行します:"
echo "1. Cloud SQLのセットアップ（初回のみ）"
echo "2. バックエンドのデプロイ"
echo "3. フロントエンドのデプロイ"
echo ""

# Cloud SQLセットアップ済みか確認
read -p "Cloud SQLは既にセットアップ済みですか？ (y/N): " sql_setup
if [ "$sql_setup" != "y" ]; then
  echo ""
  echo "Cloud SQLをセットアップします..."
  ./setup-cloud-sql.sh
  echo ""
  echo "Cloud SQLのセットアップが完了しました"
  echo ".env.productionファイルを作成してから再度このスクリプトを実行してください"
  exit 0
fi

# バックエンドのデプロイ
echo ""
echo "====================================="
echo "バックエンドをデプロイします"
echo "====================================="
./deploy-backend.sh

if [ $? -ne 0 ]; then
  echo "エラー: バックエンドのデプロイに失敗しました"
  exit 1
fi

# フロントエンドの.env.production作成を促す
echo ""
read -p "フロントエンドの.env.productionを作成しましたか？ (y/N): " frontend_env
if [ "$frontend_env" != "y" ]; then
  echo "frontend/.env.productionを作成してから再度このスクリプトを実行してください"
  exit 0
fi

# フロントエンドのデプロイ
echo ""
echo "====================================="
echo "フロントエンドをデプロイします"
echo "====================================="
./deploy-frontend.sh

if [ $? -ne 0 ]; then
  echo "エラー: フロントエンドのデプロイに失敗しました"
  exit 1
fi

echo ""
echo "====================================="
echo "全てのデプロイが完了しました！"
echo "====================================="
echo ""
echo "注意事項:"
echo "1. バックエンドのFRONTEND_URL環境変数を更新してください"
echo "2. Google OAuth リダイレクトURIを更新してください"
echo "3. データベースマイグレーションを実行してください"
echo ""
