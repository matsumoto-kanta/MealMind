import { fetchData } from '../FetchData'
import { MealDetailData } from '@/types/Meal'
import { getDefaultStore } from 'jotai'
import {
  showToastAtom,
  toastMessageAtom,
  toastErrorMessageAtom,
} from '@/stores/ToastStore'
import { getErrorMessageByStatus } from '@/utils/getErrorMessageByStatus'
import { messages } from '@/constants/messages'

/**
 * 献立再生成API
 * @param id - 対象の献立ID
 * @returns 再生成された献立データ。エラー時はnull
 */
export const postRegeneration = async (
  id: string
): Promise<MealDetailData | null> => {
  const response = await fetchData(`/meals/${id}/regenerate`, undefined, {
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
    return null
  }

  store.set(toastMessageAtom, messages.common.toastMessage.successRegeneration)
  store.set(toastErrorMessageAtom, '')
  store.set(showToastAtom, true)
  return response.meal
}
