import { NextRequest, NextResponse } from 'next/server'

/**
 * OAuth認証後のコールバックエンドポイント
 * トークンをCookieに設定してメイン画面にリダイレクトします
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get('token')

  // 正しいホスト名を取得（Cloud Run対応）
  const host =
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    'localhost:3000'
  const protocol = request.headers.get('x-forwarded-proto') || 'https'
  const baseUrl = `${protocol}://${host}`

  // トークンがない場合はログインページにリダイレクト
  if (!token) {
    return NextResponse.redirect(new URL('/login', baseUrl))
  }

  // メイン画面へのリダイレクトレスポンスを作成
  const response = NextResponse.redirect(new URL('/main', baseUrl))

  // Cookieにトークンを設定
  response.cookies.set('accessToken', token, {
    httpOnly: false, // クライアントサイドからもアクセス可能にする
    secure: process.env.NODE_ENV === 'production', // 本番環境ではHTTPSのみ
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 1日
    path: '/',
  })

  return response
}
