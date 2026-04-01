import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ChevronDown, Sun, Sunrise, Sunset } from 'lucide-react'
import { messages } from '@/constants/messages'
import { motion } from 'framer-motion'
import { MealData, MealDetailData } from '@/types/Meal'
import MainButton from '../button/MainButton'

interface MealCardProps {
  status: MealData['status'] | 'confirmed'
  meal: MealDetailData
  handleRegeneration: (id: string) => void
  handleConfirmed: (id: string) => void
  handleClick: (id: string) => void
  openCardIds: Set<string>
  cardClassName?: string
  isLoading?: boolean
}

export default function MealCard({
  status,
  meal,
  handleRegeneration,
  handleConfirmed,
  handleClick,
  openCardIds,
  cardClassName,
  isLoading = false,
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
    <motion.div
      layout
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.3 }}
    >
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

        {/* ボタン
            - draft: 再生成 + 確定ボタンを表示
            - confirmed: 再生成ボタンのみ（確定済みなので確定ボタンは非表示）
            - fixed: ボタン非表示（ダッシュボード・履歴表示用） */}
        {(status === 'draft' || status === 'confirmed') && (
          <CardFooter className="flex gap-2 pt-4 px-2">
            <MainButton
              variant="destructive"
              label={messages.dashboard.regeneration}
              onClick={() => handleRegeneration(meal.id)}
              disabled={isLoading}
            />
            {status === 'draft' && (
              <MainButton
                variant="primary"
                label={messages.dashboard.confirmed}
                onClick={() => handleConfirmed(meal.id)}
                disabled={isLoading}
              />
            )}
          </CardFooter>
        )}
      </Card>
    </motion.div>
  )
}
