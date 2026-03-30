'use client'

import { fetchDataClient } from '../FetchDataClient'
import type { User } from '@/stores/AuthStore'

/**
 * 現在ログイン中のユーザー情報を取得する
 * JWTトークン（Cookie）が必要です
 */
export const getCurrentUser = async (): Promise<{
  user?: User
  error?: unknown
}> => {
  try {
    const response = await fetchDataClient('/auth/me')

    if (response.error) {
      return { error: response.error }
    }

    return { user: response }
  } catch (error) {
    return { error }
  }
}
