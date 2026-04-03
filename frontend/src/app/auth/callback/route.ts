import { NextRequest, NextResponse } from 'next/server'

/**
 * OAuth認証後のコールバックエンドポイント
 *
 * 注意: バックエンドが既にHTTP-only Cookieでトークンを設定し、
 * /mainに直接リダイレクトするため、このエンドポイントは通常使用されません。
 * レガシーサポートとして残されています。
 */
export async function GET(request: NextRequest) {
  // 正しいホスト名を取得（Cloud Run対応）
  const host =
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    'localhost:3000'
  const protocol = request.headers.get('x-forwarded-proto') || 'https'
  const baseUrl = `${protocol}://${host}`

  // メイン画面にリダイレクト（トークンは既にバックエンドでCookie設定済み）
  return NextResponse.redirect(new URL('/main', baseUrl))
}
