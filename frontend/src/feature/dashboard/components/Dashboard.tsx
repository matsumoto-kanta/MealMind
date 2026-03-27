'use client'

import { useState } from 'react'
import ShoppingList from './card/ShoppingList'
import { MealData } from '@/types/Meal'
import MealCards from './card/MealCards'
import MealEditDrawer from './drawer/MealEditDrawer'
import useOpenCards from '@/hooks/useOpenCards'

interface DashboardProps {
  meals: MealData
}

export default function Dashboard({ meals }: DashboardProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const {
    openCardIds,
    showCheck,
    setShowCheck,
    checked,
    setChecked,
    handleClick,
    handleRegeneration,
    handleConfirmed,
  } = useOpenCards({ meals })

  return (
    <div className="flex flex-col gap-7">
      <MealCards
        meals={meals}
        onEditOpen={() => setDrawerOpen(true)}
        handleClick={handleClick}
        openCardIds={openCardIds}
      />

      <ShoppingList
        mealDetail={meals.detail}
        showCheck={showCheck}
        setShowCheck={setShowCheck}
        checked={checked}
        setChecked={setChecked}
      />

      <MealEditDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        meals={meals}
        handleRegeneration={handleRegeneration}
        handleConfirmed={handleConfirmed}
        handleClick={handleClick}
        openCardIds={openCardIds}
      />
    </div>
  )
}
