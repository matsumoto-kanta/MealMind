import { fetchData } from '../FetchData'
import { MealDetailData } from '@/types/Meal'
import { messages } from '@/constants/messages'
import { showSuccessToast, showErrorToast } from '@/utils/toast'

/**
 * 献立登録API
 * @param id - 対象の献立ID
 * @returns 確定された献立データ。エラー時はnull
 */
export const putConfirmed = async (
  id: string
): Promise<MealDetailData | null> => {
  const response = await fetchData(`/meals/${id}/confirm`, undefined, {
    method: 'PUT',
  })

  if (response.error) {
    showErrorToast(response.error)
    return null
  }

  showSuccessToast(messages.common.toastMessage.successConfirmed)
  return response.meal
}
