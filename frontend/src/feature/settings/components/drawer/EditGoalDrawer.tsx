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

function UnitInput({
  label,
  placeholder,
  value,
  onChange,
  unit,
  inputMode = 'decimal',
}: {
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  unit: string
  inputMode?: 'numeric' | 'decimal'
}) {
  const pattern = inputMode === 'numeric' ? /[^0-9]/g : /[^0-9.]/g
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-medium text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        <Input
          type="text"
          inputMode={inputMode}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(pattern, ''))}
          className="text-[16px] pr-12"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[14px]">
          {unit}
        </span>
      </div>
    </div>
  )
}

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
    if (newOpen) {
      setWeightValue(String(currentTargetWeight))
      setPeriodValue(String(currentTargetPeriodMonths))
    }
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
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="mx-auto max-w-107.5">
        <DrawerHeader className="py-6">
          <DrawerTitle>{messages.settings.goal.editTitle}</DrawerTitle>
          <DrawerDescription className="sr-only">
            {messages.settings.goal.editTitle}
          </DrawerDescription>
        </DrawerHeader>

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
