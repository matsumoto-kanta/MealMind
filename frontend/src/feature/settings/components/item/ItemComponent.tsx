import TitleAndButton from '@/components/button/TitleAndButton'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import { type ReactNode } from 'react'

interface ItemComponentRow {
  label: string
  value: ReactNode
}

interface ItemComponentProps {
  title: string
  rows: ItemComponentRow[]
  onEdit: () => void
}

export default function ItemComponent({
  title,
  rows,
  onEdit,
}: ItemComponentProps) {
  return (
    <div className="flex flex-col gap-5 text-foreground">
      <TitleAndButton title={title} onClick={() => {}} buttonLabel="" />
      <Button
        variant="ghost"
        onClick={onEdit}
        className="h-auto w-full flex-col items-stretch p-0 rounded-2xl border shadow-sm bg-transparent hover:bg-transparent"
      >
        {rows.map((row, index) => (
          <div
            key={row.label}
            className={`flex items-center justify-between gap-4 px-4 py-3 ${
              index < rows.length - 1
                ? 'border-b border-muted-foreground/20'
                : ''
            }`}
          >
            <span className="text-[16px] text-foreground shrink-0">
              {row.label}
            </span>
            <div className="flex items-center gap-1">
              {typeof row.value === 'string' ? (
                <span className="text-[16px] text-muted-foreground">
                  {row.value}
                </span>
              ) : (
                row.value
              )}
              <ChevronRight className="size-4 text-muted-foreground shrink-0" />
            </div>
          </div>
        ))}
      </Button>
    </div>
  )
}
