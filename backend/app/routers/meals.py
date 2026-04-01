from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.core.database import get_db
from app.middleware.auth import get_current_user
from app.models.meal import MealTypeEnum, MealStatusEnum
from app.schemas.meal import (
    MealResponse,
    MealDetailResponse,
    MealData,
    MealDetailData,
    IngredientData,
)
from app.services.meal_service import MealService

router = APIRouter(prefix="/meals", tags=["meals"])


@router.get("", response_model=MealResponse)
def get_today_meals(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    今日の確定済み献立を取得
    """
    try:
        user_id = UUID(current_user["sub"])
        meal_service = MealService(db)
        meals = meal_service.get_today_meals(user_id)

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
            for meal in meals
        ]

        # 全体のステータスを判定（全てconfirmedならfixed、それ以外はdraft）
        overall_status = (
            "fixed"
            if meals and all(m.status == "confirmed" for m in meals)
            else "draft"
        )
        meal_date = meals[0].meal_date if meals else None

        meal_data = MealData(
            status=overall_status,
            date=meal_date.isoformat() if meal_date else None,
            detail=detail_list,
        )

        return MealResponse(meals=meal_data)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.post("/generate", response_model=MealResponse)
def generate_daily_meals(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    1日分の献立を生成
    """
    try:
        user_id = UUID(current_user["sub"])

        # 設定が完了しているかチェック
        from app.services import settings_service, budget_service

        settings = settings_service.get_user_settings(db, user_id)
        if not settings or settings.age == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="初期設定を完了してください",
            )

        # 予算が設定されているかチェック
        budget_data = budget_service.get_monthly_budget_data(db, user_id)
        if budget_data.monthly_budget == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="月間予算を設定してください",
            )

        meal_service = MealService(db)
        meals = meal_service.generate_daily_meals(user_id)

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
            for meal in meals
        ]

        # 全体のステータスを判定（全てconfirmedならfixed、それ以外はdraft）
        overall_status = (
            "fixed"
            if meals and all(m.status == "confirmed" for m in meals)
            else "draft"
        )
        meal_date = meals[0].meal_date if meals else None

        meal_data = MealData(
            status=overall_status,
            date=meal_date.isoformat() if meal_date else None,
            detail=detail_list,
        )

        return MealResponse(meals=meal_data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.post("/{id}/regenerate", response_model=MealDetailResponse)
def regenerate_meal(
    id: MealTypeEnum,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    指定した食事の献立を再生成
    """
    try:
        user_id = UUID(current_user["sub"])
        meal_service = MealService(db)
        meal = meal_service.regenerate_single_meal(user_id, id)

        detail = MealDetailData(
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

        return MealDetailResponse(meal=detail)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.put("/{id}/confirm", response_model=MealDetailResponse)
def confirm_meal(
    id: MealTypeEnum,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    指定した食事の献立を確定
    """
    try:
        user_id = UUID(current_user["sub"])
        meal_service = MealService(db)
        meal = meal_service.confirm_meal(user_id, id)

        detail = MealDetailData(
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

        return MealDetailResponse(meal=detail)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
