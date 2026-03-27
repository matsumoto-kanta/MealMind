import { fetchData } from '../FetchData'
import { MonthlyBudgetData } from '@/types/Budget'
import { getDefaultStore } from 'jotai'
import {
  showToastAtom,
  toastMessageAtom,
  toastErrorMessageAtom,
} from '@/stores/ToastStore'
import { getErrorMessageByStatus } from '@/utils/getErrorMessageByStatus'
import { messages } from '@/constants/messages'

/**
 * 予算更新API
 * @param monthlyBudget - 新しい予算額
 * @returns 更新後の月間予算データ。エラー時はnull
 */
export const putMonthlyBudget = async (
  monthlyBudget: number
): Promise<MonthlyBudgetData | null> => {
  const response = await fetchData('/monthlyBudget', undefined, {
    method: 'PUT',
    body: { monthlyBudget },
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
    return null
  }

  store.set(toastMessageAtom, messages.common.toastMessage.successUpdate)
  store.set(toastErrorMessageAtom, '')
  store.set(showToastAtom, true)
  return response.monthlyBudget
}
