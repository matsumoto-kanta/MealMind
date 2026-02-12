'use client'

import { useState } from 'react'
import ShoppingList from './card/ShoppingList'
import { MealData } from '@/types/Meal'
import MealCards from './card/MealCards'
import useOpenCards from '@/hooks/useOpenCards'

interface DashboardProps {
  meals: MealData
}

export default function Dashboard({ meals }: DashboardProps) {
  const [status, setStatus] = useState<MealData['status']>(meals.status)
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
        status={status}
        setStatus={setStatus}
        handleRegeneration={handleRegeneration}
        handleConfirmed={handleConfirmed}
        handleClick={handleClick}
        openCardIds={openCardIds}
      />

      {status === 'fixed' && (
        <ShoppingList
          mealDetail={meals.detail}
          showCheck={showCheck}
          setShowCheck={setShowCheck}
          checked={checked}
          setChecked={setChecked}
        />
      )}
    </div>
  )
}
