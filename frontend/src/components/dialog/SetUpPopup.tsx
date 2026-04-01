import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '../ui/dialog'
import { LucideIcon } from 'lucide-react'
import MainButton from '../button/MainButton'

interface InfoPopupProps {
  open: boolean
  onConfirm: () => void
  title: string
  description: string
  buttonLabel: string
  icon: LucideIcon
}

export default function InfoPopup({
  open,
  onConfirm,
  title,
  description,
  buttonLabel,
  icon: Icon,
}: InfoPopupProps) {
  return (
    <Dialog open={open}>
      <DialogContent
        className="rounded-2xl max-w-100.5!"
        showCloseButton={false}
      >
        <div className="flex flex-col items-center gap-4">
          <Icon className="size-10" />

          <DialogTitle className="text-[24px] font-semibold">
            {title}
          </DialogTitle>

          <DialogDescription className="text-[14px] text-center text-muted-foreground whitespace-pre-wrap">
            {description}
          </DialogDescription>

          <DialogFooter className="w-full pt-4">
            <MainButton
              variant="primary"
              label={buttonLabel}
              onClick={onConfirm}
            ></MainButton>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
