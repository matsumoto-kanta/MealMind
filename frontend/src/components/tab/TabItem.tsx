interface TabItemProps {
  icon: React.ReactNode
  label: string
}

export default function TabItem({ icon, label }: TabItemProps) {
  return (
    <div className="flex flex-col items-center gap-2 text-current">
      {icon}
      <span className="text-[12px]">{label}</span>
    </div>
  )
}
