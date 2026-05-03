'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import TabItem from './TabItem'
import { BadgeJapaneseYen, History, House, Settings } from 'lucide-react'
import { messages } from '@/constants/messages'
import { Tab } from '@/types/Tab'
import { useAtomValue } from 'jotai'
import { isAnyLoadingAtom } from '@/stores/LoadingStore'

interface MainTabProps {
  tab: Tab
  onChange: (v: Tab) => void
}

export const tabs = [
  {
    key: 'dashboard',
    label: messages.common.tab.home,
    icon: House,
  },
  {
    key: 'budget',
    label: messages.common.tab.budget,
    icon: BadgeJapaneseYen,
  },
  {
    key: 'history',
    label: messages.common.tab.log,
    icon: History,
  },
  {
    key: 'settings',
    label: messages.common.tab.settings,
    icon: Settings,
  },
] as const

export default function MainTab({ tab, onChange }: MainTabProps) {
  const isAnyLoading = useAtomValue(isAnyLoadingAtom)

  return (
    <div className="fixed bottom-0 left-1/2 z-5 w-full max-w-107.5 -translate-x-1/2">
      <Tabs
        value={tab}
        onValueChange={(v) => !isAnyLoading && onChange(v as Tab)}
      >
        <TabsList className="w-full h-21.5 rounded-none bg-white/10 dark:bg-slate-900/90 backdrop-blur-sm border-t border-white/20 dark:border-slate-700/50">
          {tabs.map(({ key, label, icon: Icon }) => (
            <TabsTrigger
              key={key}
              value={key}
              disabled={isAnyLoading && key !== tab}
              className="flex-1 text-secondary-foreground transition-all duration-300 data-[state=active]:bg-white/20 dark:data-[state=active]:bg-white/10 data-[state=active]:text-primary-foreground dark:data-[state=active]:text-primary-foreground data-[state=active]:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <TabItem
                icon={
                  <Icon
                    className="stroke-current"
                    style={{ width: '28px', height: '28px' }}
                  />
                }
                label={label}
              />
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}
