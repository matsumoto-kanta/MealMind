// APIモックサーバー

import { budgetHandlers } from './BudgetHandlers'
import { historyHandlers } from './HistoryHandlers'
import { mealsHandlers } from './MealsHandlers'

export const handlers = [
  ...mealsHandlers,
  ...historyHandlers,
  ...budgetHandlers,
]
