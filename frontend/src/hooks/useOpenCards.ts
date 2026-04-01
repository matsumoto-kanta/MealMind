import { postRegeneration } from '@/lib/api/dashboard/postRegeneration'
import { putConfirmed } from '@/lib/api/dashboard/putConfirmed'
import { ShoppingListCheckAtom } from '@/stores/ShoppingListCheckStore'
import { loadingCardIdAtom } from '@/stores/LoadingStore'
import { MealData, MealDetailData } from '@/types/Meal'
import { useAtom } from 'jotai'
import { useRef, useState } from 'react'

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

  // 確定済みカードID管理
  const [confirmedCardIds, setConfirmedCardIds] = useState<Set<string>>(
    new Set()
  )
  // 再生成済みカードID管理
  // meals はサーバーデータでドロワー中に更新されないため、
  // 再生成した meal を追跡し status を 'draft' にオーバーライドする
  const [regeneratedCardIds, setRegeneratedCardIds] = useState<Set<string>>(
    new Set()
  )
  // 再生成されたmealのデータを保持
  const [regeneratedMealsData, setRegeneratedMealsData] = useState<
    Map<string, MealDetailData>
  >(new Map())
  // 再生成API呼び出しフラグ
  const hasRegeneratedRef = useRef(false)
  // 再生成中のカードID（ローディング表示用）- グローバルステートで管理
  const [loadingCardId, setLoadingCardId] = useAtom(loadingCardIdAtom)

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
    setLoadingCardId(id)
    try {
      const response = await postRegeneration(id)
      if (response) {
        setOpenCardIds((prev) => new Set(prev).add(id))
        setRegeneratedCardIds((prev) => new Set(prev).add(id))
        // 再生成されたmealのデータを保存
        setRegeneratedMealsData((prev) => {
          const next = new Map(prev)
          next.set(id, response)
          return next
        })
        hasRegeneratedRef.current = true
      }
    } finally {
      setLoadingCardId(null)
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
      setConfirmedCardIds((prev) => new Set(prev).add(id))
    }
  }

  const resetConfirmedCardIds = () => {
    setConfirmedCardIds(new Set())
    setRegeneratedCardIds(new Set())
    setRegeneratedMealsData(new Map())
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
    confirmedCardIds,
    regeneratedCardIds,
    regeneratedMealsData,
    hasRegeneratedRef,
    resetConfirmedCardIds,
    loadingCardId,
  }
}
