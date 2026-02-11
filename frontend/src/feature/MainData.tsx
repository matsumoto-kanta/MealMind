import { getMeals } from '@/lib/api/auth/getMeals'
import Main from './Main'
import { MealData } from '@/types/Meal'

export default async function MainData() {
  let meals: { meals: MealData }

  try {
    meals = await getMeals()
  } catch (err) {
    console.error(err)
    throw new Error()
  }

  return <Main meals={meals.meals} />
}
