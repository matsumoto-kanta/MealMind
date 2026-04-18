"""
User repository for Firestore operations.
"""
from typing import Optional, Dict, Any
from datetime import datetime, timezone
from google.cloud import firestore
from google.cloud.firestore_v1.base_query import FieldFilter


class UserRepository:
    def __init__(self, db: firestore.Client):
        self.db = db
        self.collection = db.collection('users')

    def create(self, user_data: Dict[str, Any]) -> str:
        """
        Create a new user.

        Args:
            user_data: User data dictionary

        Returns:
            str: Created user ID

        Raises:
            ValueError: If user with same google_id or email already exists
        """
        # Check for existing user with same google_id
        if self.get_by_google_id(user_data.get('google_id')):
            raise ValueError(f"User with google_id {user_data['google_id']} already exists")

        # Check for existing user with same email
        if self.get_by_email(user_data.get('email')):
            raise ValueError(f"User with email {user_data['email']} already exists")

        # Add timestamps
        now = datetime.now(timezone.utc)
        user_data['created_at'] = now
        user_data['updated_at'] = now

        # Create user document
        doc_ref = self.collection.document()
        doc_ref.set(user_data)

        return doc_ref.id

    def get_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Get user by ID.

        Args:
            user_id: User document ID

        Returns:
            User data dictionary or None if not found
        """
        doc = self.collection.document(user_id).get()
        if doc.exists:
            data = doc.to_dict()
            data['id'] = doc.id
            return data
        return None

    def get_by_google_id(self, google_id: str) -> Optional[Dict[str, Any]]:
        """
        Get user by Google ID.

        Args:
            google_id: Google OAuth ID

        Returns:
            User data dictionary or None if not found
        """
        query = self.collection.where(
            filter=FieldFilter('google_id', '==', google_id)
        ).limit(1)

        docs = list(query.stream())
        if docs:
            data = docs[0].to_dict()
            data['id'] = docs[0].id
            return data
        return None

    def get_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """
        Get user by email.

        Args:
            email: User email address

        Returns:
            User data dictionary or None if not found
        """
        query = self.collection.where(
            filter=FieldFilter('email', '==', email)
        ).limit(1)

        docs = list(query.stream())
        if docs:
            data = docs[0].to_dict()
            data['id'] = docs[0].id
            return data
        return None

    def update(self, user_id: str, user_data: Dict[str, Any]) -> bool:
        """
        Update user data.

        Args:
            user_id: User document ID
            user_data: User data to update

        Returns:
            bool: True if successful, False if user not found
        """
        doc_ref = self.collection.document(user_id)

        if not doc_ref.get().exists:
            return False

        # Add updated timestamp
        user_data['updated_at'] = datetime.now(timezone.utc)

        doc_ref.update(user_data)
        return True

    def delete(self, user_id: str) -> bool:
        """
        Delete user and all related data (CASCADE DELETE).

        Args:
            user_id: User document ID

        Returns:
            bool: True if successful, False if user not found
        """
        from app.core.firestore import delete_user_data

        doc = self.collection.document(user_id).get()
        if not doc.exists:
            return False

        # Delete user and all subcollections
        delete_user_data(self.db, user_id)
        return True

    def exists(self, user_id: str) -> bool:
        """
        Check if user exists.

        Args:
            user_id: User document ID

        Returns:
            bool: True if exists, False otherwise
        """
        return self.collection.document(user_id).get().exists
