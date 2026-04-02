import { MealData, MealDetailData } from '@/types/Meal'
import { http, HttpResponse } from 'msw'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const regeneratedMeals: Record<string, MealDetailData> = {
  breakfast: {
    id: 'breakfast',
    name: 'アボカドトースト＆スクランブルエッグ',
    kcal: 38,
    protein: 15,
    fat: 14,
    carbohydrates: 35,
    cost: 250,
    status: 'draft',
    ingredients: [
      { name: '食パン', amount: '1枚', price: 40 },
      { name: 'アボカド', amount: '1/2個', price: 100 },
      { name: '卵', amount: '2個', price: 60 },
      { name: 'トマト', amount: '1/4個', price: 30 },
      { name: 'オリーブオイル', amount: '適量', price: 20 },
    ],
  },
  lunch: {
    id: 'lunch',
    name: '豚しゃぶサラダうどん',
    kcal: 42,
    protein: 18,
    fat: 8,
    carbohydrates: 65,
    cost: 350,
    status: 'draft',
    ingredients: [
      { name: '豚ロース薄切り', amount: '100g', price: 150 },
      { name: 'うどん', amount: '1玉', price: 50 },
      { name: 'レタス', amount: '50g', price: 30 },
      { name: 'きゅうり', amount: '1/2本', price: 30 },
      { name: 'ポン酢', amount: '適量', price: 20 },
      { name: 'ごま', amount: '適量', price: 10 },
    ],
  },
  dinner: {
    id: 'dinner',
    name: '鶏もも肉のトマト煮込み',
    kcal: 40,
    protein: 24,
    fat: 12,
    carbohydrates: 30,
    cost: 420,
    status: 'draft',
    ingredients: [
      { name: '鶏もも肉', amount: '120g', price: 160 },
      { name: 'トマト缶', amount: '1/2缶', price: 60 },
      { name: '玉ねぎ', amount: '1/2個', price: 40 },
      { name: 'ピーマン', amount: '1個', price: 30 },
      { name: 'にんにく', amount: '1片', price: 20 },
      { name: 'コンソメ', amount: '適量', price: 10 },
    ],
  },
}

let meals: MealData = {
  status: 'fixed',
  detail: [
    {
      id: 'breakfast',
      name: '高タンパク和風オムレツ定食',
      kcal: 32,
      protein: 18,
      fat: 10,
      carbohydrates: 38,
      cost: 210,
      status: 'draft',
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
      name: '鶏むねの照り焼き丼（ブロッコリー添え）',
      kcal: 45,
      protein: 14,
      fat: 10,
      carbohydrates: 72,
      cost: 320,
      status: 'draft',
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
      name: '鮭と野菜のバター蒸し＋豆腐',
      kcal: 36,
      protein: 22,
      fat: 10,
      carbohydrates: 34,
      cost: 390,
      status: 'draft',
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

  http.post(`${API_BASE_URL}/meals/generate`, async () => {
    return HttpResponse.json({ meals: meals }, { status: 201 })
  }),

  http.post(`${API_BASE_URL}/meals/:id/regenerate`, async ({ params }) => {
    const id = params.id as string
    const regenerated = regeneratedMeals[id]
    if (!regenerated) {
      return HttpResponse.json(
        { error: { status: 404, messages: '献立が見つかりません。' } },
        { status: 404 }
      )
    }
    meals = {
      ...meals,
      detail: meals.detail.map((m) => (m.id === id ? regenerated : m)),
    }
    return HttpResponse.json({ meal: regenerated }, { status: 200 })
  }),

  http.put(`${API_BASE_URL}/meals/:id/confirm`, async ({ params }) => {
    const id = params.id as string
    const meal = meals.detail.find((m) => m.id === id)
    if (!meal) {
      return HttpResponse.json(
        { error: { status: 404, messages: '献立が見つかりません。' } },
        { status: 404 }
      )
    }
    const confirmedMeal = { ...meal, status: 'confirmed' as const }
    meals = {
      ...meals,
      detail: meals.detail.map((m) => (m.id === id ? confirmedMeal : m)),
    }
    return HttpResponse.json({ meal: confirmedMeal }, { status: 200 })
  }),
]
