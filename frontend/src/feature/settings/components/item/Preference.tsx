import { messages } from '@/constants/messages'
import { PreferenceData } from '@/types/Settings'
import ItemComponent from './ItemComponent'

interface PreferenceProps {
  preference: PreferenceData
  onEdit: () => void
}

function TagList({ items }: { items: string[] }) {
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

export default function Preference({ preference, onEdit }: PreferenceProps) {
  const rows = [
    {
      label: messages.settings.preference.dislikedFoods,
      value: <TagList items={preference.dislikedFoods} />,
    },
    {
      label: messages.settings.preference.allergies,
      value: <TagList items={preference.allergies} />,
    },
  ]

  return (
    <ItemComponent
      title={messages.settings.preference.title}
      rows={rows}
      onEdit={onEdit}
    />
  )
}
