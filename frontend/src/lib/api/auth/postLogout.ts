import { getDefaultStore } from 'jotai'
import {
  showToastAtom,
  toastMessageAtom,
  toastErrorMessageAtom,
} from '@/stores/ToastStore'
import { authAtom } from '@/stores/AuthStore'
import { getErrorMessageByStatus } from '@/utils/getErrorMessageByStatus'
import { fetchData } from '../FetchData'

/**
 * ログアウトAPI
 * @returns 成功時はtrue、エラー時はfalse
 */
export const postLogout = async (): Promise<boolean> => {
  const response = await fetchData('/auth/logout', undefined, {
    method: 'POST',
  })

  const store = getDefaultStore()

  if (response.error) {
    store.set(
      toastErrorMessageAtom,
      response?.error?.messages ??
        getErrorMessageByStatus(response?.error?.status)
    )
    store.set(toastMessageAtom, '')
    store.set(showToastAtom, true)
    return false
  }

  // ログアウト成功時に認証状態をリセット
  store.set(authAtom, {
    user: null,
    isLoading: false,
    isAuthenticated: false,
  })

  return true
}
