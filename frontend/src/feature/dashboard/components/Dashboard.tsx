'use client'

import MealCard from './card/MealCard'
import { useState } from 'react'
import ShoppingList from './card/ShoppingList'
import { useAtom } from 'jotai'
import { ShoppingListCheckAtom } from '@/stores/ShoppingListCheckStore'
import { MealData } from '@/types/Meal'

interface DashboardProps {
  meals: MealData
}

export default function Dashboard({ meals }: DashboardProps) {
  const [status, setStatus] = useState<MealData['status']>(meals.status)

  /**
   * 開いている meal カードの ID を管理する Set。
   *
   * - draft 状態の場合は全カードを初期表示で開く
   */
  const [openCardIds, setOpenCardIds] = useState<Set<string>>(
    status === 'draft' ? new Set(meals.detail.map((m) => m.id)) : new Set()
  )

  // チェックボックス表示
  const [showCheck, setShowCheck] = useState(false)
  // 食材ごとのチェック状態を管理するマップ
  const [checked, setChecked] = useAtom(ShoppingListCheckAtom)

  /**
   * カードの開閉をトグルする
   *
   * @param id - 対象の meal カード ID
   */
  const handleClick = (id: string) => {
    setOpenCardIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  /**
   * 再生成されたカードを開く
   *
   * @param id - 対象の meal カード ID
   */
  const handleRegeneration = (id: string) => {
    setOpenCardIds((prev) => new Set(prev).add(id))
  }

  /**
   * 確定したカードを閉じる
   *
   * @param id - 対象の meal カード ID
   */
  const handleConfirmed = (id: string) => {
    setOpenCardIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  return (
    <div className="flex flex-col gap-7">
      <MealCard
        meals={meals}
        status={status}
        setStatus={setStatus}
        handleRegeneration={handleRegeneration}
        handleConfirmed={handleConfirmed}
        handleClick={handleClick}
        openCardIds={openCardIds}
      />

      {status === 'fixed' && (
        <ShoppingList
          mealDetail={meals.detail}
          showCheck={showCheck}
          setShowCheck={setShowCheck}
          checked={checked}
          setChecked={setChecked}
        />
      )}
    </div>
  )
}
