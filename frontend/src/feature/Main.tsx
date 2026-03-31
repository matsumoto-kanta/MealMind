'use client'

import { tabAtom } from '@/stores/TabStore'
import { useAtom } from 'jotai'
import Dashboard from './dashboard/components/Dashboard'
import History from './history/components/History'
import Budget from './budget/components/Budget'
import Settings from './settings/components/Settings'
import { MealData } from '@/types/Meal'
import { MonthlyBudgetData } from '@/types/Budget'
import { SettingsData } from '@/types/Settings'
import { useLayoutEffect, useState } from 'react'
import SetUpPopup from '@/components/dialog/SetUpPopup'

interface MainProps {
  meals: MealData
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
  const [tab, setTab] = useAtom(tabAtom)
  const [setUpPopupOpen, setSetUpPopupOpen] = useState<boolean>(
    settings?.profile?.age === 0
  )

  useLayoutEffect(() => {
    if (settings?.profile?.age === 0) {
      setTab('settings')
    }
  }, [settings, setTab])

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

      <SetUpPopup open={setUpPopupOpen} setOpen={setSetUpPopupOpen} />
    </>
  )
}
