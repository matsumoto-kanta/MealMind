// APIモックサーバー

import { budgetHandlers } from './BudgetHandlers'
import { historyHandlers } from './HistoryHandlers'
import { mealsHandlers } from './MealsHandlers'
import { settingsHandlers } from './SettingsHandlers'

export const handlers = [
  ...mealsHandlers,
  ...historyHandlers,
  ...budgetHandlers,
  ...settingsHandlers,
]
