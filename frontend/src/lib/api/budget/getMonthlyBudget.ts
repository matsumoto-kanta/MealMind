import { fetchData } from '../FetchData'
import { MonthlyBudgetData } from '@/types/Budget'

/**
 * 予算取得API
 * @returns 月間予算データ
 */
export const getMonthlyBudget = async () => {
  const response: { monthlyBudget: MonthlyBudgetData } =
    await fetchData('/monthlyBudget')
  return response.monthlyBudget
}
