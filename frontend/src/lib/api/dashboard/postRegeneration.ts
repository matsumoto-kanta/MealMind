import { fetchData } from '../FetchData'
import { MealDetailData } from '@/types/Meal'
import { messages } from '@/constants/messages'
import { showSuccessToast, showErrorToast } from '@/utils/toast'

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

  if (response.error) {
    showErrorToast(response.error)
    return null
  }

  showSuccessToast(messages.common.toastMessage.successRegeneration)
  return response.meal
}
