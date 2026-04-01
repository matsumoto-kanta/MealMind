from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import date, datetime, timedelta
from calendar import monthrange
from fastapi import HTTPException

from app.models.meal import Meal, MealTypeEnum, MealStatusEnum
from app.models.user_settings import UserSettings
from app.services.ai_service import GeminiAIService
from app.services import budget_service
from app.schemas.meal import MealData, MealDetailData, IngredientData, HistoryResponse


class MealService:
    def __init__(self, db: Session):
        self.db = db
        self.ai_service = GeminiAIService()

    def get_today_meals(self, user_id: UUID) -> List[Meal]:
        """今日の確定済み献立を取得"""
        today = date.today()
        return (
            self.db.query(Meal)
            .filter(
                Meal.user_id == user_id,
                Meal.meal_date == today,
                Meal.status == "confirmed",
            )
            .order_by(Meal.meal_type)
            .all()
        )

    def generate_daily_meals(self, user_id: UUID) -> List[Meal]:
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
                gender=user_settings.gender,
                age=user_settings.age,
                height=user_settings.height,
                weight=user_settings.weight,
                activity_level=user_settings.activity_level,
                target_weight=user_settings.target_weight,
                target_period_months=user_settings.target_period_months,
                daily_budget=daily_budget,
                disliked_foods=user_settings.disliked_foods or [],
                allergies=user_settings.allergies or [],
                past_meal_names=past_meal_names,
            )
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Failed to generate meals: {str(e)}"
            )

        # 既存のdraft献立を削除
        today = date.today()
        self.db.query(Meal).filter(
            Meal.user_id == user_id, Meal.meal_date == today, Meal.status == "draft"
        ).delete()

        # 新しい献立をDBに保存
        meals = []
        for meal_data in meals_data:
            meal = Meal(
                user_id=user_id,
                meal_date=today,
                meal_type=MealTypeEnum(meal_data["meal_type"]),
                status="draft",
                name=meal_data["name"],
                kcal=meal_data["kcal"],
                cost=meal_data["cost"],
                protein=meal_data["protein"],
                fat=meal_data["fat"],
                carbohydrates=meal_data["carbohydrates"],
                ingredients=meal_data["ingredients"],
            )
            self.db.add(meal)
            meals.append(meal)

        self.db.commit()
        for meal in meals:
            self.db.refresh(meal)

        return meals

    def regenerate_single_meal(self, user_id: UUID, meal_type: MealTypeEnum) -> Meal:
        """1食分の献立を再生成"""
        # ユーザー設定を取得
        user_settings = self._get_user_settings(user_id)
        if not user_settings:
            raise HTTPException(status_code=400, detail="User settings not found")

        # 1日の予算を計算
        daily_budget = self._calculate_daily_budget(user_id)

        # 今日の他の食事を取得
        today = date.today()
        other_meals = (
            self.db.query(Meal)
            .filter(
                Meal.user_id == user_id,
                Meal.meal_date == today,
                Meal.meal_type != meal_type,
            )
            .all()
        )

        # 他の食事の合計コストを計算
        other_meals_cost = sum(meal.cost for meal in other_meals)
        meal_budget = daily_budget - other_meals_cost

        # 他の食事のデータを辞書形式に変換
        other_meals_data = [
            {"name": meal.name, "kcal": meal.kcal, "cost": meal.cost}
            for meal in other_meals
        ]

        # 過去21日間の献立名を取得
        past_meal_names = self._get_past_meal_names(user_id, days=21)

        # AIで献立再生成
        try:
            meal_data = self.ai_service.regenerate_single_meal(
                meal_type=meal_type.value,
                gender=user_settings.gender,
                age=user_settings.age,
                height=user_settings.height,
                weight=user_settings.weight,
                activity_level=user_settings.activity_level,
                target_weight=user_settings.target_weight,
                target_period_months=user_settings.target_period_months,
                meal_budget=meal_budget,
                disliked_foods=user_settings.disliked_foods or [],
                allergies=user_settings.allergies or [],
                past_meal_names=past_meal_names,
                other_meals_today=other_meals_data,
            )
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Failed to regenerate meal: {str(e)}"
            )

        if not meal_data:
            raise HTTPException(status_code=500, detail="Failed to generate meal data")

        # 既存の献立を削除または更新
        existing_meal = (
            self.db.query(Meal)
            .filter(
                Meal.user_id == user_id,
                Meal.meal_date == today,
                Meal.meal_type == meal_type,
            )
            .first()
        )

        if existing_meal:
            # 既存の献立が確定済みの場合、spentから前のコストを引く
            if existing_meal.status == "confirmed":
                year_month = budget_service.get_current_year_month()
                budget_record = budget_service.get_monthly_budget_record(
                    self.db, user_id, year_month
                )
                if budget_record:
                    budget_record.spent = max(0, budget_record.spent - existing_meal.cost)

            # 既存の献立を更新
            existing_meal.name = meal_data["name"]
            existing_meal.kcal = meal_data["kcal"]
            existing_meal.cost = meal_data["cost"]
            existing_meal.protein = meal_data["protein"]
            existing_meal.fat = meal_data["fat"]
            existing_meal.carbohydrates = meal_data["carbohydrates"]
            existing_meal.ingredients = meal_data["ingredients"]
            existing_meal.status = "draft"
            existing_meal.updated_at = datetime.utcnow()
            meal = existing_meal
        else:
            # 新規に作成
            meal = Meal(
                user_id=user_id,
                meal_date=today,
                meal_type=meal_type,
                status="draft",
                name=meal_data["name"],
                kcal=meal_data["kcal"],
                cost=meal_data["cost"],
                protein=meal_data["protein"],
                fat=meal_data["fat"],
                carbohydrates=meal_data["carbohydrates"],
                ingredients=meal_data["ingredients"],
            )
            self.db.add(meal)

        self.db.commit()
        self.db.refresh(meal)

        return meal

    def confirm_meal(self, user_id: UUID, meal_type: MealTypeEnum) -> Meal:
        """献立を確定（statusをconfirmedに変更、spentを更新）"""
        today = date.today()
        meal = (
            self.db.query(Meal)
            .filter(
                Meal.user_id == user_id,
                Meal.meal_date == today,
                Meal.meal_type == meal_type,
            )
            .first()
        )

        if not meal:
            raise HTTPException(status_code=404, detail="Meal not found")

        if meal.status == "confirmed":
            # 既に確定済みの場合はそのまま返す
            return meal

        # statusをconfirmedに変更
        meal.status = "confirmed"
        meal.updated_at = datetime.utcnow()

        # 予算のspentを更新
        year_month = budget_service.get_current_year_month()
        budget_record = budget_service.get_monthly_budget_record(
            self.db, user_id, year_month
        )

        # 予算レコードが存在しない場合は作成（monthly_budget=0で作成）
        if not budget_record:
            budget_record = budget_service.get_or_create_monthly_budget_record(
                self.db, user_id, year_month, budget=0
            )

        budget_record.spent += meal.cost

        self.db.commit()
        self.db.refresh(meal)

        return meal

    def get_meal_history(self, user_id: UUID, page: int) -> HistoryResponse:
        """献立履歴を取得（ページネーション対応）"""
        page_size = 7  # 1週間分
        offset = page * page_size

        # 確定済みの献立を日付降順で取得
        meals = (
            self.db.query(Meal)
            .filter(Meal.user_id == user_id, Meal.status == "confirmed")
            .order_by(Meal.meal_date.desc(), Meal.meal_type)
            .all()
        )

        # 日付ごとにグループ化
        history_dict: Dict[date, List[Meal]] = {}
        for meal in meals:
            if meal.meal_date not in history_dict:
                history_dict[meal.meal_date] = []
            history_dict[meal.meal_date].append(meal)

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
                    id=meal.meal_type,
                    name=meal.name,
                    kcal=meal.kcal,
                    cost=meal.cost,
                    protein=meal.protein,
                    fat=meal.fat,
                    carbohydrates=meal.carbohydrates,
                    status=meal.status,
                    ingredients=[
                        IngredientData(**ingredient) for ingredient in meal.ingredients
                    ],
                )
                for meal in meals_for_date
            ]

            # 全体のステータスを判定
            overall_status = (
                "fixed"
                if all(m.status == "confirmed" for m in meals_for_date)
                else "draft"
            )

            meal_data = MealData(
                status=overall_status,
                date=meal_date.isoformat() if meal_date else None,
                detail=detail_list,
            )

            history_data.append(meal_data)

        return HistoryResponse(history=history_data)

    def _get_user_settings(self, user_id: UUID) -> Optional[UserSettings]:
        """ユーザー設定を取得"""
        return (
            self.db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
        )

    def _calculate_daily_budget(self, user_id: UUID) -> int:
        """1日の予算を計算"""
        year_month = budget_service.get_current_year_month()
        budget_record = budget_service.get_monthly_budget_record(
            self.db, user_id, year_month
        )

        # レコードが存在しない場合は0を返す
        if not budget_record or budget_record.monthly_budget == 0:
            return 0

        # 月の残り日数を計算
        today = datetime.now().date()
        year, month = map(int, year_month.split("-"))
        last_day = monthrange(year, month)[1]
        remaining_days = last_day - today.day + 1

        if remaining_days <= 0:
            remaining_days = 1

        # 残り予算を残り日数で割る
        remaining_budget = budget_record.monthly_budget - budget_record.spent
        daily_budget = max(remaining_budget // remaining_days, 0)

        return daily_budget

    def _get_past_meal_names(self, user_id: UUID, days: int = 21) -> List[str]:
        """過去N日分の献立名を取得"""
        start_date = date.today() - timedelta(days=days)
        meals = (
            self.db.query(Meal)
            .filter(
                Meal.user_id == user_id,
                Meal.meal_date >= start_date,
                Meal.meal_date < date.today(),
                Meal.status == "confirmed",
            )
            .all()
        )
        return [meal.name for meal in meals]
