'use client'

import { useState } from 'react'
import { messages } from '@/constants/messages'
import { Input } from '@/components/ui/input'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@/components/ui/drawer'
import MainButton from '@/components/button/MainButton'

interface EditGoalDrawerProps {
  open: boolean
  setOpen: (open: boolean) => void
  currentTargetWeight: number
  onSave: (targetWeight: number) => void
}

export default function EditGoalDrawer({
  open,
  setOpen,
  currentTargetWeight,
  onSave,
}: EditGoalDrawerProps) {
  const [value, setValue] = useState(String(currentTargetWeight))

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setValue(String(currentTargetWeight))
    }
    setOpen(newOpen)
  }

  const handleSave = () => {
    const parsed = Number(value)
    if (!isNaN(parsed) && parsed > 0) {
      onSave(parsed)
      setOpen(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="mx-auto max-w-107.5">
        <DrawerHeader className="py-6">
          <DrawerTitle>{messages.settings.goal.editTitle}</DrawerTitle>
          <DrawerDescription className="sr-only">
            {messages.settings.goal.editTitle}
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4">
          <div className="relative">
            <Input
              type="text"
              inputMode="decimal"
              placeholder={messages.settings.goal.targetWeightPlaceholder}
              value={value}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9.]/g, '')
                setValue(v)
              }}
              className="text-[16px] pr-10"
              autoFocus
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[14px]">
              {messages.settings.unit.kg}
            </span>
          </div>
        </div>

        <DrawerFooter className="py-6 flex-row">
          <MainButton
            variant="primary"
            label={messages.settings.save}
            onClick={handleSave}
          />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
