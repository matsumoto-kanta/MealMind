'use client'

import { Toaster } from '@/components/ui/sonner'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { toast } from 'sonner'
import {
  showToastAtom,
  toastMessageAtom,
  toastErrorMessageAtom,
} from '@/stores/ToastStore'
import MainTab, { tabs } from '@/components/tab/MainTab'
import { tabAtom } from '@/stores/TabStore'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [tab, setTab] = useAtom(tabAtom)
  const [showToast, setShowToast] = useAtom(showToastAtom)
  const toastMessage = useAtomValue(toastMessageAtom)
  const toastErrorMessage = useAtomValue(toastErrorMessageAtom)

  const currentTab = tabs.find((t) => t.key === tab)
  const title = currentTab?.label ?? ''

  useEffect(() => {
    if (showToast) {
      toast.dismiss() // 既存のものを全て消すので、常に最新の1個だけ表示
      if (toastErrorMessage) {
        toast.error(toastErrorMessage, {
          style: {
            backgroundColor: 'var(--destructive)',
            color: 'white',
            borderColor: 'var(--destructive)',
          },
        })
      } else {
        toast.success(toastMessage, {
          style: {
            backgroundColor: 'var(--primary)',
            color: 'white',
            borderColor: 'var(--primary)',
          },
        })
      }
    }
  }, [showToast, toastMessage, toastErrorMessage, setShowToast])

  return (
    <>
      <div className="relative min-h-screen">
        <div className="px-5">
          {/* タイトル */}
          <header className="sticky top-0 z-5 bg-background">
            <h1 className="text-[24px] font-semibold pt-13.5 pb-7">{title}</h1>
          </header>

          {/* メインコンテンツ */}
          <main className="pb-21.5">{children}</main>
        </div>

        {/* タブバー */}
        <MainTab tab={tab} onChange={setTab} />
      </div>
      <Toaster position="top-center" />
    </>
  )
}
