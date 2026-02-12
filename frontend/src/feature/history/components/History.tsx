'use client'

import MealCard from '@/components/card/MealCard'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import useOpenCards from '@/hooks/useOpenCards'
import { postHistory } from '@/lib/api/history/postHistory'
import { MealData } from '@/types/Meal'
import { useEffect, useRef, useState } from 'react'

interface HistoryProps {
  history: MealData[]
}

export default function History({ history }: HistoryProps) {
  const PAGE_SIZE = 14
  const [items, setItems] = useState<MealData[]>(history)
  const pageRef = useRef(0)
  const loadingRef = useRef(false)
  const [hasMore, setHasMore] = useState(true)
  const {
    openCardIds,
    setOpenCardIds,
    handleClick,
    handleRegeneration,
    handleConfirmed,
  } = useOpenCards({})

  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  // 無限スクロール処理
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return

    // IntersectionObserverを作成（初回マウント時に1回だけ）
    const observer = new IntersectionObserver(
      async (entries) => {
        // このコールバックは、要素が画面内に入るたびに何度も呼ばれる
        if (entries[0].isIntersecting && !loadingRef.current) {
          loadingRef.current = true
          const nextPage = pageRef.current + 1

          // 次のページのデータを取得
          const response = await postHistory(nextPage)

          // 既存データに追加（日付重複を防ぐようにフィルター処理）
          setItems((prev) => {
            const existingDates = new Set(prev.map((item) => item.date))
            const newItems = response.filter(
              (item) => !existingDates.has(item.date)
            )
            return [...prev, ...newItems]
          })

          // データが足りない場合は終了
          if (response.length < PAGE_SIZE) {
            setHasMore(false)
          }

          pageRef.current = nextPage
          loadingRef.current = false
        }
      },
      { rootMargin: '200px' } // 要素の200px手前でロード開始
    )

    // 監視開始
    observer.observe(loadMoreRef.current)

    // クリーンアップ: hasMoreがfalseになったら監視解除
    return () => observer.disconnect()
  }, [hasMore])

  return (
    <div className="flex flex-col">
      <Accordion
        type="single"
        collapsible
        onValueChange={() => setOpenCardIds(new Set())}
      >
        {items.map((item, index) => (
          <AccordionItem
            key={item.date}
            value={item.date + String(index)}
            className="border-0"
          >
            <AccordionTrigger className="text-[16px] font-semibold px-2 hover:no-underline">
              {item.date}
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar flex-col">
                {item.detail.map((meal) => (
                  <div key={meal.id} className="snap-center">
                    <MealCard
                      status="fixed"
                      meal={meal}
                      handleRegeneration={handleRegeneration}
                      handleConfirmed={handleConfirmed}
                      handleClick={handleClick}
                      openCardIds={openCardIds}
                      cardClassName="py-2"
                    />
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* スクロールセンサー */}
      {hasMore && <div ref={loadMoreRef} />}
    </div>
  )
}
