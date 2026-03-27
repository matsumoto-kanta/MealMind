import { MealData } from '@/types/Meal'
import { fetchData } from '../FetchData'

/**
 * 献立取得API
 * @returns 献立データ
 */
export const getMeals = async () => {
  const response: { meals: MealData } = await fetchData('/meals')
  return response.meals
}
