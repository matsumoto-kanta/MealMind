import { messages } from '@/constants/messages'
import { ProfileData } from '@/types/Settings'
import ItemComponent from './ItemComponent'

interface ProfileProps {
  profile: ProfileData
  onEdit: () => void
}

const genderLabel: Record<ProfileData['gender'], string> = {
  male: messages.settings.profile.genderMale,
  female: messages.settings.profile.genderFemale,
  other: messages.settings.profile.genderOther,
}

const activityLabel: Record<ProfileData['activityLevel'], string> = {
  low: messages.settings.profile.activityLow,
  medium: messages.settings.profile.activityMedium,
  high: messages.settings.profile.activityHigh,
}

export default function Profile({ profile, onEdit }: ProfileProps) {
  const rows = [
    {
      label: messages.settings.profile.gender,
      value: genderLabel[profile.gender],
    },
    {
      label: messages.settings.profile.age,
      value: `${profile.age}${messages.settings.unit.years}`,
    },
    {
      label: messages.settings.profile.height,
      value: `${profile.height}${messages.settings.unit.cm}`,
    },
    {
      label: messages.settings.profile.weight,
      value: `${profile.weight}${messages.settings.unit.kg}`,
    },
    {
      label: messages.settings.profile.activityLevel,
      value: activityLabel[profile.activityLevel],
    },
  ]

  return (
    <ItemComponent
      title={messages.settings.profile.title}
      rows={rows}
      onEdit={onEdit}
    />
  )
}
