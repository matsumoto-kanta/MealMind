import { MealData } from '@/types/Meal'
import { http, HttpResponse } from 'msw'

const API_BASE_URL = process.env.API_BASE_URL

const meals: MealData = {
  status: 'fixed',
  detail: [
    {
      id: 'breakfast',
      type: 'morning',
      name: '高タンパク和風オムレツ定食',
      kcal: 32,
      protein: 18,
      fat: 10,
      carbohydrates: 38,
      cost: 210,
      ingredients: [
        { name: '卵', amount: '2個', price: 60 },
        { name: '鶏むね肉', amount: '60g', price: 70 },
        { name: 'ほうれん草', amount: '40g', price: 30 },
        { name: 'ご飯', amount: '100g', price: 40 },
        { name: '味噌', amount: '適量', price: 10 },
      ],
    },
    {
      id: 'lunch',
      type: 'lunch',
      name: '鶏むねの照り焼き丼（ブロッコリー添え）',
      kcal: 45,
      protein: 14,
      fat: 10,
      carbohydrates: 72,
      cost: 320,
      ingredients: [
        { name: '鶏むね肉', amount: '120g', price: 140 },
        { name: 'ご飯', amount: '180g', price: 70 },
        { name: 'ブロッコリー', amount: '60g', price: 50 },
        { name: '醤油', amount: '適量', price: 20 },
        { name: 'みりん', amount: '適量', price: 20 },
        { name: '砂糖', amount: '少量', price: 20 },
      ],
    },
    {
      id: 'dinner',
      type: 'dinner',
      name: '鮭と野菜のバター蒸し＋豆腐',
      kcal: 36,
      protein: 22,
      fat: 10,
      carbohydrates: 34,
      cost: 390,
      ingredients: [
        { name: '鮭', amount: '1切れ', price: 180 },
        { name: 'キャベツ', amount: '80g', price: 40 },
        { name: 'にんじん', amount: '30g', price: 20 },
        { name: 'しめじ', amount: '40g', price: 40 },
        { name: 'バター', amount: '10g', price: 30 },
        { name: '豆腐', amount: '1/2丁', price: 80 },
      ],
    },
  ],
}

export const mealsHandlers = [
  http.get(`${API_BASE_URL}/meals`, async () => {
    return HttpResponse.json({ meals: meals }, { status: 200 })
  }),
]
