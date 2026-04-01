from pydantic import BaseModel, Field
from typing import List


class BudgetHistoryItem(BaseModel):
    """予算履歴アイテム"""

    year_month: str = Field(..., alias="yearMonth", description="年月 (例: 2025-03)")
    budget: int = Field(..., description="月の予算")
    spent: int = Field(..., description="使用金額")

    class Config:
        populate_by_name = True


class MonthlyBudgetData(BaseModel):
    """月間予算データ"""

    monthly_budget: int = Field(..., alias="monthlyBudget", description="月間予算")
    remaining_monthly_budget: int = Field(
        ..., alias="remainingMonthlyBudget", description="月の残り予算"
    )
    today_budget: int = Field(..., alias="todayBudget", description="今日の予想消費額")
    history: List[BudgetHistoryItem] = Field(..., description="月間履歴")

    class Config:
        populate_by_name = True


class MonthlyBudgetResponse(BaseModel):
    """月間予算レスポンス"""

    monthly_budget: MonthlyBudgetData = Field(..., alias="monthlyBudget")

    class Config:
        populate_by_name = True


class UpdateMonthlyBudgetRequest(BaseModel):
    """月間予算更新リクエスト"""

    monthly_budget: int = Field(
        ..., alias="monthlyBudget", ge=0, description="月間予算額"
    )

    class Config:
        populate_by_name = True
