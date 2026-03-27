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

interface MealEditDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  meals: MealData
  handleRegeneration: (id: string) => void
  handleConfirmed: (id: string) => void
  handleClick: (id: string) => void
  openCardIds: Set<string>
}

export default function MealEditDrawer({
  open,
  onOpenChange,
  meals,
  handleRegeneration,
  handleConfirmed,
  handleClick,
  openCardIds,
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
          {meals.detail.map((meal) => (
            <MealCard
              key={meal.id}
              status="draft"
              meal={meal}
              handleRegeneration={handleRegeneration}
              handleConfirmed={handleConfirmed}
              handleClick={handleClick}
              openCardIds={openCardIds}
            />
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
