import { Input } from '@/components/ui/input'

interface UnitInputProps {
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  unit: string
  inputMode?: 'numeric' | 'decimal'
}

export default function UnitInput({
  label,
  placeholder,
  value,
  onChange,
  unit,
  inputMode = 'decimal',
}: UnitInputProps) {
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
