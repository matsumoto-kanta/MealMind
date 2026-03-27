import { messages } from '@/constants/messages'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '../ui/dialog'
import { Handshake } from 'lucide-react'

interface SetUpPopupProps {
  open: boolean
  setOpen: (value: boolean) => void
}

export default function SetUpPopup({ open, setOpen }: SetUpPopupProps) {
  return (
    <Dialog open={open} onOpenChange={(value) => setOpen(value)}>
      <DialogTitle />
      <DialogDescription />
      <DialogContent className="rounded-2xl max-w-100.5!">
        <div className="flex flex-col items-center gap-4">
          <Handshake className="size-10" />

          <h1 className="text-[24px] font-semibold">
            {messages.settings.popup.title}
          </h1>

          <span className="text-[14px] text-center text-muted-foreground whitespace-pre-wrap">
            {messages.settings.popup.description}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
