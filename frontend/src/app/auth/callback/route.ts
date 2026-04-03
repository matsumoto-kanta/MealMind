import { NextRequest, NextResponse } from 'next/server'

/**
 * OAuth認証後のコールバックエンドポイント
 * トークンをCookieに設定してメイン画面にリダイレクトします
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get('token')

  // トークンがない場合はログインページにリダイレクト
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // メイン画面へのリダイレクトレスポンスを作成
  const response = NextResponse.redirect(new URL('/main', request.url))

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
