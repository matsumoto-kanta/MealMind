import { Button } from '../ui/button'
import { Loader2 } from 'lucide-react'

interface TitleAndButtonProps {
  title: string
  onClick: () => void
  buttonLabel: string
  disabled?: boolean
}

export default function TitleAndButton({
  title,
  onClick,
  buttonLabel,
  disabled = false,
}: TitleAndButtonProps) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="font-semibold text-[18px]">{title}</h2>
      <Button
        onClick={onClick}
        disabled={disabled}
        className="h-fit p-0 bg-transparent hover:bg-transparent disabled:opacity-50 gap-1"
      >
        {disabled && <Loader2 className="h-3 w-3 animate-spin" />}
        {buttonLabel}
      </Button>
    </div>
  )
}
