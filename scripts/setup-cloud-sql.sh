#!/bin/bash

# スクリプトの説明を表示
echo "====================================="
echo "Cloud SQL セットアップスクリプト"
echo "====================================="
echo ""

# プロジェクトIDの確認
read -p "Google CloudプロジェクトIDを入力してください: " PROJECT_ID
read -p "リージョン (デフォルト: asia-northeast1): " REGION
REGION=${REGION:-asia-northeast1}

echo ""
echo "設定内容:"
echo "  プロジェクトID: $PROJECT_ID"
echo "  リージョン: $REGION"
echo ""

# プロジェクト設定
echo "1. プロジェクトを設定..."
gcloud config set project $PROJECT_ID

# 必要なAPIを有効化
echo ""
echo "2. 必要なAPIを有効化..."
gcloud services enable sqladmin.googleapis.com
gcloud services enable compute.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# Cloud SQLインスタンス作成
echo ""
echo "3. Cloud SQLインスタンスを作成..."
INSTANCE_NAME="mealmind-db"
echo "  インスタンス名: $INSTANCE_NAME"

read -p "データベースパスワードを入力してください: " DB_PASSWORD

gcloud sql instances create $INSTANCE_NAME \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=$REGION \
  --root-password=$DB_PASSWORD \
  --availability-type=zonal \
  --storage-type=HDD \
  --storage-size=10GB

# データベース作成
echo ""
echo "4. データベースを作成..."
gcloud sql databases create mealmind --instance=$INSTANCE_NAME

# ユーザー作成
echo ""
echo "5. データベースユーザーを作成..."
read -p "データベースユーザー名 (デフォルト: dbuser): " DB_USER
DB_USER=${DB_USER:-dbuser}
read -p "ユーザーパスワードを入力してください: " USER_PASSWORD

gcloud sql users create $DB_USER \
  --instance=$INSTANCE_NAME \
  --password=$USER_PASSWORD

# 接続名を取得
echo ""
echo "6. Cloud SQL接続情報を取得..."
CONNECTION_NAME=$(gcloud sql instances describe $INSTANCE_NAME --format="value(connectionName)")

echo ""
echo "====================================="
echo "セットアップ完了！"
echo "====================================="
echo ""
echo "以下の情報を.env.productionファイルに設定してください:"
echo ""
echo "CLOUD_SQL_CONNECTION_NAME=$CONNECTION_NAME"
echo "DB_USER=$DB_USER"
echo "DB_PASSWORD=$USER_PASSWORD"
echo "DB_NAME=mealmind"
echo ""
