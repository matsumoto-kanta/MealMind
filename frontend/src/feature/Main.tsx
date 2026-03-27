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
import { useEffect, useState } from 'react'
import SetUpPopup from '@/components/dialog/SetUpPopup'

interface MainProps {
  meals: MealData | null
  history: MealData[]
  monthlyBudget: MonthlyBudgetData
  settings: SettingsData | null
}

export default function Main({
  meals,
  history,
  monthlyBudget,
  settings,
}: MainProps) {
  const [tab, setTab] = useAtom(tabAtom)
  const [setUpPopupOpen, setSetUpPopupOpen] = useState<boolean>(!settings)

  const defaultSettings: SettingsData = {
    profile: {
      gender: 'male',
      age: 0,
      height: 0,
      weight: 0,
      activityLevel: 'low',
    },
    goal: {
      targetWeight: 0,
    },
    preference: {
      dislikedFoods: [],
      allergies: [],
    },
  }

  useEffect(() => {
    if (!settings) {
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
        <Settings settings={settings ?? defaultSettings} />
      ) : (
        <Dashboard meals={meals} />
      )}

      <SetUpPopup open={setUpPopupOpen} setOpen={setSetUpPopupOpen} />
    </>
  )
}
