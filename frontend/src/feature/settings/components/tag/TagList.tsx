import { messages } from '@/constants/messages'

interface TagListProps {
  items: string[]
}

export default function TagList({ items }: TagListProps) {
  if (items.length === 0) {
    return (
      <span className="text-[13px] text-muted-foreground">
        {messages.settings.preference.noItems}
      </span>
    )
  }

  return (
    <div className="flex flex-wrap gap-1.5 justify-end">
      {items.map((item) => (
        <span
          key={item}
          className="text-[13px] px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground"
        >
          {item}
        </span>
      ))}
    </div>
  )
}
