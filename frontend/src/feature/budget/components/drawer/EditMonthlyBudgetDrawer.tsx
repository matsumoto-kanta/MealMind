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

interface EditMonthlyBudgetDrawerProps {
  open: boolean
  setOpen: (open: boolean) => void
  currentBudget: number
  onSave: (newBudget: number) => void
}

export default function EditMonthlyBudgetDrawer({
  open,
  setOpen,
  currentBudget,
  onSave,
}: EditMonthlyBudgetDrawerProps) {
  const [value, setValue] = useState(String(currentBudget))

  const handleOpenChange = (open: boolean) => {
    // 開くときも閉じるときも元の値にリセット
    setValue(String(currentBudget))
    setOpen(open)
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
          <DrawerTitle>{messages.budget.editBudget}</DrawerTitle>
          <DrawerDescription className="sr-only">
            {messages.budget.editBudget}
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              ¥
            </span>
            <Input
              type="text"
              inputMode="numeric"
              placeholder={messages.budget.budgetPlaceholder}
              value={value}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9]/g, '')
                setValue(v)
              }}
              className="pl-8 text-[16px]"
              autoFocus
            />
          </div>
        </div>

        <DrawerFooter className="py-6 flex-row">
          <MainButton
            variant="primary"
            label={messages.budget.save}
            onClick={handleSave}
          />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
