import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Next.js ミドルウェア - ルート保護
 * 認証が必要なページへのアクセスを制御します
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const accessToken = request.cookies.get('accessToken')

  // 認証が必要なパス (/main/* 配下)
  const isAuthRoute = pathname.startsWith('/main')

  // ログインページ
  const isLoginPage = pathname === '/login'

  // 認証コールバックページ（認証不要）
  const isAuthCallbackPage = pathname === '/auth/callback'

  // 認証コールバックページは常に許可
  if (isAuthCallbackPage) {
    return NextResponse.next()
  }

  // 認証が必要なルートでトークンがない場合
  if (isAuthRoute && !accessToken) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // ログインページでトークンがある場合（すでにログイン済み）
  if (isLoginPage && accessToken) {
    const mainUrl = new URL('/main', request.url)
    return NextResponse.redirect(mainUrl)
  }

  return NextResponse.next()
}

/**
 * ミドルウェアを適用するパスの設定
 */
export const config = {
  matcher: [
    /*
     * 以下を除くすべてのパスにマッチ:
     * - api (APIルート)
     * - _next/static (静的ファイル)
     * - _next/image (画像最適化ファイル)
     * - favicon.ico (ファビコン)
     * - public フォルダ内のファイル
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|meal-mind.PNG).*)',
  ],
}
