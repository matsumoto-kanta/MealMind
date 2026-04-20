'use client'

import { useState } from 'react'
import { messages } from '@/constants/messages'
import { Input } from '@/components/ui/input'
import {
  ModalSheet,
  ModalSheetContent,
  ModalSheetHeader,
  ModalSheetTitle,
  ModalSheetDescription,
  ModalSheetFooter,
} from '@/components/ui/modal-sheet'
import MainButton from '@/components/button/MainButton'

interface EditMonthlyBudgetModalSheetProps {
  open: boolean
  setOpen: (open: boolean) => void
  currentBudget: number
  onSave: (newBudget: number) => void
}

export default function EditMonthlyBudgetModalSheet({
  open,
  setOpen,
  currentBudget,
  onSave,
}: EditMonthlyBudgetModalSheetProps) {
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
    <ModalSheet open={open} onOpenChange={handleOpenChange}>
      <ModalSheetContent className="mx-auto max-w-107.5">
        <ModalSheetHeader className="py-6">
          <ModalSheetTitle>{messages.budget.editBudget}</ModalSheetTitle>
          <ModalSheetDescription className="sr-only">
            {messages.budget.editBudget}
          </ModalSheetDescription>
        </ModalSheetHeader>

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

        <ModalSheetFooter className="py-6 flex-row">
          <MainButton
            variant="primary"
            label={messages.budget.save}
            onClick={handleSave}
          />
        </ModalSheetFooter>
      </ModalSheetContent>
    </ModalSheet>
  )
}
