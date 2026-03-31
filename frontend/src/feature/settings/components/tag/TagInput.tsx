import { useState, type KeyboardEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface TagInputProps {
  label: string
  placeholder: string
  tags: string[]
  onAdd: (tag: string) => void
  onRemove: (tag: string) => void
}

export default function TagInput({
  label,
  placeholder,
  tags,
  onAdd,
  onRemove,
}: TagInputProps) {
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
