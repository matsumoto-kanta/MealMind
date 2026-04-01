from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.middleware.auth import get_current_user
from app.schemas.meal import HistoryRequest, HistoryResponse
from app.services.meal_service import MealService

router = APIRouter(prefix="/history", tags=["history"])


@router.post("", response_model=HistoryResponse)
def get_meal_history(
    request: HistoryRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    献立履歴を取得
    """
    try:
        user_id = UUID(current_user["sub"])
        meal_service = MealService(db)
        page = request.page if request.page is not None else 0
        history = meal_service.get_meal_history(user_id, page)

        return history
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
