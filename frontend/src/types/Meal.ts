export interface MealDetailData {
  id: string
  type: 'morning' | 'lunch' | 'dinner'
  name: string
  kcal: number
  cost: number
  protein: number
  fat: number
  carbohydrates: number
  ingredients: { name: string; amount: string; price: number }[]
}

export interface MealData {
  status: 'draft' | 'fixed'
  detail: MealDetailData[]
}
