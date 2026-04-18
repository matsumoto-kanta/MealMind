"""
Meal repository for Firestore operations.
"""
from typing import Optional, Dict, Any, List
from datetime import datetime, date, timezone
from google.cloud import firestore
from google.cloud.firestore_v1.base_query import FieldFilter
import uuid


class MealRepository:
    def __init__(self, db: firestore.Client):
        self.db = db

    def _get_collection_ref(self, user_id: str):
        """Get meals collection reference for a user."""
        return self.db.collection('users').document(user_id).collection('meals')

    def _date_to_timestamp(self, d: date) -> datetime:
        """Convert date to datetime (00:00:00 UTC)."""
        return datetime.combine(d, datetime.min.time()).replace(tzinfo=timezone.utc)

    def create(self, user_id: str, meal_data: Dict[str, Any]) -> str:
        """
        Create a new meal.

        Args:
            user_id: User document ID
            meal_data: Meal data dictionary

        Returns:
            str: Created meal ID

        Raises:
            ValueError: If meal with same date and type already exists
        """
        # Check for existing meal with same date and type
        meal_date = meal_data.get('meal_date')
        meal_type = meal_data.get('meal_type')

        if meal_date and meal_type:
            existing = self.get_by_date_and_type(user_id, meal_date, meal_type)
            if existing:
                raise ValueError(
                    f"Meal for {meal_date} {meal_type} already exists"
                )

        # Convert date to timestamp if needed
        if isinstance(meal_data.get('meal_date'), date):
            meal_data['meal_date'] = self._date_to_timestamp(meal_data['meal_date'])

        # Add timestamps
        now = datetime.now(timezone.utc)
        meal_data['created_at'] = now
        meal_data['updated_at'] = now

        # Create meal document with UUID
        meal_id = str(uuid.uuid4())
        meal_ref = self._get_collection_ref(user_id).document(meal_id)
        meal_ref.set(meal_data)

        return meal_id

    def get_by_id(self, user_id: str, meal_id: str) -> Optional[Dict[str, Any]]:
        """
        Get meal by ID.

        Args:
            user_id: User document ID
            meal_id: Meal document ID

        Returns:
            Meal data dictionary or None if not found
        """
        doc = self._get_collection_ref(user_id).document(meal_id).get()
        if doc.exists:
            data = doc.to_dict()
            data['id'] = doc.id
            data['user_id'] = user_id
            return data
        return None

    def get_by_date_and_type(
        self,
        user_id: str,
        meal_date: date,
        meal_type: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get meal by date and type (UNIQUE constraint check).

        Args:
            user_id: User document ID
            meal_date: Meal date
            meal_type: Meal type (breakfast, lunch, dinner)

        Returns:
            Meal data dictionary or None if not found
        """
        # Convert date to timestamp
        timestamp = self._date_to_timestamp(meal_date)

        query = self._get_collection_ref(user_id).where(
            filter=FieldFilter('meal_date', '==', timestamp)
        ).where(
            filter=FieldFilter('meal_type', '==', meal_type)
        ).limit(1)

        docs = list(query.stream())
        if docs:
            data = docs[0].to_dict()
            data['id'] = docs[0].id
            data['user_id'] = user_id
            return data
        return None

    def list_by_date_range(
        self,
        user_id: str,
        start_date: date,
        end_date: date
    ) -> List[Dict[str, Any]]:
        """
        List meals within a date range.

        Args:
            user_id: User document ID
            start_date: Start date (inclusive)
            end_date: End date (inclusive)

        Returns:
            List of meal data dictionaries
        """
        # Convert dates to timestamps
        start_ts = self._date_to_timestamp(start_date)
        end_ts = datetime.combine(end_date, datetime.max.time()).replace(tzinfo=timezone.utc)

        query = self._get_collection_ref(user_id).where(
            filter=FieldFilter('meal_date', '>=', start_ts)
        ).where(
            filter=FieldFilter('meal_date', '<=', end_ts)
        ).order_by('meal_date').order_by('meal_type')

        meals = []
        for doc in query.stream():
            data = doc.to_dict()
            data['id'] = doc.id
            data['user_id'] = user_id
            meals.append(data)

        return meals

    def list_by_date(
        self,
        user_id: str,
        meal_date: date
    ) -> List[Dict[str, Any]]:
        """
        List all meals for a specific date.

        Args:
            user_id: User document ID
            meal_date: Meal date

        Returns:
            List of meal data dictionaries
        """
        return self.list_by_date_range(user_id, meal_date, meal_date)

    def update(self, user_id: str, meal_id: str, meal_data: Dict[str, Any]) -> bool:
        """
        Update meal data.

        Args:
            user_id: User document ID
            meal_id: Meal document ID
            meal_data: Meal data to update

        Returns:
            bool: True if successful, False if meal not found
        """
        meal_ref = self._get_collection_ref(user_id).document(meal_id)

        if not meal_ref.get().exists:
            return False

        # Convert date to timestamp if needed
        if isinstance(meal_data.get('meal_date'), date):
            meal_data['meal_date'] = self._date_to_timestamp(meal_data['meal_date'])

        # Add updated timestamp
        meal_data['updated_at'] = datetime.now(timezone.utc)

        meal_ref.update(meal_data)
        return True

    def delete(self, user_id: str, meal_id: str) -> bool:
        """
        Delete meal.

        Args:
            user_id: User document ID
            meal_id: Meal document ID

        Returns:
            bool: True if successful, False if meal not found
        """
        meal_ref = self._get_collection_ref(user_id).document(meal_id)

        if not meal_ref.get().exists:
            return False

        meal_ref.delete()
        return True

    def exists(self, user_id: str, meal_id: str) -> bool:
        """
        Check if meal exists.

        Args:
            user_id: User document ID
            meal_id: Meal document ID

        Returns:
            bool: True if exists, False otherwise
        """
        return self._get_collection_ref(user_id).document(meal_id).get().exists

    def count_by_date_range(
        self,
        user_id: str,
        start_date: date,
        end_date: date
    ) -> int:
        """
        Count meals within a date range.

        Args:
            user_id: User document ID
            start_date: Start date (inclusive)
            end_date: End date (inclusive)

        Returns:
            int: Number of meals
        """
        meals = self.list_by_date_range(user_id, start_date, end_date)
        return len(meals)

    def update_status(self, user_id: str, meal_id: str, status: str) -> bool:
        """
        Update meal status.

        Args:
            user_id: User document ID
            meal_id: Meal document ID
            status: New status (draft, confirmed)

        Returns:
            bool: True if successful, False if meal not found
        """
        return self.update(user_id, meal_id, {'status': status})
