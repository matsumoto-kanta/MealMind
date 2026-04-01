import { useState } from 'react'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface MainButtonProps {
  variant: 'primary' | 'destructive'
  label: string
  onClick: () => void | Promise<void>
  disabled?: boolean
}

const variantStyles = {
  primary:
    'text-primary border-primary hover:bg-primary/10 hover:text-foreground',
  destructive:
    'text-destructive border-destructive hover:bg-destructive/10 hover:text-foreground',
}

export default function MainButton({
  variant,
  label,
  onClick,
  disabled,
}: MainButtonProps) {
  const [pending, setPending] = useState(false)

  const handleClick = async () => {
    setPending(true)
    try {
      await onClick()
    } finally {
      setPending(false)
    }
  }

  const isLoading = disabled || pending

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={handleClick}
      disabled={isLoading}
      className={cn('flex-1 bg-muted/80 gap-2', variantStyles[variant])}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {label}
    </Button>
  )
}
