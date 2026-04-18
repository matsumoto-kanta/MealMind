"""
User Settings repository for Firestore operations.
"""
from typing import Optional, Dict, Any
from datetime import datetime, timezone
from google.cloud import firestore


class UserSettingsRepository:
    def __init__(self, db: firestore.Client):
        self.db = db

    def _get_settings_ref(self, user_id: str):
        """Get settings document reference for a user."""
        return self.db.collection('users').document(user_id).collection('settings').document('default')

    def create(self, user_id: str, settings_data: Dict[str, Any]) -> bool:
        """
        Create user settings.

        Args:
            user_id: User document ID
            settings_data: Settings data dictionary

        Returns:
            bool: True if successful, False if settings already exist
        """
        settings_ref = self._get_settings_ref(user_id)

        # Check if settings already exist
        if settings_ref.get().exists:
            return False

        # Add timestamps
        now = datetime.now(timezone.utc)
        settings_data['created_at'] = now
        settings_data['updated_at'] = now

        # Create settings document
        settings_ref.set(settings_data)
        return True

    def get(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Get user settings.

        Args:
            user_id: User document ID

        Returns:
            Settings data dictionary or None if not found
        """
        doc = self._get_settings_ref(user_id).get()
        if doc.exists:
            data = doc.to_dict()
            data['user_id'] = user_id
            return data
        return None

    def update(self, user_id: str, settings_data: Dict[str, Any]) -> bool:
        """
        Update user settings.

        Args:
            user_id: User document ID
            settings_data: Settings data to update

        Returns:
            bool: True if successful, False if settings not found
        """
        settings_ref = self._get_settings_ref(user_id)

        if not settings_ref.get().exists:
            return False

        # Add updated timestamp
        settings_data['updated_at'] = datetime.now(timezone.utc)

        settings_ref.update(settings_data)
        return True

    def delete(self, user_id: str) -> bool:
        """
        Delete user settings.

        Args:
            user_id: User document ID

        Returns:
            bool: True if successful, False if settings not found
        """
        settings_ref = self._get_settings_ref(user_id)

        if not settings_ref.get().exists:
            return False

        settings_ref.delete()
        return True

    def exists(self, user_id: str) -> bool:
        """
        Check if user settings exist.

        Args:
            user_id: User document ID

        Returns:
            bool: True if exists, False otherwise
        """
        return self._get_settings_ref(user_id).get().exists

    def upsert(self, user_id: str, settings_data: Dict[str, Any]) -> bool:
        """
        Create or update user settings.

        Args:
            user_id: User document ID
            settings_data: Settings data

        Returns:
            bool: True if successful
        """
        settings_ref = self._get_settings_ref(user_id)
        now = datetime.now(timezone.utc)

        if settings_ref.get().exists:
            # Update existing
            settings_data['updated_at'] = now
            settings_ref.update(settings_data)
        else:
            # Create new
            settings_data['created_at'] = now
            settings_data['updated_at'] = now
            settings_ref.set(settings_data)

        return True
