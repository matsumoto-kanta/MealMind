import { messages } from '@/constants/messages'
import TitleAndButton from '@/components/button/TitleAndButton'
import { MealData } from '@/types/Meal'
import MealCard from '@/components/card/MealCard'
import { Utensils } from 'lucide-react'
import MainButton from '@/components/button/MainButton'

interface MealCardsProps {
  meals: MealData
  onEditOpen: () => void | Promise<void>
  handleClick: (id: string) => void
  openCardIds: Set<string>
  isGenerating: boolean
}

export default function MealCards({
  meals,
  onEditOpen,
  handleClick,
  openCardIds,
  isGenerating,
}: MealCardsProps) {
  return (
    <div className="flex flex-col gap-5 text-foreground">
      {meals.detail.length > 0 ? (
        <>
          <TitleAndButton
            title={messages.dashboard.todayMenu}
            onClick={onEditOpen}
            buttonLabel={messages.dashboard.edit}
            disabled={isGenerating}
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
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-muted-foreground/30 py-10">
          <Utensils className="size-10 text-muted-foreground/50" />
          <span className="text-[14px] text-muted-foreground">
            {messages.dashboard.noMeals}
          </span>
          <div>
            <MainButton
              variant="primary"
              label={messages.dashboard.generateMenu}
              onClick={onEditOpen}
              disabled={isGenerating}
            />
          </div>
        </div>
      )}
    </div>
  )
}
