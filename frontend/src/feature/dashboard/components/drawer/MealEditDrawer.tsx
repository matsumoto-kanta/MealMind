import { messages } from '@/constants/messages'
import { MealData, MealDetailData } from '@/types/Meal'
import MealCard from '@/components/card/MealCard'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { AnimatePresence } from 'framer-motion'

interface MealEditDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  meals: MealData
  handleRegeneration: (id: string) => void
  handleConfirmed: (id: string) => void
  handleClick: (id: string) => void
  openCardIds: Set<string>
  confirmedCardIds: Set<string>
  regeneratedCardIds: Set<string>
  regeneratedMealsData: Map<string, MealDetailData>
  loadingCardId: string | null
}

export default function MealEditDrawer({
  open,
  onOpenChange,
  meals,
  handleRegeneration,
  handleConfirmed,
  handleClick,
  openCardIds,
  confirmedCardIds,
  regeneratedCardIds,
  regeneratedMealsData,
  loadingCardId,
}: MealEditDrawerProps) {
  // 再生成中はドロワーを閉じられないようにする
  const isRegenerating = loadingCardId !== null

  const handleDrawerOpenChange = (open: boolean) => {
    // 再生成中でドロワーを閉じようとしている場合は無視
    if (!open && isRegenerating) {
      return
    }
    onOpenChange(open)
  }

  return (
    <Drawer
      open={open}
      onOpenChange={handleDrawerOpenChange}
      dismissible={!isRegenerating}
    >
      <DrawerContent className="mx-auto max-w-107.5">
        <DrawerHeader className="py-6">
          <DrawerTitle>{messages.dashboard.todayMenu}</DrawerTitle>
          <DrawerDescription className="sr-only">
            {messages.dashboard.todayMenu}
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 pb-6">
          <AnimatePresence>
            {meals?.detail
              ?.filter((meal) => !confirmedCardIds.has(meal.id))
              .map((meal) => {
                // 再生成されたmealのデータがあればそれを使用、なければオリジナルのデータを使用
                const displayMeal = regeneratedMealsData.get(meal.id) || meal

                return (
                  <MealCard
                    key={meal.id}
                    // 再生成されたmealは常にdraft状態
                    status={
                      regeneratedCardIds.has(meal.id)
                        ? 'draft'
                        : (meal.status ?? 'draft')
                    }
                    meal={displayMeal}
                    handleRegeneration={handleRegeneration}
                    handleConfirmed={handleConfirmed}
                    handleClick={handleClick}
                    openCardIds={openCardIds}
                    isLoading={loadingCardId === meal.id}
                  />
                )
              })}
          </AnimatePresence>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
