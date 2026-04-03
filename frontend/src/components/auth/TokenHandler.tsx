'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Cookies from 'js-cookie'

/**
 * OAuth認証後のトークンをCookieに保存するコンポーネント
 */
export function TokenHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      // Cookieにトークンを保存
      Cookies.set('accessToken', token, {
        expires: 1, // 1日
        path: '/',
        sameSite: 'lax',
      })
      // URLからトークンパラメータを削除
      router.replace('/main')
    }
  }, [searchParams, router])

  return null
}
