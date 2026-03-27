'use client'

import { useState, type KeyboardEvent } from 'react'
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
import { PreferenceData } from '@/types/Settings'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EditPreferenceDrawerProps {
  open: boolean
  setOpen: (open: boolean) => void
  preference: PreferenceData
  onSave: (preference: PreferenceData) => void
}

function TagInput({
  label,
  placeholder,
  tags,
  onAdd,
  onRemove,
}: {
  label: string
  placeholder: string
  tags: string[]
  onAdd: (tag: string) => void
  onRemove: (tag: string) => void
}) {
  const [inputValue, setInputValue] = useState('')

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      const trimmed = inputValue.trim()
      if (!tags.includes(trimmed)) {
        onAdd(trimmed)
      }
      setInputValue('')
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-medium text-muted-foreground">
        {label}
      </label>
      <Input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="text-[16px]"
      />
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Button
              key={tag}
              type="button"
              onClick={() => onRemove(tag)}
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-[13px] text-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              {tag}
              <X className="size-3.5" />
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function EditPreferenceDrawer({
  open,
  setOpen,
  preference,
  onSave,
}: EditPreferenceDrawerProps) {
  const [dislikedFoods, setDislikedFoods] = useState<string[]>(
    preference.dislikedFoods
  )
  const [allergies, setAllergies] = useState<string[]>(preference.allergies)

  const handleOpenChange = (value: boolean) => {
    if (value) {
      setDislikedFoods(preference.dislikedFoods)
      setAllergies(preference.allergies)
    }
    setOpen(value)
  }

  const handleSave = () => {
    onSave({ dislikedFoods, allergies })
    setOpen(false)
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="mx-auto max-w-107.5">
        <DrawerHeader className="py-6">
          <DrawerTitle>{messages.settings.preference.editTitle}</DrawerTitle>
          <DrawerDescription className="sr-only">
            {messages.settings.preference.editTitle}
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 flex flex-col gap-6">
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
