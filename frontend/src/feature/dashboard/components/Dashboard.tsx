'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ShoppingList from './card/ShoppingList'
import { MealData } from '@/types/Meal'
import MealCards from './card/MealCards'
import MealEditDrawer from './drawer/MealEditDrawer'
import useOpenCards from '@/hooks/useOpenCards'

interface DashboardProps {
  meals: MealData
}

export default function Dashboard({ meals }: DashboardProps) {
  const router = useRouter()
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
    confirmedCardIds,
    regeneratedCardIds,
    hasRegeneratedRef,
    resetConfirmedCardIds,
  } = useOpenCards({ meals })

  const handleDrawerOpenChange = useCallback(
    (open: boolean) => {
      setDrawerOpen(open)
      if (!open) {
        if (hasRegeneratedRef.current) {
          router.refresh()
          hasRegeneratedRef.current = false
        }
        resetConfirmedCardIds()
      }
    },
    [hasRegeneratedRef, resetConfirmedCardIds, router]
  )

  // 全カード確定時にDrawerを自動クローズ
  useEffect(() => {
    if (
      drawerOpen &&
      meals.detail.length > 0 &&
      confirmedCardIds.size === meals.detail.length
    ) {
      const timer = setTimeout(() => {
        handleDrawerOpenChange(false)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [
    confirmedCardIds.size,
    drawerOpen,
    meals.detail.length,
    handleDrawerOpenChange,
  ])

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
        onOpenChange={handleDrawerOpenChange}
        meals={meals}
        handleRegeneration={handleRegeneration}
        handleConfirmed={handleConfirmed}
        handleClick={handleClick}
        openCardIds={openCardIds}
        confirmedCardIds={confirmedCardIds}
        regeneratedCardIds={regeneratedCardIds}
      />
    </div>
  )
}
