'use client'

import { tabAtom } from '@/stores/TabStore'
import { useAtomValue } from 'jotai'
import Dashboard from './dashboard/components/Dashboard'
import History from './history/components/History'
import Budget from './budget/components/Budget'
import Settings from './settings/components/Settings'
import { MealData } from '@/types/Meal'
import { MonthlyBudgetData } from '@/types/Budget'
import { SettingsData } from '@/types/Settings'

interface MainProps {
  meals: MealData | null
  history: MealData[]
  monthlyBudget: MonthlyBudgetData
  settings: SettingsData
}

export default function Main({
  meals,
  history,
  monthlyBudget,
  settings,
}: MainProps) {
  const tab = useAtomValue(tabAtom)

  return (
    <>
      {tab === 'budget' ? (
        <Budget monthlyBudget={monthlyBudget} />
      ) : tab === 'history' ? (
        <History history={history} />
      ) : tab === 'settings' ? (
        <Settings settings={settings} />
      ) : (
        <Dashboard meals={meals} />
      )}
    </>
  )
}
