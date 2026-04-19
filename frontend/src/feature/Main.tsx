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
import InfoPopup from '@/components/dialog/SetUpPopup'
import { Handshake, Wallet } from 'lucide-react'
import { messages } from '@/constants/messages'

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

  // 設定未完了の判定（年齢、目標体重、目標達成期間がすべて1以上である必要がある）
  const isSettingsIncomplete =
    !settings?.profile?.age ||
    settings.profile.age < 1 ||
    !settings?.goal?.targetWeight ||
    settings.goal.targetWeight < 1 ||
    !settings?.goal?.targetPeriodMonths ||
    settings.goal.targetPeriodMonths < 1

  // 予算未設定の判定
  const isBudgetNotSet = !monthlyBudget || monthlyBudget.monthlyBudget === 0

  // 設定未完了かつ設定タブ以外の場合、設定ポップアップを表示
  const settingsPopupOpen = isSettingsIncomplete && tab !== 'settings'

  // 設定完了済み、予算未設定、予算タブ以外の場合、予算ポップアップを表示
  const budgetPopupOpen =
    !isSettingsIncomplete && isBudgetNotSet && tab !== 'budget'

  const handleSettingsConfirm = () => {
    setTab('settings')
  }

  const handleBudgetConfirm = () => {
    setTab('budget')
  }

  return (
    <>
      {tab === 'budget' ? (
        <Budget
          monthlyBudget={
            monthlyBudget || {
              monthlyBudget: 0,
              remainingMonthlyBudget: 0,
              todayBudget: 0,
              history: [],
            }
          }
        />
      ) : tab === 'history' ? (
        <History history={history || []} />
      ) : tab === 'settings' ? (
        <Settings settings={settings} />
      ) : (
        <Dashboard meals={meals} />
      )}

      {/* 設定未完了ポップアップ */}
      <InfoPopup
        open={settingsPopupOpen}
        onConfirm={handleSettingsConfirm}
        title={messages.settings.popup.title}
        description={messages.settings.popup.description}
        buttonLabel={messages.settings.popup.button}
        icon={Handshake}
      />

      {/* 予算未設定ポップアップ */}
      <InfoPopup
        open={budgetPopupOpen}
        onConfirm={handleBudgetConfirm}
        title={messages.budget.popup.title}
        description={messages.budget.popup.description}
        buttonLabel={messages.budget.popup.button}
        icon={Wallet}
      />
    </>
  )
}
