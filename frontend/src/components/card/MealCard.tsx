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
import { MealData, MealDetailData } from '@/types/Meal'

interface MealCardProps {
  status: MealData['status']
  meal: MealDetailData
  handleRegeneration: (id: string) => void
  handleConfirmed: (id: string) => void
  handleClick: (id: string) => void
  openCardIds: Set<string>
  cardClassName?: string
}

export default function MealCard({
  status,
  meal,
  handleRegeneration,
  handleConfirmed,
  handleClick,
  openCardIds,
  cardClassName,
}: MealCardProps) {
  const mealLabel = {
    breakfast: (
      <span className="flex items-center gap-1">
        <Sunrise size={14} /> {messages.dashboard.breakfast}
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
    <motion.div layout>
      <Card
        className={`rounded-2xl bg-muted/80 border-0 min-w-72 ${cardClassName}`}
      >
        <CardContent onClick={() => handleClick(meal.id)}>
          <div className="flex justify-between">
            <div className="text-[12px] text-muted-foreground pb-2">
              {mealLabel[meal.id]}
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
          <div className="text-[12px] text-muted-foreground">
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
            <div className="flex justify-around text-[12px] py-4">
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
                  <span>¥{i.price.toLocaleString()}</span>
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
  )
}
