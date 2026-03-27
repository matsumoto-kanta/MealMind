import { MonthlyBudgetData } from '@/types/Budget'
import { http, HttpResponse } from 'msw'

const API_BASE_URL = process.env.API_BASE_URL

let monthlyBudget: MonthlyBudgetData = {
  monthlyBudget: 20000,
  remainingMonthlyBudget: 15000,
  todayBudget: 920,
  history: [
    { yearMonth: '2025-03', budget: 100000, spent: 82000 },
    { yearMonth: '2025-04', budget: 100000, spent: 76000 },
    { yearMonth: '2025-05', budget: 100000, spent: 91000 },
    { yearMonth: '2025-06', budget: 100000, spent: 87000 },
    { yearMonth: '2025-07', budget: 100000, spent: 95000 },
    { yearMonth: '2025-08', budget: 100000, spent: 99000 },
    { yearMonth: '2025-09', budget: 100000, spent: 78000 },
    { yearMonth: '2025-10', budget: 100000, spent: 83000 },
    { yearMonth: '2025-11', budget: 100000, spent: 88000 },
    { yearMonth: '2025-12', budget: 120000, spent: 110000 },
    { yearMonth: '2026-01', budget: 100000, spent: 92000 },
    { yearMonth: '2026-02', budget: 100000, spent: 85000 },
  ],
}

export const budgetHandlers = [
  http.get(`${API_BASE_URL}/monthlyBudget`, async () => {
    return HttpResponse.json({ monthlyBudget: monthlyBudget }, { status: 200 })
  }),

  http.put(`${API_BASE_URL}/monthlyBudget`, async ({ request }) => {
    const body = (await request.json()) as { monthlyBudget: number }
    const diff = body.monthlyBudget - monthlyBudget.monthlyBudget
    monthlyBudget = {
      ...monthlyBudget,
      monthlyBudget: body.monthlyBudget,
      remainingMonthlyBudget: monthlyBudget.remainingMonthlyBudget + diff,
    }
    return HttpResponse.json({ monthlyBudget: monthlyBudget }, { status: 200 })
  }),
]
