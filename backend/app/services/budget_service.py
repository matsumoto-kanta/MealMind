from sqlalchemy.orm import Session
from typing import Optional, List
from uuid import UUID
from datetime import datetime, timedelta
from calendar import monthrange

from app.models.monthly_budget import MonthlyBudget
from app.schemas.budget import MonthlyBudgetData, BudgetHistoryItem


def get_current_year_month() -> str:
    """
    現在の年月を取得 (YYYY-MM形式)

    Returns:
        現在の年月文字列
    """
    return datetime.now().strftime("%Y-%m")


def get_monthly_budget_record(
    db: Session, user_id: UUID, year_month: str
) -> Optional[MonthlyBudget]:
    """
    指定した年月の予算レコードを取得

    Args:
        db: データベースセッション
        user_id: ユーザーID
        year_month: 年月 (YYYY-MM)

    Returns:
        MonthlyBudgetモデルのインスタンス、または存在しない場合はNone
    """
    return (
        db.query(MonthlyBudget)
        .filter(
            MonthlyBudget.user_id == user_id,
            MonthlyBudget.year_month == year_month
        )
        .first()
    )


def get_or_create_monthly_budget_record(
    db: Session, user_id: UUID, year_month: str, budget: int = 0
) -> MonthlyBudget:
    """
    指定した年月の予算レコードを取得、存在しない場合は作成

    Args:
        db: データベースセッション
        user_id: ユーザーID
        year_month: 年月 (YYYY-MM)
        budget: 予算額（新規作成時のみ使用）

    Returns:
        MonthlyBudgetモデルのインスタンス
    """
    record = get_monthly_budget_record(db, user_id, year_month)

    if not record:
        record = MonthlyBudget(
            user_id=user_id,
            year_month=year_month,
            monthly_budget=budget,
            spent=0
        )
        db.add(record)
        db.commit()
        db.refresh(record)

    return record


def calculate_today_budget(remaining_budget: int, remaining_days: int) -> int:
    """
    今日の予算を計算

    Args:
        remaining_budget: 残り予算
        remaining_days: 残り日数

    Returns:
        今日の予算
    """
    if remaining_days <= 0:
        return 0
    return max(0, remaining_budget // remaining_days)


def get_remaining_days_in_month() -> int:
    """
    今月の残り日数を取得（今日を含む）

    Returns:
        残り日数
    """
    now = datetime.now()
    last_day = monthrange(now.year, now.month)[1]
    remaining = last_day - now.day + 1
    return max(1, remaining)


def get_budget_history(db: Session, user_id: UUID, limit: int = 6) -> List[BudgetHistoryItem]:
    """
    予算履歴を取得（最新N件）

    Args:
        db: データベースセッション
        user_id: ユーザーID
        limit: 取得件数

    Returns:
        予算履歴のリスト
    """
    records = (
        db.query(MonthlyBudget)
        .filter(MonthlyBudget.user_id == user_id)
        .order_by(MonthlyBudget.year_month.desc())
        .limit(limit)
        .all()
    )

    return [
        BudgetHistoryItem(
            year_month=record.year_month,
            budget=record.monthly_budget,
            spent=record.spent
        )
        for record in records
    ]


def get_monthly_budget_data(db: Session, user_id: UUID) -> MonthlyBudgetData:
    """
    月間予算データを取得

    Args:
        db: データベースセッション
        user_id: ユーザーID

    Returns:
        月間予算データ
    """
    current_year_month = get_current_year_month()
    current_record = get_or_create_monthly_budget_record(db, user_id, current_year_month)

    # 残り予算を計算
    # NOTE: spentは献立生成時に今日の金額を累積加算していく（月替わりでリセット）
    # - 献立生成API: todayBudgetを計算 → spentに加算
    # - remainingMonthlyBudget: グラフ表示用に月間予算から使用済み金額を引いた額
    remaining_budget = max(0, current_record.monthly_budget - current_record.spent)

    # 履歴を取得
    history = get_budget_history(db, user_id)

    return MonthlyBudgetData(
        monthly_budget=current_record.monthly_budget,
        remaining_monthly_budget=remaining_budget,
        today_budget=0,  # 今日の予算は別APIで管理
        history=history
    )


def update_monthly_budget(db: Session, user_id: UUID, new_budget: int) -> MonthlyBudgetData:
    """
    月間予算を更新

    Args:
        db: データベースセッション
        user_id: ユーザーID
        new_budget: 新しい予算額

    Returns:
        更新後の月間予算データ
    """
    current_year_month = get_current_year_month()
    record = get_or_create_monthly_budget_record(db, user_id, current_year_month, new_budget)

    # 予算を更新
    record.monthly_budget = new_budget
    db.commit()
    db.refresh(record)

    # 更新後のデータを返す
    return get_monthly_budget_data(db, user_id)
