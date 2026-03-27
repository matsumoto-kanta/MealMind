'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LogOut } from 'lucide-react'
import { messages } from '@/constants/messages'
import { postLogout } from '@/lib/api/auth/postLogout'

export default function Logout() {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleLogout = async () => {
    const success = await postLogout()
    setDialogOpen(false)

    if (success) {
      router.push('/login')
    }
  }

  return (
    <>
      <Button
        variant="destructive"
        onClick={() => setDialogOpen(true)}
        className="w-full h-14 rounded-2xl text-[16px] font-medium shadow-sm gap-4 mt-4"
      >
        <LogOut className="size-5" />
        {messages.settings.logout.button}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-100.5!" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{messages.settings.logout.confirmTitle}</DialogTitle>
            <DialogDescription>
              {messages.settings.logout.confirmDescription}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-4">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="flex-1"
            >
              {messages.settings.logout.cancel}
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="flex-1"
            >
              {messages.settings.logout.confirmButton}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
