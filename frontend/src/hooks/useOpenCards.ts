import { postRegeneration } from '@/lib/api/dashboard/postRegeneration'
import { putConfirmed } from '@/lib/api/dashboard/putConfirmed'
import { ShoppingListCheckAtom } from '@/stores/ShoppingListCheckStore'
import { MealData } from '@/types/Meal'
import { useAtom } from 'jotai'
import { useState } from 'react'

interface UseOpenCardsProps {
  meals?: MealData
}

export default function useOpenCards({ meals }: UseOpenCardsProps) {
  /**
   * 開いている meal カードの ID を管理する Set。
   *
   * - draft 状態の場合は全カードを初期表示で開く
   */
  const [openCardIds, setOpenCardIds] = useState<Set<string>>(
    meals?.status === 'draft'
      ? new Set(meals?.detail.map((m) => m.id))
      : new Set()
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
   * 再生成APIを呼び出し、成功時にカードを開く
   *
   * @param id - 対象の meal カード ID
   */
  const handleRegeneration = async (id: string) => {
    const response = await postRegeneration(id)
    if (response) {
      setOpenCardIds((prev) => new Set(prev).add(id))
    }
  }

  /**
   * 確定APIを呼び出し、成功時にカードを閉じる
   *
   * @param id - 対象の meal カード ID
   */
  const handleConfirmed = async (id: string) => {
    const response = await putConfirmed(id)
    if (response) {
      setOpenCardIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  return {
    openCardIds,
    setOpenCardIds,
    showCheck,
    setShowCheck,
    checked,
    setChecked,
    handleClick,
    handleRegeneration,
    handleConfirmed,
  }
}
