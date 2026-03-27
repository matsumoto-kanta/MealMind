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
import { ProfileData, Gender, ActivityLevel } from '@/types/Settings'
import { Button } from '@/components/ui/button'

interface EditProfileDrawerProps {
  open: boolean
  setOpen: (open: boolean) => void
  profile: ProfileData
  onSave: (profile: ProfileData) => void
}

const genderOptions: { value: Gender; label: string }[] = [
  { value: 'male', label: messages.settings.profile.genderMale },
  { value: 'female', label: messages.settings.profile.genderFemale },
  { value: 'other', label: messages.settings.profile.genderOther },
]

const activityOptions: { value: ActivityLevel; label: string }[] = [
  { value: 'low', label: messages.settings.profile.activityLow },
  { value: 'medium', label: messages.settings.profile.activityMedium },
  { value: 'high', label: messages.settings.profile.activityHigh },
]

function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-medium text-muted-foreground">
        {label}
      </label>
      <div className="flex gap-2">
        {options.map((option) => (
          <Button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`h-10.5 flex-1 py-2.5 rounded-lg text-[14px] font-medium transition-colors border ${
              value === option.value
                ? 'bg-primary text-accent-foreground border-primary'
                : 'bg-muted/50 text-muted-foreground border-transparent hover:text-accent-foreground'
            }`}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

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

export default function EditProfileDrawer({
  open,
  setOpen,
  profile,
  onSave,
}: EditProfileDrawerProps) {
  const [gender, setGender] = useState<Gender>(profile.gender)
  const [age, setAge] = useState(String(profile.age))
  const [height, setHeight] = useState(String(profile.height))
  const [weight, setWeight] = useState(String(profile.weight))
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(
    profile.activityLevel
  )

  const handleOpenChange = (value: boolean) => {
    if (value) {
      setGender(profile.gender)
      setAge(String(profile.age))
      setHeight(String(profile.height))
      setWeight(String(profile.weight))
      setActivityLevel(profile.activityLevel)
    }
    setOpen(value)
  }

  const handleSave = () => {
    const parsedAge = Number(age)
    const parsedHeight = Number(height)
    const parsedWeight = Number(weight)
    if (
      !isNaN(parsedAge) &&
      parsedAge > 0 &&
      !isNaN(parsedHeight) &&
      parsedHeight > 0 &&
      !isNaN(parsedWeight) &&
      parsedWeight > 0
    ) {
      onSave({
        gender,
        age: parsedAge,
        height: parsedHeight,
        weight: parsedWeight,
        activityLevel,
      })
      setOpen(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="mx-auto max-w-107.5">
        <DrawerHeader className="py-6">
          <DrawerTitle>{messages.settings.profile.editTitle}</DrawerTitle>
          <DrawerDescription className="sr-only">
            {messages.settings.profile.editTitle}
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 flex flex-col gap-5">
          {/* 性別 */}
          <SegmentedControl
            label={messages.settings.profile.gender}
            options={genderOptions}
            value={gender}
            onChange={setGender}
          />

          {/* 年齢 */}
          <UnitInput
            label={messages.settings.profile.age}
            placeholder={messages.settings.profile.agePlaceholder}
            value={age}
            onChange={setAge}
            unit={messages.settings.unit.years}
            inputMode="numeric"
          />

          {/* 身長 */}
          <UnitInput
            label={messages.settings.profile.height}
            placeholder={messages.settings.profile.heightPlaceholder}
            value={height}
            onChange={setHeight}
            unit={messages.settings.unit.cm}
          />

          {/* 体重 */}
          <UnitInput
            label={messages.settings.profile.weight}
            placeholder={messages.settings.profile.weightPlaceholder}
            value={weight}
            onChange={setWeight}
            unit={messages.settings.unit.kg}
          />

          {/* 活動量 */}
          <SegmentedControl
            label={messages.settings.profile.activityLevel}
            options={activityOptions}
            value={activityLevel}
            onChange={setActivityLevel}
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
