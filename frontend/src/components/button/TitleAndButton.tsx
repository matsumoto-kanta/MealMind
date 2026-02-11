import { Button } from '../ui/button'

interface TitleAndButtonProps {
  title: string
  onClick: () => void
  buttonLabel: string
}

export default function TitleAndButton({
  title,
  onClick,
  buttonLabel,
}: TitleAndButtonProps) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="font-semibold text-[18px]">{title}</h2>
      <Button
        onClick={onClick}
        className="h-fit p-0 bg-transparent hover:bg-transparent"
      >
        {buttonLabel}
      </Button>
    </div>
  )
}
