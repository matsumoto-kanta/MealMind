import { fetchData } from '../FetchData'
import { getDefaultStore } from 'jotai'
import {
  showToastAtom,
  toastMessageAtom,
  toastErrorMessageAtom,
} from '@/stores/ToastStore'
import { getErrorMessageByStatus } from '@/utils/getErrorMessageByStatus'

/**
 * ログアウトAPI
 * @returns 成功時はtrue、エラー時はfalse
 */
export const postLogout = async (): Promise<boolean> => {
  const response = await fetchData('/logout', undefined, {
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

  return true
}
