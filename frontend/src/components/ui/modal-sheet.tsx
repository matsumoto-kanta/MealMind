'use client'

import * as React from 'react'
import { Sheet } from 'react-modal-sheet'
import { cn } from '@/lib/utils'

interface ModalSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dismissible?: boolean
  children: React.ReactNode
}

function ModalSheet({
  open,
  onOpenChange,
  dismissible = true,
  children,
}: ModalSheetProps) {
  return (
    <Sheet
      isOpen={open}
      onClose={() => onOpenChange(false)}
      disableDrag={!dismissible}
      detent="content"
    >
      <Sheet.Container>
        <Sheet.Header />
        {children}
      </Sheet.Container>
      <Sheet.Backdrop onTap={() => dismissible && onOpenChange(false)} />
    </Sheet>
  )
}

function ModalSheetContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Sheet.Content
      style={{ backgroundColor: 'transparent' }}
      data-slot="modal-sheet-content"
    >
      <div
        className={cn(
          'flex h-full flex-col bg-background rounded-t-lg',
          className
        )}
        {...props}
      >
        {children}
      </div>
    </Sheet.Content>
  )
}

function ModalSheetHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="modal-sheet-header"
      className={cn('flex flex-col gap-0.5 p-4 md:gap-1.5', className)}
      {...props}
    />
  )
}

function ModalSheetFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="modal-sheet-footer"
      className={cn('mt-auto flex flex-col gap-2 p-4', className)}
      {...props}
    />
  )
}

function ModalSheetTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      data-slot="modal-sheet-title"
      className={cn('font-semibold text-foreground text-lg', className)}
      {...props}
    />
  )
}

function ModalSheetDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="modal-sheet-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

export {
  ModalSheet,
  ModalSheetContent,
  ModalSheetHeader,
  ModalSheetFooter,
  ModalSheetTitle,
  ModalSheetDescription,
}
