import TitleAndButton from '@/components/button/TitleAndButton'
import { Checkbox } from '@/components/ui/checkbox'
import { messages } from '@/constants/messages'
import { MealDetailData } from '@/types/Meal'

interface ShoppingListProps {
  mealDetail: MealDetailData[]
  showCheck: boolean
  setShowCheck: React.Dispatch<React.SetStateAction<boolean>>
  checked: Record<string, boolean>
  setChecked: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
}

export default function ShoppingList({
  mealDetail,
  showCheck,
  setShowCheck,
  checked,
  setChecked,
}: ShoppingListProps) {
  /**
   * mealDetail に含まれる複数の料理データから、
   * 同名の食材をまとめて集約したマップを生成する。
   *
   * - name が同じ食材は price を合算する
   * - amount は文字列として ` + ` 区切りで結合する
   */
  const ingredientMap = mealDetail
    .flatMap((m) => m.ingredients)
    .reduce(
      (acc, ing) => {
        if (!acc[ing.name]) {
          acc[ing.name] = {
            name: ing.name,
            amount: ing.amount,
            price: ing.price,
          }
        } else {
          acc[ing.name].price += ing.price
          acc[ing.name].amount += ` + ${ing.amount}`
        }
        return acc
      },
      {} as Record<string, { name: string; amount: string; price: number }>
    )

  /**
   * ingredientMap を配列形式に変換した食材リスト
   */
  const ingredientList = Object.values(ingredientMap)

  return (
    <div className="flex flex-col gap-5 text-foreground">
      <TitleAndButton
        title={messages.dashboard.shoppingList}
        onClick={() => {
          setShowCheck((prev) => {
            return !prev
          })
        }}
        buttonLabel={
          showCheck ? messages.dashboard.done : messages.dashboard.edit
        }
      />

      <ul className="text-[16px] px-2">
        {ingredientList.map((ing) => {
          const isChecked = checked[ing.name] ?? false

          return (
            <li
              key={ing.name}
              className={`grid items-center py-3 border-b border-muted-foreground/20 last:border-none transition-all duration-200 ${
                showCheck
                  ? 'grid-cols-[28px_1fr_100px_68px]'
                  : 'grid-cols-[1fr_100px_68px]'
              }`}
            >
              {showCheck && (
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={(checked) =>
                    setChecked((prev) => ({
                      ...prev,
                      [ing.name]: Boolean(checked),
                    }))
                  }
                  className="h-5 w-5 rounded-full data-[state=checked]:text-accent-foreground"
                />
              )}

              {/* 食材名 */}
              <span
                className={`font-semibold transition-all ${isChecked ? 'line-through text-muted-foreground' : ''}`}
              >
                {ing.name}
              </span>
              {/* 量 */}
              <span className="text-muted-foreground text-[14px] text-end">
                {ing.amount}
              </span>
              {/* 値段 */}
              <span className="text-end">
                {ing.price}
                {messages.common.unit.yen}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
