import { MealData } from '@/types/Meal'
import { fetchData } from '../FetchData'

export const getMeals = async () => {
  const response: { meals: MealData } = await fetchData('/meals')
  return response.meals
}
