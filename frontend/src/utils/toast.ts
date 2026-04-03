import { getDefaultStore } from 'jotai'
import {
  showToastAtom,
  toastMessageAtom,
  toastErrorMessageAtom,
} from '@/stores/ToastStore'
import { getErrorMessageByStatus } from '@/utils/getErrorMessageByStatus'

/**
 * 成功メッセージをトーストで表示
 * @param message - 表示するメッセージ
 */
export const showSuccessToast = (message: string): void => {
  const store = getDefaultStore()
  store.set(toastMessageAtom, message)
  store.set(toastErrorMessageAtom, '')
  store.set(showToastAtom, true)
}

/**
 * エラーメッセージをトーストで表示
 * @param error - エラーオブジェクト（status、messagesを含む）
 */
export const showErrorToast = (error?: {
  status?: number
  messages?: string
}): void => {
  const store = getDefaultStore()
  const status = error?.status ?? 500
  const errorMessage = error?.messages ?? getErrorMessageByStatus(status)
  store.set(toastErrorMessageAtom, errorMessage)
  store.set(toastMessageAtom, '')
  store.set(showToastAtom, true)
}
