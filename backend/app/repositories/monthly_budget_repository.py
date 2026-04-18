"""
Monthly Budget repository for Firestore operations.
"""
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone
from google.cloud import firestore


class MonthlyBudgetRepository:
    def __init__(self, db: firestore.Client):
        self.db = db

    def _get_collection_ref(self, user_id: str):
        """Get monthly_budgets collection reference for a user."""
        return self.db.collection('users').document(user_id).collection('monthly_budgets')

    def create(self, user_id: str, year_month: str, budget_data: Dict[str, Any]) -> bool:
        """
        Create monthly budget.

        Args:
            user_id: User document ID
            year_month: Year-month string (e.g., "2026-04")
            budget_data: Budget data dictionary

        Returns:
            bool: True if successful, False if budget already exists
        """
        budget_ref = self._get_collection_ref(user_id).document(year_month)

        # Check if budget already exists
        if budget_ref.get().exists:
            return False

        # Add timestamps
        now = datetime.now(timezone.utc)
        budget_data['created_at'] = now
        budget_data['updated_at'] = now

        # Create budget document
        budget_ref.set(budget_data)
        return True

    def get(self, user_id: str, year_month: str) -> Optional[Dict[str, Any]]:
        """
        Get monthly budget.

        Args:
            user_id: User document ID
            year_month: Year-month string (e.g., "2026-04")

        Returns:
            Budget data dictionary or None if not found
        """
        doc = self._get_collection_ref(user_id).document(year_month).get()
        if doc.exists:
            data = doc.to_dict()
            data['user_id'] = user_id
            data['year_month'] = doc.id
            return data
        return None

    def list(self, user_id: str, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        List all monthly budgets for a user.

        Args:
            user_id: User document ID
            limit: Maximum number of results (optional)

        Returns:
            List of budget data dictionaries
        """
        query = self._get_collection_ref(user_id).order_by('__name__', direction=firestore.Query.DESCENDING)

        if limit:
            query = query.limit(limit)

        budgets = []
        for doc in query.stream():
            data = doc.to_dict()
            data['user_id'] = user_id
            data['year_month'] = doc.id
            budgets.append(data)

        return budgets

    def update(self, user_id: str, year_month: str, budget_data: Dict[str, Any]) -> bool:
        """
        Update monthly budget.

        Args:
            user_id: User document ID
            year_month: Year-month string (e.g., "2026-04")
            budget_data: Budget data to update

        Returns:
            bool: True if successful, False if budget not found
        """
        budget_ref = self._get_collection_ref(user_id).document(year_month)

        if not budget_ref.get().exists:
            return False

        # Add updated timestamp
        budget_data['updated_at'] = datetime.now(timezone.utc)

        budget_ref.update(budget_data)
        return True

    def delete(self, user_id: str, year_month: str) -> bool:
        """
        Delete monthly budget.

        Args:
            user_id: User document ID
            year_month: Year-month string (e.g., "2026-04")

        Returns:
            bool: True if successful, False if budget not found
        """
        budget_ref = self._get_collection_ref(user_id).document(year_month)

        if not budget_ref.get().exists:
            return False

        budget_ref.delete()
        return True

    def exists(self, user_id: str, year_month: str) -> bool:
        """
        Check if monthly budget exists.

        Args:
            user_id: User document ID
            year_month: Year-month string (e.g., "2026-04")

        Returns:
            bool: True if exists, False otherwise
        """
        return self._get_collection_ref(user_id).document(year_month).get().exists

    def upsert(self, user_id: str, year_month: str, budget_data: Dict[str, Any]) -> bool:
        """
        Create or update monthly budget.

        Args:
            user_id: User document ID
            year_month: Year-month string (e.g., "2026-04")
            budget_data: Budget data

        Returns:
            bool: True if successful
        """
        budget_ref = self._get_collection_ref(user_id).document(year_month)
        now = datetime.now(timezone.utc)

        if budget_ref.get().exists:
            # Update existing
            budget_data['updated_at'] = now
            budget_ref.update(budget_data)
        else:
            # Create new
            budget_data['created_at'] = now
            budget_data['updated_at'] = now
            budget_ref.set(budget_data)

        return True

    def increment_spent(self, user_id: str, year_month: str, amount: int) -> bool:
        """
        Increment spent amount atomically.

        Args:
            user_id: User document ID
            year_month: Year-month string (e.g., "2026-04")
            amount: Amount to increment (can be negative)

        Returns:
            bool: True if successful, False if budget not found
        """
        budget_ref = self._get_collection_ref(user_id).document(year_month)

        if not budget_ref.get().exists:
            return False

        budget_ref.update({
            'spent': firestore.Increment(amount),
            'updated_at': datetime.now(timezone.utc)
        })
        return True
