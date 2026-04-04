'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')
    const message = searchParams.get('message')

    if (error) {
      // エラーの場合はログインページにリダイレクト
      console.error('OAuth error:', error, message)
      router.push(`/login?error=${error}`)
      return
    }

    if (token) {
      // トークンをCookieに保存
      document.cookie = `accessToken=${token}; path=/; max-age=${60 * 60}; secure; samesite=lax`

      // メインページにリダイレクト
      router.push('/main')
    } else {
      // トークンがない場合はログインページにリダイレクト
      router.push('/login')
    }
  }, [searchParams, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 text-lg">認証中...</div>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mb-4 text-lg">読み込み中...</div>
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  )
}
