export interface MealDetailData {
  id: 'breakfast' | 'lunch' | 'dinner'
  name: string
  kcal: number
  cost: number
  protein: number
  fat: number
  carbohydrates: number
  ingredients: { name: string; amount: string; price: number }[]
  status?: 'draft' | 'confirmed'
}

export interface MealData {
  status?: 'draft' | 'fixed'
  date?: string
  detail: MealDetailData[]
}
