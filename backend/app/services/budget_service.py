from google.cloud import firestore
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta, date
from calendar import monthrange

from app.repositories import MonthlyBudgetRepository, MealRepository
from app.schemas.budget import MonthlyBudgetData, BudgetHistoryItem


def get_current_year_month() -> str:
    """
    現在の年月を取得 (YYYY-MM形式)

    Returns:
        現在の年月文字列
    """
    return datetime.now().strftime("%Y-%m")


def get_monthly_budget_record(
    db: firestore.Client, user_id: str, year_month: str
) -> Optional[Dict[str, Any]]:
    """
    指定した年月の予算レコードを取得

    Args:
        db: Firestoreクライアント
        user_id: ユーザーID
        year_month: 年月 (YYYY-MM)

    Returns:
        予算データ（辞書形式）、または存在しない場合はNone
    """
    budget_repo = MonthlyBudgetRepository(db)
    return budget_repo.get(user_id, year_month)


def get_or_create_monthly_budget_record(
    db: firestore.Client, user_id: str, year_month: str, budget: int = 0
) -> Dict[str, Any]:
    """
    指定した年月の予算レコードを取得、存在しない場合は作成

    Args:
        db: Firestoreクライアント
        user_id: ユーザーID
        year_month: 年月 (YYYY-MM)
        budget: 予算額（新規作成時のみ使用）

    Returns:
        予算データ（辞書形式）
    """
    budget_repo = MonthlyBudgetRepository(db)
    record = budget_repo.get(user_id, year_month)

    if not record:
        budget_data = {
            'monthly_budget': budget,
            'spent': 0,
        }
        budget_repo.create(user_id, year_month, budget_data)
        record = budget_repo.get(user_id, year_month)

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


def get_budget_history(
    db: firestore.Client, user_id: str, limit: int = 6
) -> List[BudgetHistoryItem]:
    """
    予算履歴を取得（最新N件）

    Args:
        db: Firestoreクライアント
        user_id: ユーザーID
        limit: 取得件数

    Returns:
        予算履歴のリスト
    """
    budget_repo = MonthlyBudgetRepository(db)
    records = budget_repo.list(user_id, limit=limit)

    return [
        BudgetHistoryItem(
            year_month=record['year_month'],
            budget=record['monthly_budget'],
            spent=record['spent'],
        )
        for record in records
    ]


def get_monthly_budget_data(db: firestore.Client, user_id: str) -> MonthlyBudgetData:
    """
    月間予算データを取得

    Args:
        db: Firestoreクライアント
        user_id: ユーザーID

    Returns:
        月間予算データ
    """
    meal_repo = MealRepository(db)
    current_year_month = get_current_year_month()

    # GET APIではレコードを自動作成しない
    current_record = get_monthly_budget_record(db, user_id, current_year_month)

    # レコードが存在しない場合は初期値を返す
    if not current_record:
        history = get_budget_history(db, user_id)
        return MonthlyBudgetData(
            monthly_budget=0,
            remaining_monthly_budget=0,
            today_budget=0,
            history=history,
        )

    # 残り予算を計算
    # NOTE: spentは献立確定時に累積加算していく（月替わりで自動リセット）
    # - 献立確定API: spentに加算
    # - remainingMonthlyBudget: グラフ表示用に月間予算から使用済み金額を引いた額
    remaining_budget = max(0, current_record['monthly_budget'] - current_record['spent'])

    # 今日の献立を取得
    today = date.today()
    today_meals = meal_repo.list_by_date(user_id, today)

    # 今日の予算を計算
    if today_meals:
        # 今日の確定済み献立の合計コストを計算
        today_confirmed_cost = sum(
            meal['cost'] for meal in today_meals if meal['status'] == "confirmed"
        )

        # 確定済み献立がある場合は、その合計コストを today_budget とする
        if today_confirmed_cost > 0:
            today_budget = today_confirmed_cost
        else:
            # draft状態のみの場合は、残り予算から1日分の予算を計算
            remaining_days = get_remaining_days_in_month()
            today_budget = calculate_today_budget(remaining_budget, remaining_days)
    else:
        today_budget = 0

    # 履歴を取得
    history = get_budget_history(db, user_id)

    return MonthlyBudgetData(
        monthly_budget=current_record['monthly_budget'],
        remaining_monthly_budget=remaining_budget,
        today_budget=today_budget,
        history=history,
    )


def update_monthly_budget(
    db: firestore.Client, user_id: str, new_budget: int
) -> MonthlyBudgetData:
    """
    月間予算を更新

    Args:
        db: Firestoreクライアント
        user_id: ユーザーID
        new_budget: 新しい予算額

    Returns:
        更新後の月間予算データ
    """
    budget_repo = MonthlyBudgetRepository(db)
    current_year_month = get_current_year_month()

    record = get_or_create_monthly_budget_record(
        db, user_id, current_year_month, new_budget
    )

    # 予算を更新
    budget_repo.update(user_id, current_year_month, {'monthly_budget': new_budget})

    # 更新後のデータを返す
    return get_monthly_budget_data(db, user_id)
