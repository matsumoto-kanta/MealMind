'use client'

import { useState } from 'react'
import { messages } from '@/constants/messages'
import {
  ModalSheet,
  ModalSheetContent,
  ModalSheetHeader,
  ModalSheetTitle,
  ModalSheetDescription,
  ModalSheetFooter,
} from '@/components/ui/modal-sheet'
import MainButton from '@/components/button/MainButton'
import UnitInput from '../input/UnitInput'

interface EditGoalDrawerProps {
  open: boolean
  setOpen: (open: boolean) => void
  currentTargetWeight: number
  currentTargetPeriodMonths: number
  onSave: (targetWeight: number, targetPeriodMonths: number) => void
}

export default function EditGoalDrawer({
  open,
  setOpen,
  currentTargetWeight,
  currentTargetPeriodMonths,
  onSave,
}: EditGoalDrawerProps) {
  const [weightValue, setWeightValue] = useState(String(currentTargetWeight))
  const [periodValue, setPeriodValue] = useState(
    String(currentTargetPeriodMonths)
  )

  const handleOpenChange = (newOpen: boolean) => {
    // 開くときも閉じるときも元の値にリセット
    setWeightValue(String(currentTargetWeight))
    setPeriodValue(String(currentTargetPeriodMonths))
    setOpen(newOpen)
  }

  const handleSave = () => {
    const parsedWeight = Number(weightValue)
    const parsedPeriod = Number(periodValue)
    if (
      !isNaN(parsedWeight) &&
      parsedWeight > 0 &&
      !isNaN(parsedPeriod) &&
      parsedPeriod > 0
    ) {
      onSave(parsedWeight, parsedPeriod)
      setOpen(false)
    }
  }

  return (
    <ModalSheet open={open} onOpenChange={handleOpenChange}>
      <ModalSheetContent className="mx-auto max-w-107.5">
        <ModalSheetHeader className="py-6">
          <ModalSheetTitle>{messages.settings.goal.editTitle}</ModalSheetTitle>
          <ModalSheetDescription className="sr-only">
            {messages.settings.goal.editTitle}
          </ModalSheetDescription>
        </ModalSheetHeader>

        <div className="px-4 flex flex-col gap-5">
          {/* 目標体重 */}
          <UnitInput
            label={messages.settings.goal.targetWeight}
            placeholder={messages.settings.goal.targetWeightPlaceholder}
            value={weightValue}
            onChange={setWeightValue}
            unit={messages.settings.unit.kg}
          />

          {/* 目標達成期間 */}
          <UnitInput
            label={messages.settings.goal.targetPeriod}
            placeholder={messages.settings.goal.targetPeriodPlaceholder}
            value={periodValue}
            onChange={setPeriodValue}
            unit={messages.settings.unit.months}
            inputMode="numeric"
          />
        </div>

        <ModalSheetFooter className="py-6 flex-row">
          <MainButton
            variant="primary"
            label={messages.settings.save}
            onClick={handleSave}
          />
        </ModalSheetFooter>
      </ModalSheetContent>
    </ModalSheet>
  )
}
