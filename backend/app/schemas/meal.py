from pydantic import BaseModel
from typing import List, Optional, Literal


class IngredientData(BaseModel):
    name: str
    amount: str
    price: int


class MealDetailData(BaseModel):
    id: Literal["breakfast", "lunch", "dinner"]
    name: str
    kcal: int
    cost: int
    protein: int
    fat: int
    carbohydrates: int
    status: Literal["draft", "confirmed"]
    ingredients: List[IngredientData]


class MealData(BaseModel):
    status: Optional[Literal["draft", "fixed"]] = None
    date: Optional[str] = None
    detail: List[MealDetailData]


class GenerateMealsRequest(BaseModel):
    pass


class RegenerateMealRequest(BaseModel):
    pass


class MealResponse(BaseModel):
    meals: MealData


class MealDetailResponse(BaseModel):
    meal: MealDetailData


class HistoryRequest(BaseModel):
    page: Optional[int] = 0


class HistoryResponse(BaseModel):
    history: List[MealData]
