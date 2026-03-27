import { getMeals } from '@/lib/api/dashboard/getMeals'
import Main from './Main'
import { MealData } from '@/types/Meal'
import { postHistory } from '@/lib/api/history/postHistory'
import { MonthlyBudgetData } from '@/types/Budget'
import { getMonthlyBudget } from '@/lib/api/budget/getMonthlyBudget'

export default async function MainData() {
  let meals: MealData
  let history: MealData[]
  let monthlyBudget: MonthlyBudgetData

  try {
    meals = await getMeals()
    history = await postHistory()
    monthlyBudget = await getMonthlyBudget()
  } catch (err) {
    console.error(err)
    throw new Error()
  }

  return <Main meals={meals} history={history} monthlyBudget={monthlyBudget} />
}
