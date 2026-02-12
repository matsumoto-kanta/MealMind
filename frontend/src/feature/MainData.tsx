import { getMeals } from '@/lib/api/dashboard/getMeals'
import Main from './Main'
import { MealData } from '@/types/Meal'
import { postHistory } from '@/lib/api/history/postHistory'

export default async function MainData() {
  let meals: MealData
  let history: MealData[]

  try {
    meals = await getMeals()
    history = await postHistory()
  } catch (err) {
    console.error(err)
    throw new Error()
  }

  return <Main meals={meals} history={history} />
}
