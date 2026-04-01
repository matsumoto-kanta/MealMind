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
        <TabsList className="w-full h-21.5 bg-muted rounded-none">
          {tabs.map(({ key, label, icon: Icon }) => (
            <TabsTrigger
              key={key}
              value={key}
              disabled={isAnyLoading && key !== tab}
              className="flex-1 text-secondary-foreground data-[state=active]:text-primary-foreground dark:data-[state=active]:text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
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
