'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ShoppingList from './card/ShoppingList'
import { MealData } from '@/types/Meal'
import MealCards from './card/MealCards'
import MealEditDrawer from './drawer/MealEditDrawer'
import useOpenCards from '@/hooks/useOpenCards'
import { postGenerateMeals } from '@/lib/api/dashboard/postGenerateMeals'
import { putConfirmed } from '@/lib/api/dashboard/putConfirmed'
import { useAtom } from 'jotai'
import { isGeneratingAtom } from '@/stores/LoadingStore'

interface DashboardProps {
  meals: MealData
}

export default function Dashboard({ meals }: DashboardProps) {
  const router = useRouter()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useAtom(isGeneratingAtom)
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
    regeneratedMealsData,
    hasRegeneratedRef,
    resetConfirmedCardIds,
    loadingCardId,
  } = useOpenCards({ meals: meals?.detail?.length > 0 ? meals : undefined })

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

  const handleEditOpen = useCallback(async () => {
    if (meals?.detail?.length > 0) {
      setDrawerOpen(true)
      return
    }

    setIsGenerating(true)
    try {
      const result = await postGenerateMeals()
      if (result) {
        // すべてのmealを自動確定
        await Promise.all(result.detail.map((meal) => putConfirmed(meal.id)))
        router.refresh()
        setDrawerOpen(true)
      }
    } finally {
      setIsGenerating(false)
    }
  }, [meals, router, setIsGenerating])

  // 全カード確定時にDrawerを自動クローズ
  useEffect(() => {
    if (
      drawerOpen &&
      meals?.detail?.length > 0 &&
      confirmedCardIds.size === meals.detail.length
    ) {
      const timer = setTimeout(() => {
        handleDrawerOpenChange(false)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [confirmedCardIds.size, drawerOpen, meals, handleDrawerOpenChange])

  return (
    <div className="flex flex-col gap-7">
      <MealCards
        meals={meals}
        onEditOpen={handleEditOpen}
        handleClick={handleClick}
        openCardIds={openCardIds}
        isGenerating={isGenerating}
      />

      {meals?.detail?.length > 0 && (
        <>
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
            regeneratedMealsData={regeneratedMealsData}
            loadingCardId={loadingCardId}
          />
        </>
      )}
    </div>
  )
}
