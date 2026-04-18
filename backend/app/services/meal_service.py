from google.cloud import firestore
from typing import List, Optional, Dict, Any
from datetime import date, datetime, timedelta, timezone
from calendar import monthrange
from fastapi import HTTPException

from app.repositories import MealRepository, UserSettingsRepository
from app.services.ai_service import GeminiAIService
from app.services import budget_service
from app.schemas.meal import MealData, MealDetailData, IngredientData, HistoryResponse


class MealService:
    def __init__(self, db: firestore.Client):
        self.db = db
        self.meal_repo = MealRepository(db)
        self.settings_repo = UserSettingsRepository(db)
        self.ai_service = GeminiAIService()

    def get_today_meals(self, user_id: str) -> List[Dict[str, Any]]:
        """今日の確定済み献立を取得"""
        today = date.today()
        meals = self.meal_repo.list_by_date(user_id, today)
        # 確定済みのみフィルター
        return [m for m in meals if m['status'] == "confirmed"]

    def generate_daily_meals(self, user_id: str) -> List[Dict[str, Any]]:
        """1日分の献立を生成（draft状態でDB保存）"""
        # ユーザー設定を取得
        user_settings = self._get_user_settings(user_id)
        if not user_settings:
            raise HTTPException(status_code=400, detail="User settings not found")

        # 1日の予算を計算
        daily_budget = self._calculate_daily_budget(user_id)

        # 過去21日間の献立名を取得
        past_meal_names = self._get_past_meal_names(user_id, days=21)

        # AIで献立生成
        try:
            meals_data = self.ai_service.generate_daily_meals(
                gender=user_settings['gender'],
                age=user_settings['age'],
                height=user_settings['height'],
                weight=user_settings['weight'],
                activity_level=user_settings['activity_level'],
                target_weight=user_settings['target_weight'],
                target_period_months=user_settings['target_period_months'],
                daily_budget=daily_budget,
                disliked_foods=user_settings.get('disliked_foods', []),
                allergies=user_settings.get('allergies', []),
                past_meal_names=past_meal_names,
            )
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Failed to generate meals: {str(e)}"
            )

        # 既存のdraft献立を削除
        today = date.today()
        existing_meals = self.meal_repo.list_by_date(user_id, today)
        for meal in existing_meals:
            if meal['status'] == "draft":
                self.meal_repo.delete(user_id, meal['id'])

        # 新しい献立をDBに保存
        meals = []
        for meal_data in meals_data:
            meal_doc = {
                'meal_date': today,
                'meal_type': meal_data["meal_type"],
                'status': "draft",
                'name': meal_data["name"],
                'kcal': meal_data["kcal"],
                'cost': meal_data["cost"],
                'protein': meal_data["protein"],
                'fat': meal_data["fat"],
                'carbohydrates': meal_data["carbohydrates"],
                'ingredients': meal_data["ingredients"],
            }
            meal_id = self.meal_repo.create(user_id, meal_doc)
            meal = self.meal_repo.get_by_id(user_id, meal_id)
            meals.append(meal)

        return meals

    def regenerate_single_meal(self, user_id: str, meal_type: str) -> Dict[str, Any]:
        """1食分の献立を再生成"""
        # ユーザー設定を取得
        user_settings = self._get_user_settings(user_id)
        if not user_settings:
            raise HTTPException(status_code=400, detail="User settings not found")

        # 1日の予算を計算
        daily_budget = self._calculate_daily_budget(user_id)

        # 今日の他の食事を取得
        today = date.today()
        all_meals = self.meal_repo.list_by_date(user_id, today)
        other_meals = [m for m in all_meals if m['meal_type'] != meal_type]

        # 他の食事の合計コストを計算
        other_meals_cost = sum(meal['cost'] for meal in other_meals)
        meal_budget = daily_budget - other_meals_cost

        # 他の食事のデータを辞書形式に変換
        other_meals_data = [
            {"name": meal['name'], "kcal": meal['kcal'], "cost": meal['cost']}
            for meal in other_meals
        ]

        # 過去21日間の献立名を取得
        past_meal_names = self._get_past_meal_names(user_id, days=21)

        # AIで献立再生成
        try:
            meal_data = self.ai_service.regenerate_single_meal(
                meal_type=meal_type,
                gender=user_settings['gender'],
                age=user_settings['age'],
                height=user_settings['height'],
                weight=user_settings['weight'],
                activity_level=user_settings['activity_level'],
                target_weight=user_settings['target_weight'],
                target_period_months=user_settings['target_period_months'],
                meal_budget=meal_budget,
                disliked_foods=user_settings.get('disliked_foods', []),
                allergies=user_settings.get('allergies', []),
                past_meal_names=past_meal_names,
                other_meals_today=other_meals_data,
            )
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Failed to regenerate meal: {str(e)}"
            )

        if not meal_data:
            raise HTTPException(status_code=500, detail="Failed to generate meal data")

        # 既存の献立を取得
        existing_meal = self.meal_repo.get_by_date_and_type(user_id, today, meal_type)

        if existing_meal:
            # 既存の献立が確定済みの場合、spentから前のコストを引く
            if existing_meal['status'] == "confirmed":
                from app.repositories import MonthlyBudgetRepository
                budget_repo = MonthlyBudgetRepository(self.db)
                year_month = budget_service.get_current_year_month()
                budget_record = budget_repo.get(user_id, year_month)
                if budget_record:
                    old_spent = budget_record['spent']
                    new_spent = max(0, old_spent - existing_meal['cost'])
                    budget_repo.update(user_id, year_month, {'spent': new_spent})

            # 既存の献立を更新
            update_data = {
                'name': meal_data["name"],
                'kcal': meal_data["kcal"],
                'cost': meal_data["cost"],
                'protein': meal_data["protein"],
                'fat': meal_data["fat"],
                'carbohydrates': meal_data["carbohydrates"],
                'ingredients': meal_data["ingredients"],
                'status': "draft",
            }
            self.meal_repo.update(user_id, existing_meal['id'], update_data)
            meal = self.meal_repo.get_by_id(user_id, existing_meal['id'])
        else:
            # 新規に作成
            meal_doc = {
                'meal_date': today,
                'meal_type': meal_type,
                'status': "draft",
                'name': meal_data["name"],
                'kcal': meal_data["kcal"],
                'cost': meal_data["cost"],
                'protein': meal_data["protein"],
                'fat': meal_data["fat"],
                'carbohydrates': meal_data["carbohydrates"],
                'ingredients': meal_data["ingredients"],
            }
            meal_id = self.meal_repo.create(user_id, meal_doc)
            meal = self.meal_repo.get_by_id(user_id, meal_id)

        return meal

    def confirm_meal(self, user_id: str, meal_type: str) -> Dict[str, Any]:
        """献立を確定（statusをconfirmedに変更、spentを更新）"""
        today = date.today()
        meal = self.meal_repo.get_by_date_and_type(user_id, today, meal_type)

        if not meal:
            raise HTTPException(status_code=404, detail="Meal not found")

        if meal['status'] == "confirmed":
            # 既に確定済みの場合はそのまま返す
            return meal

        # statusをconfirmedに変更
        self.meal_repo.update_status(user_id, meal['id'], "confirmed")

        # 予算のspentを更新
        from app.repositories import MonthlyBudgetRepository
        budget_repo = MonthlyBudgetRepository(self.db)
        year_month = budget_service.get_current_year_month()
        budget_record = budget_repo.get(user_id, year_month)

        # 予算レコードが存在しない場合は作成（monthly_budget=0で作成）
        if not budget_record:
            budget_repo.create(user_id, year_month, {'monthly_budget': 0, 'spent': 0})
            budget_record = budget_repo.get(user_id, year_month)

        # spentを更新
        new_spent = budget_record['spent'] + meal['cost']
        budget_repo.update(user_id, year_month, {'spent': new_spent})

        # 更新後の献立を取得
        return self.meal_repo.get_by_id(user_id, meal['id'])

    def get_meal_history(self, user_id: str, page: int) -> HistoryResponse:
        """献立履歴を取得（ページネーション対応）"""
        page_size = 7  # 1週間分
        offset = page * page_size

        # 確定済みの献立を取得（過去30日分を取得してから処理）
        start_date = date.today() - timedelta(days=365)  # 1年分
        end_date = date.today() - timedelta(days=1)  # 昨日まで

        meals = self.meal_repo.list_by_date_range(user_id, start_date, end_date)
        # 確定済みのみフィルター
        confirmed_meals = [m for m in meals if m['status'] == "confirmed"]

        # 日付ごとにグループ化
        history_dict: Dict[date, List[Dict[str, Any]]] = {}
        for meal in confirmed_meals:
            meal_date = meal['meal_date'].date() if isinstance(meal['meal_date'], datetime) else meal['meal_date']
            if meal_date not in history_dict:
                history_dict[meal_date] = []
            history_dict[meal_date].append(meal)

        # 日付でソートして、ページネーション
        sorted_dates = sorted(history_dict.keys(), reverse=True)
        paginated_dates = sorted_dates[offset : offset + page_size]

        # レスポンスを構築
        history_data = []
        for meal_date in paginated_dates:
            meals_for_date = history_dict[meal_date]

            # 献立をMealDetailDataに変換
            detail_list = [
                MealDetailData(
                    id=meal['meal_type'],
                    name=meal['name'],
                    kcal=meal['kcal'],
                    cost=meal['cost'],
                    protein=meal['protein'],
                    fat=meal['fat'],
                    carbohydrates=meal['carbohydrates'],
                    status=meal['status'],
                    ingredients=[
                        IngredientData(**ingredient) for ingredient in meal['ingredients']
                    ],
                )
                for meal in meals_for_date
            ]

            # 全体のステータスを判定
            overall_status = (
                "fixed"
                if all(m['status'] == "confirmed" for m in meals_for_date)
                else "draft"
            )

            meal_data = MealData(
                status=overall_status,
                date=meal_date.isoformat() if meal_date else None,
                detail=detail_list,
            )

            history_data.append(meal_data)

        return HistoryResponse(history=history_data)

    def _get_user_settings(self, user_id: str) -> Optional[Dict[str, Any]]:
        """ユーザー設定を取得"""
        return self.settings_repo.get(user_id)

    def _calculate_daily_budget(self, user_id: str) -> int:
        """1日の予算を計算"""
        year_month = budget_service.get_current_year_month()
        budget_record = budget_service.get_monthly_budget_record(
            self.db, user_id, year_month
        )

        # レコードが存在しない場合は0を返す
        if not budget_record or budget_record['monthly_budget'] == 0:
            return 0

        # 月の残り日数を計算
        today = datetime.now().date()
        year, month = map(int, year_month.split("-"))
        last_day = monthrange(year, month)[1]
        remaining_days = last_day - today.day + 1

        if remaining_days <= 0:
            remaining_days = 1

        # 残り予算を残り日数で割る
        remaining_budget = budget_record['monthly_budget'] - budget_record['spent']
        daily_budget = max(remaining_budget // remaining_days, 0)

        return daily_budget

    def _get_past_meal_names(self, user_id: str, days: int = 21) -> List[str]:
        """過去N日分の献立名を取得"""
        start_date = date.today() - timedelta(days=days)
        end_date = date.today() - timedelta(days=1)

        meals = self.meal_repo.list_by_date_range(user_id, start_date, end_date)
        # 確定済みのみフィルター
        confirmed_meals = [m for m in meals if m['status'] == "confirmed"]

        return [meal['name'] for meal in confirmed_meals]
