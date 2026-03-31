import { Button } from '@/components/ui/button'

interface SegmentedControlProps<T extends string> {
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}

export default function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
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
