# Python 3.11のスリムイメージを使用
FROM python:3.11-slim

# 作業ディレクトリを設定
WORKDIR /app

# システムパッケージの更新とPostgreSQL用のライブラリをインストール
RUN apt-get update && apt-get install -y \
    bash \
    gcc \
    postgresql-client \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# /bin/sh を bash にリンク（Dev Container features互換性のため）
RUN ln -sf /bin/bash /bin/sh

# デフォルトシェルをbashに設定
SHELL ["/bin/bash", "-c"]

# 依存関係ファイルをコピー
COPY requirements.txt .

# Pythonパッケージをインストール
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションコードをコピー
COPY ./app ./app
COPY ./alembic ./alembic
COPY ./alembic.ini ./alembic.ini
COPY ./openapi.yaml ./openapi.yaml

# 非rootユーザーを作成
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# ポート8080を公開 (Cloud Runのデフォルトポート)
EXPOSE 8080

# Cloud Run用の環境変数
ENV PORT=8080

# アプリケーションを起動
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT}
