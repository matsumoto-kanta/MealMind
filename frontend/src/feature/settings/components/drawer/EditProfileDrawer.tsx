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
import { ProfileData, Gender, ActivityLevel } from '@/types/Settings'
import UnitInput from '../input/UnitInput'
import SegmentedControl from '../input/SegmentedControl'

interface EditProfileModalSheetProps {
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

export default function EditProfileModalSheet({
  open,
  setOpen,
  profile,
  onSave,
}: EditProfileModalSheetProps) {
  const [gender, setGender] = useState<Gender>(profile.gender)
  const [age, setAge] = useState(String(profile.age))
  const [height, setHeight] = useState(String(profile.height))
  const [weight, setWeight] = useState(String(profile.weight))
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(
    profile.activityLevel
  )

  const handleOpenChange = (value: boolean) => {
    // 開くときも閉じるときも元の値にリセット
    setGender(profile.gender)
    setAge(String(profile.age))
    setHeight(String(profile.height))
    setWeight(String(profile.weight))
    setActivityLevel(profile.activityLevel)
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
    <ModalSheet open={open} onOpenChange={handleOpenChange}>
      <ModalSheetContent className="mx-auto max-w-107.5">
        <ModalSheetHeader className="py-6">
          <ModalSheetTitle>
            {messages.settings.profile.editTitle}
          </ModalSheetTitle>
          <ModalSheetDescription className="sr-only">
            {messages.settings.profile.editTitle}
          </ModalSheetDescription>
        </ModalSheetHeader>

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
