// APIモックサーバー

// import { authHandlers } from './AuthHandlers'
import { budgetHandlers } from './BudgetHandlers'
import { historyHandlers } from './HistoryHandlers'
import { mealsHandlers } from './MealsHandlers'
// import { settingsHandlers } from './SettingsHandlers'

export const handlers = [
  // ...authHandlers,
  ...mealsHandlers,
  ...historyHandlers,
  ...budgetHandlers,
  // ...settingsHandlers,
]
