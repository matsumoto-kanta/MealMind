from fastapi import APIRouter, Depends, HTTPException, status
from google.cloud import firestore

from app.core.firestore import get_db
from app.middleware.auth import get_current_user
from app.schemas.budget import (
    MonthlyBudgetResponse,
    UpdateMonthlyBudgetRequest,
)
from app.services import budget_service

router = APIRouter(prefix="/monthlyBudget", tags=["budget"])


@router.get("", response_model=MonthlyBudgetResponse)
def get_monthly_budget(
    current_user: dict = Depends(get_current_user),
    db: firestore.Client = Depends(get_db),
):
    """
    月間予算データを取得
    """
    try:
        user_id = current_user["sub"]
        budget_data = budget_service.get_monthly_budget_data(db, user_id)

        return {"monthlyBudget": budget_data}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.put("", response_model=MonthlyBudgetResponse)
def update_monthly_budget(
    request: UpdateMonthlyBudgetRequest,
    current_user: dict = Depends(get_current_user),
    db: firestore.Client = Depends(get_db),
):
    """
    月間予算を更新
    """
    try:
        user_id = current_user["sub"]

        # 設定が完了しているかチェック
        from app.services import settings_service

        settings = settings_service.get_user_settings(db, user_id)
        if not settings or settings['age'] == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="初期設定を完了してください",
            )

        budget_data = budget_service.update_monthly_budget(
            db, user_id, request.monthly_budget
        )

        return {"monthlyBudget": budget_data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
