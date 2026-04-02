# ベースイメージとしてNode.js 20を使用
FROM node:20-alpine AS base

# 依存関係のインストール用ステージ
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package.json package-lock.json* ./
RUN npm ci

# ビルド用ステージ
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# 全ファイルをコピー（.env.productionを含む）
COPY . .

# ビルド時の引数を受け取る
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_TELEMETRY_DISABLED=1

# デバッグ用：環境変数を表示
RUN echo "=== Build environment ===" && \
    echo "NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}" && \
    ls -la .env* 2>/dev/null || echo "No .env files found"

# Next.jsアプリケーションをビルド
RUN npm run build

# 本番環境用ステージ
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 非rootユーザーを作成
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# ビルド成果物をコピー
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Cloud Runのデフォルトポート
EXPOSE 8080

# Cloud Run用の環境変数
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

# Next.jsアプリケーションを起動
CMD ["node", "server.js"]
