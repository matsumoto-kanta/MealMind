import { MealData } from '@/types/Meal'
import { fetchData } from '../FetchData'

/**
 * 献立生成API
 * @returns 生成された献立データ
 */
export const postGenerateMeals = async () => {
  const response: { meals: MealData } = await fetchData(
    '/meals/generate',
    undefined,
    {
      method: 'POST',
    }
  )
  return response.meals
}
