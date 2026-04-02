import { Button } from '@/components/ui/button'
import { messages } from '@/constants/messages'
import { MonthlyBudgetData } from '@/types/Budget'
import { ChevronRight } from 'lucide-react'
import { Pie, PieChart, type PieSectorShapeProps, Sector } from 'recharts'

interface MonthlyBudgetProps {
  monthlyBudget: MonthlyBudgetData
  onBudgetTap: () => void
}

/** 残り予算の割合に応じてグラフの色・ラベルのテキスト色クラスを返す */
function getBudgetStyle(remainingRatio: number) {
  if (remainingRatio < 0)
    return { color: 'var(--destructive)', labelClass: 'text-destructive' }
  if (remainingRatio < 0.2)
    return { color: 'var(--warning)', labelClass: 'text-warning' }
  return { color: 'var(--primary)', labelClass: '' }
}

export default function MonthlyBudget({
  monthlyBudget,
  onBudgetTap,
}: MonthlyBudgetProps) {
  // 使用済み金額 = 月間予算 - 残り予算
  const spent =
    monthlyBudget.monthlyBudget - monthlyBudget.remainingMonthlyBudget
  // 残りの予算額
  const remaining = monthlyBudget.remainingMonthlyBudget
  // 残り予算の割合（0〜1）。色の切り替え判定に使用（20%未満: warning、0未満: destructive）
  const remainingRatio =
    monthlyBudget.monthlyBudget > 0
      ? remaining / monthlyBudget.monthlyBudget
      : 0
  const isOverBudget = remaining < 0

  // 今日の予算（残り予算を超えないようにクランプ）
  const todayBudget = Math.min(
    monthlyBudget.todayBudget,
    Math.max(remaining, 0)
  )

  // グラフデータ: 残り → 今日の予算 → 使用済みの順で表示
  const chartData = isOverBudget
    ? [{ name: 'spent', value: 1 }]
    : [
        { name: 'remaining', value: remaining },
        { name: 'todayBudget', value: todayBudget },
        { name: 'spent', value: spent - todayBudget },
      ]

  // グラフの各セグメントの色
  const { color: remainingColor, labelClass: remainingLabelClass } =
    getBudgetStyle(remainingRatio)
  const colors = isOverBudget
    ? ['var(--spent)']
    : [remainingColor, 'var(--today)', 'var(--spent)']

  return (
    <div className="flex flex-col gap-5 text-foreground">
      <div className="flex flex-col items-center gap-7.5">
        {/* 予算額の表示 */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-[18px] leading-5 text-secondary-foreground">
            {messages.budget.monthlyBudget}
          </span>
          <Button
            onClick={onBudgetTap}
            className="flex items-center gap-0 text-[26px] leading-6.5 font-semibold text-primary bg-transparent hover:bg-transparent"
          >
            {`¥ ${monthlyBudget.monthlyBudget.toLocaleString()}`}
            <ChevronRight className="size-6" />
          </Button>
        </div>

        {/* ドーナツグラフ */}
        <div className="relative h-60 w-60">
          <PieChart width={240} height={240}>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={100}
              outerRadius={120}
              cornerRadius={10}
              paddingAngle={6}
              startAngle={90}
              endAngle={-280}
              dataKey="value"
              stroke="none"
              isAnimationActive={false}
              shape={(props: PieSectorShapeProps) => (
                <Sector {...props} fill={colors[props.index % colors.length]} />
              )}
            />
          </PieChart>

          {/* グラフ中央の残り予算ラベル */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <span
              className={`text-[36px] leading-6.5 font-bold ${remainingLabelClass}`}
            >
              {`¥ ${remaining.toLocaleString()}`}
            </span>
            <span className="text-[18px] leading-5 text-secondary-foreground">
              {messages.budget.remainingBudget}
            </span>
          </div>
        </div>

        {/* 凡例 */}
        <div className="flex items-center justify-between w-[80%]">
          <div className="flex items-center gap-2">
            <span
              className="h-3.5 w-3.5 rounded-[5px]"
              style={{ backgroundColor: remainingColor }}
            />
            <span className="text-[13px] whitespace-nowrap">
              {messages.budget.legendRemaining}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-[5px] bg-(--today)" />
            <span className="text-[13px] whitespace-nowrap">
              {`${messages.budget.legendToday} ¥${todayBudget.toLocaleString()}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-[5px] bg-(--spent)" />
            <span className="text-[13px] whitespace-nowrap">
              {`${messages.budget.legendSpent} ¥${Math.max(0, spent - todayBudget).toLocaleString()}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
