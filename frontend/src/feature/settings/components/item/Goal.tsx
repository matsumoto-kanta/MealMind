import { messages } from '@/constants/messages'
import { GoalData } from '@/types/Settings'
import ItemComponent from './ItemComponent'

interface GoalProps {
  goal: GoalData
  currentWeight: number
  onEdit: () => void
}

export default function Goal({ goal, currentWeight, onEdit }: GoalProps) {
  // 目標体重と現在体重の差分を小数第1位で丸める
  const diff = Math.round((goal.targetWeight - currentWeight) * 10) / 10
  // 正なら「+」、負ならそのまま、0なら「±0」で表示（\u00B1 = ±）
  const diffLabel = diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : '\u00B10'

  const rows = [
    {
      label: messages.settings.goal.targetWeight,
      value: `${goal.targetWeight}${messages.settings.unit.kg}`,
    },
    {
      label: messages.settings.goal.diff,
      value: `${diffLabel}${messages.settings.unit.kg}`,
    },
  ]

  return (
    <ItemComponent
      title={messages.settings.goal.title}
      rows={rows}
      onEdit={onEdit}
    />
  )
}
