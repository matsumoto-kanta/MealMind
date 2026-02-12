'use client'

import { tabAtom } from '@/stores/TabStore'
import { useAtomValue } from 'jotai'
import Dashboard from './dashboard/components/Dashboard'
import History from './history/components/History'
import Budget from './budget/components/Budget'
import Settings from './settings/components/Settings'
import { MealData } from '@/types/Meal'

interface MainProps {
  meals: MealData
  history: MealData[]
}

export default function Main({ meals, history }: MainProps) {
  const tab = useAtomValue(tabAtom)

  return (
    <>
      {tab === 'history' ? (
        <History history={history} />
      ) : tab === 'budget' ? (
        <Budget />
      ) : tab === 'settings' ? (
        <Settings />
      ) : (
        <Dashboard meals={meals} />
      )}
    </>
  )
}
