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
import { PreferenceData } from '@/types/Settings'
import TagInput from '../tag/TagInput'

interface EditPreferenceModalSheetProps {
  open: boolean
  setOpen: (open: boolean) => void
  preference: PreferenceData
  onSave: (preference: PreferenceData) => void
}

export default function EditPreferenceModalSheet({
  open,
  setOpen,
  preference,
  onSave,
}: EditPreferenceModalSheetProps) {
  const [dislikedFoods, setDislikedFoods] = useState<string[]>(
    preference.dislikedFoods
  )
  const [allergies, setAllergies] = useState<string[]>(preference.allergies)

  const handleOpenChange = (value: boolean) => {
    // 開くときも閉じるときも元の値にリセット
    setDislikedFoods(preference.dislikedFoods)
    setAllergies(preference.allergies)
    setOpen(value)
  }

  const handleSave = () => {
    onSave({ dislikedFoods, allergies })
    setOpen(false)
  }

  return (
    <ModalSheet open={open} onOpenChange={handleOpenChange}>
      <ModalSheetContent className="mx-auto max-w-107.5">
        <ModalSheetHeader className="py-6">
          <ModalSheetTitle>
            {messages.settings.preference.editTitle}
          </ModalSheetTitle>
          <ModalSheetDescription className="sr-only">
            {messages.settings.preference.editTitle}
          </ModalSheetDescription>
        </ModalSheetHeader>

        <div className="px-4 flex flex-col gap-5">
          <TagInput
            label={messages.settings.preference.dislikedFoods}
            placeholder={messages.settings.preference.dislikedFoodsPlaceholder}
            tags={dislikedFoods}
            onAdd={(tag) => setDislikedFoods([...dislikedFoods, tag])}
            onRemove={(tag) =>
              setDislikedFoods(dislikedFoods.filter((f) => f !== tag))
            }
          />

          <TagInput
            label={messages.settings.preference.allergies}
            placeholder={messages.settings.preference.allergiesPlaceholder}
            tags={allergies}
            onAdd={(tag) => setAllergies([...allergies, tag])}
            onRemove={(tag) => setAllergies(allergies.filter((a) => a !== tag))}
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
