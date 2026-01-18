'use client'

import { tabAtom } from '@/stores/TabStore'
import { useAtomValue } from 'jotai'
import Dashboard from './dashboard/components/Dashboard'
import History from './history/components/History'
import Budget from './budget/components/Budget'
import Settings from './settings/components/Settings'

export default function Main() {
  const tab = useAtomValue(tabAtom)

  return (
    <>
      {tab === 'history' ? (
        <History />
      ) : tab === 'budget' ? (
        <Budget />
      ) : tab === 'settings' ? (
        <Settings />
      ) : (
        <Dashboard />
      )}
    </>
  )
}
