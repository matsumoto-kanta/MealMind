'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MonthlyBudget from './item/MonthlyBudget'
import { MonthlyBudgetData } from '@/types/Budget'
import BudgetHistory from './item/BudgetHistory'
import EditMonthlyBudgetDrawer from './drawer/EditMonthlyBudgetDrawer'
import { putMonthlyBudget } from '@/lib/api/budget/putMonthlyBudget'

interface BudgetProps {
  monthlyBudget: MonthlyBudgetData
}

export default function Budget({ monthlyBudget }: BudgetProps) {
  const router = useRouter()
  const [budgetData, setBudgetData] = useState<MonthlyBudgetData>(monthlyBudget)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleSave = async (newBudget: number) => {
    const response = await putMonthlyBudget(newBudget)
    if (response) {
      setBudgetData(response)
      router.refresh()
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <MonthlyBudget
        monthlyBudget={budgetData}
        onBudgetTap={() => setDrawerOpen(true)}
      />

      <BudgetHistory budgetHistory={budgetData.history} />

      <EditMonthlyBudgetDrawer
        open={drawerOpen}
        setOpen={setDrawerOpen}
        currentBudget={budgetData.monthlyBudget}
        onSave={handleSave}
      />
    </div>
  )
}
