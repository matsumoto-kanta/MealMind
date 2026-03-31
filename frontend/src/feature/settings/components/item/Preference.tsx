import { messages } from '@/constants/messages'
import { PreferenceData } from '@/types/Settings'
import ItemComponent from './ItemComponent'
import TagList from '../tag/TagList'

interface PreferenceProps {
  preference: PreferenceData
  onEdit: () => void
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
