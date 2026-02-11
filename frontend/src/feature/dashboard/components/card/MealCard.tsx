import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, Sun, Sunrise, Sunset } from 'lucide-react'
import { messages } from '@/constants/messages'
import { motion } from 'framer-motion'
import TitleAndButton from '@/components/button/TitleAndButton'
import { MealData } from '@/types/Meal'

interface MealCardProps {
  meals: MealData
  status: MealData['status']
  setStatus: React.Dispatch<React.SetStateAction<MealData['status']>>
  handleRegeneration: (id: string) => void
  handleConfirmed: (id: string) => void
  handleClick: (id: string) => void
  openCardIds: Set<string>
}

export default function MealCard({
  meals,
  status,
  setStatus,
  handleRegeneration,
  handleConfirmed,
  handleClick,
  openCardIds,
}: MealCardProps) {
  const mealLabel = {
    morning: (
      <span className="flex items-center gap-1">
        <Sunrise size={14} /> {messages.dashboard.morning}
      </span>
    ),
    lunch: (
      <span className="flex items-center gap-1">
        <Sun size={14} /> {messages.dashboard.lunch}
      </span>
    ),
    dinner: (
      <span className="flex items-center gap-1">
        <Sunset size={14} /> {messages.dashboard.dinner}
      </span>
    ),
  }

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
        className={`flex gap-8 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar ${status === 'draft' ? 'flex-col' : 'flex-row'}`}
      >
        {meals.detail.map((meal) => (
          <div key={meal.id} className="snap-center">
            <motion.div layout>
              <Card className="rounded-2xl bg-muted/80 border-0 min-w-72">
                <CardContent onClick={() => handleClick(meal.id)}>
                  <div className="flex justify-between">
                    <div className="text-[12px] text-muted-foreground pb-2">
                      {mealLabel[meal.type]}
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-muted-foreground transition-transform ${openCardIds.has(meal.id) ? 'rotate-180' : ''}`}
                    />
                  </div>

                  {/* 料理名 */}
                  <CardHeader className="text-foreground p-0 gap-0 pb-2">
                    <CardTitle>{meal.name}</CardTitle>
                  </CardHeader>

                  {/* kcal + cost */}
                  <div className="text-[12px] text-muted-foreground pb-3">
                    {meal.kcal} {messages.dashboard.kcal} ・ ¥{meal.cost}
                  </div>

                  <motion.div
                    layout
                    initial={false}
                    animate={
                      openCardIds.has(meal.id)
                        ? { height: 'auto', opacity: 1 }
                        : { height: 0, opacity: 0 }
                    }
                    transition={{
                      type: 'spring',
                      stiffness: 280,
                      damping: 30,
                    }}
                    className="overflow-hidden"
                  >
                    {/* タンパク質・脂質・炭水化物 */}
                    <div className="flex justify-around text-[12px] pb-4">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-foreground font-semibold">
                          {meal.protein}g
                        </span>
                        <span className="text-muted-foreground">
                          {messages.dashboard.protein}
                        </span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-foreground font-semibold">
                          {meal.fat}g
                        </span>
                        <span className="text-muted-foreground">
                          {messages.dashboard.fat}
                        </span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-foreground font-semibold">
                          {meal.carbohydrates}g
                        </span>
                        <span className="text-muted-foreground">
                          {messages.dashboard.carbohydrates}
                        </span>
                      </div>
                    </div>

                    {/* 食材 */}
                    <div className="flex flex-col gap-1 text-[12px] text-muted-foreground">
                      {meal.ingredients.map((i) => (
                        <div key={i.name} className="flex justify-between">
                          <span>
                            {i.name}（{i.amount}）
                          </span>
                          <span>¥{i.price}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </CardContent>

                {/* ボタン */}
                {status === 'draft' && (
                  <CardFooter className="flex gap-2 pt-4 px-2">
                    <Button
                      onClick={() => handleRegeneration(meal.id)}
                      className="flex-1 text-destructive border border-destructive bg-muted/80 hover:bg-muted/80 hover:cursor-pointer"
                    >
                      {messages.dashboard.regeneration}
                    </Button>
                    <Button
                      onClick={() => handleConfirmed(meal.id)}
                      className="flex-1 text-primary border border-primary bg-muted/80 hover:bg-muted/80 hover:cursor-pointer"
                    >
                      {messages.dashboard.confirmed}
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  )
}
