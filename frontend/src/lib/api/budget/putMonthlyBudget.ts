import { fetchData } from '../FetchData'
import { MonthlyBudgetData } from '@/types/Budget'
import { messages } from '@/constants/messages'
import { showSuccessToast, showErrorToast } from '@/utils/toast'

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

  if (response.error) {
    showErrorToast(response.error)
    return null
  }

  showSuccessToast(messages.common.toastMessage.successUpdate)
  return response.monthlyBudget
}
