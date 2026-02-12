import { MealData } from '@/types/Meal'
import { fetchData } from '../FetchData'

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
