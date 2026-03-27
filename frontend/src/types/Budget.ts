export interface BudgetHistoryType {
  yearMonth: string
  budget: number
  spent: number
}

export interface MonthlyBudgetData {
  monthlyBudget: number
  remainingMonthlyBudget: number
  todayBudget: number
  history: BudgetHistoryType[]
}
