import { MealData } from '@/types/Meal'
import { fetchData } from '../FetchData'

/**
 * 履歴取得API
 * @param page - ページ番号
 * @returns 履歴データの配列
 */
export const postHistory = async (page?: number) => {
  const response: { history: MealData[] } = await fetchData(
    '/history',
    undefined,
    {
      method: 'POST',
      body: {
        page: page,
      },
    }
  )
  return response.history
}
