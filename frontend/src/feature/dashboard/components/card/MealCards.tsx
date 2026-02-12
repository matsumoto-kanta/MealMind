import { messages } from '@/constants/messages'
import TitleAndButton from '@/components/button/TitleAndButton'
import { MealData } from '@/types/Meal'
import MealCard from '@/components/card/MealCard'

interface MealCardsProps {
  meals: MealData
  status: MealData['status']
  setStatus: React.Dispatch<React.SetStateAction<MealData['status']>>
  handleRegeneration: (id: string) => void
  handleConfirmed: (id: string) => void
  handleClick: (id: string) => void
  openCardIds: Set<string>
}

export default function MealCards({
  meals,
  status,
  setStatus,
  handleRegeneration,
  handleConfirmed,
  handleClick,
  openCardIds,
}: MealCardsProps) {
  return (
    <div className="flex flex-col gap-5 text-foreground">
      <TitleAndButton
        title={messages.dashboard.todayMenu}
        onClick={() => setStatus(status === 'draft' ? 'fixed' : 'draft')}
        buttonLabel={
          status === 'draft'
            ? messages.dashboard.confirmed
            : messages.dashboard.regeneration
        }
      />

      <div
        className={`flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar ${status === 'draft' ? 'flex-col gap-4' : 'flex-row gap-8'}`}
      >
        {meals.detail.map((meal) => (
          <div key={meal.id} className="snap-center">
            <MealCard
              status={status}
              meal={meal}
              handleRegeneration={handleRegeneration}
              handleConfirmed={handleConfirmed}
              handleClick={handleClick}
              openCardIds={openCardIds}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
