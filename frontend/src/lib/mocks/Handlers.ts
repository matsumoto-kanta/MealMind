// APIモックサーバー

import { historyHandlers } from './HistoryHandlers'
import { mealsHandlers } from './MealsHandlers'

export const handlers = [...mealsHandlers, ...historyHandlers]
