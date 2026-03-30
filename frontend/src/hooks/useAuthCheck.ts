import { useEffect } from 'react'
import { useSetAtom } from 'jotai'
import { authAtom } from '@/stores/AuthStore'
import { getCurrentUser } from '@/lib/api/auth/getCurrentUser'

/**
 * アプリ起動時に認証状態をチェックするフック
 * Cookieからユーザー情報を取得し、authAtomを更新します
 */
export const useAuthCheck = () => {
  const setAuthState = useSetAtom(authAtom)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user, error } = await getCurrentUser()

        if (user && !error) {
          setAuthState({
            user,
            isLoading: false,
            isAuthenticated: true,
          })
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          })
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        })
      }
    }

    checkAuth()
  }, [setAuthState])
}
