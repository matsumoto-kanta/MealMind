import TitleAndButton from '@/components/button/TitleAndButton'
import { messages } from '@/constants/messages'
import { BudgetHistoryType } from '@/types/Budget'

interface BudgetHistoryProps {
  budgetHistory: BudgetHistoryType[]
}

export default function BudgetHistory({ budgetHistory }: BudgetHistoryProps) {
  return (
    <div className="flex flex-col gap-5 text-foreground">
      <TitleAndButton
        title={messages.budget.monthlyHistory}
        onClick={() => {}}
        buttonLabel=""
      />

      <div className="flex flex-col text-foreground">
        {budgetHistory.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <span className="text-center text-[14px]">
              {messages.budget.noHistory}
            </span>
          </div>
        ) : (
          <ul className="text-[16px] px-2">
            <li className="grid grid-cols-[1fr_100px_100px] items-center pb-2 text-[12px] text-muted-foreground">
              <span>{messages.common.unit.yearMonth}</span>
              <span className="text-end">{messages.budget.monthlyBudget}</span>
              <span className="text-end">{messages.budget.legendSpent}</span>
            </li>
            {budgetHistory.map((item) => (
              <li
                key={item.yearMonth}
                className="grid grid-cols-[1fr_100px_100px] items-center py-3 border-b border-muted-foreground/20 last:border-none"
              >
                <span className="font-semibold">{item.yearMonth}</span>
                <span className="text-end">
                  {item.budget.toLocaleString()}
                  {messages.common.unit.yen}
                </span>
                <span className="text-muted-foreground text-end">
                  {item.spent.toLocaleString()}
                  {messages.common.unit.yen}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
