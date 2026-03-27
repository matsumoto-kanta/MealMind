import { messages } from '@/constants/messages'
import { MealData } from '@/types/Meal'
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
}: MealEditDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto max-w-107.5">
        <DrawerHeader className="py-6">
          <DrawerTitle>{messages.dashboard.todayMenu}</DrawerTitle>
          <DrawerDescription className="sr-only">
            {messages.dashboard.todayMenu}
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 pb-6">
          <AnimatePresence>
            {meals.detail
              .filter((meal) => !confirmedCardIds.has(meal.id))
              .map((meal) => (
                <MealCard
                  key={meal.id}
                  // meals はサーバーデータなのでドロワー中は更新されない。
                  // 再生成APIが成功した meal は regeneratedCardIds で追跡し、
                  // ローカルで status を 'draft' に戻して確定ボタンを再表示する。
                  status={
                    regeneratedCardIds.has(meal.id)
                      ? 'draft'
                      : (meal.status ?? 'draft')
                  }
                  meal={meal}
                  handleRegeneration={handleRegeneration}
                  handleConfirmed={handleConfirmed}
                  handleClick={handleClick}
                  openCardIds={openCardIds}
                />
              ))}
          </AnimatePresence>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
