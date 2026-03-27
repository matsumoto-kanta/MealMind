import { messages } from '@/constants/messages'
import TitleAndButton from '@/components/button/TitleAndButton'
import { MealData } from '@/types/Meal'
import MealCard from '@/components/card/MealCard'

interface MealCardsProps {
  meals: MealData
  onEditOpen: () => void
  handleClick: (id: string) => void
  openCardIds: Set<string>
}

export default function MealCards({
  meals,
  onEditOpen,
  handleClick,
  openCardIds,
}: MealCardsProps) {
  return (
    <div className="flex flex-col gap-5 text-foreground">
      <TitleAndButton
        title={messages.dashboard.todayMenu}
        onClick={onEditOpen}
        buttonLabel={messages.dashboard.edit}
      />

      <div className="flex flex-row gap-8 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar">
        {meals.detail.map((meal) => (
          <div key={meal.id} className="snap-center">
            <MealCard
              status="fixed"
              meal={meal}
              handleRegeneration={() => {}}
              handleConfirmed={() => {}}
              handleClick={handleClick}
              openCardIds={openCardIds}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
