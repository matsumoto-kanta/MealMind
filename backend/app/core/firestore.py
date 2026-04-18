"""
Firestore database connection and utilities.
"""
import os
from typing import Optional
from google.cloud import firestore
from google.oauth2 import service_account
from app.core.config import settings


_db_instance: Optional[firestore.Client] = None


def get_firestore_client() -> firestore.Client:
    """
    Get Firestore client instance (singleton pattern).

    Returns:
        firestore.Client: Firestore client instance
    """
    global _db_instance

    if _db_instance is None:
        # Cloud Run環境では、デフォルト認証を使用
        if os.getenv('K_SERVICE'):
            # Cloud Run環境（K_SERVICEが設定されている）
            _db_instance = firestore.Client()
        else:
            # ローカル環境では認証ファイルを使用
            credentials_path = settings.FIRESTORE_CREDENTIALS_PATH

            if credentials_path:
                # Handle relative path
                if not os.path.isabs(credentials_path):
                    # Resolve relative to backend directory
                    backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
                    credentials_path = os.path.join(backend_dir, credentials_path)

                # Initialize Firestore client
                if os.path.exists(credentials_path):
                    credentials = service_account.Credentials.from_service_account_file(
                        credentials_path
                    )
                    _db_instance = firestore.Client(credentials=credentials)
                else:
                    # Fallback to default credentials
                    _db_instance = firestore.Client()
            else:
                # No credentials path specified, use default credentials
                _db_instance = firestore.Client()

    return _db_instance


def get_db() -> firestore.Client:
    """
    Dependency function to get Firestore client.
    Compatible with FastAPI's Depends().

    Yields:
        firestore.Client: Firestore client instance
    """
    return get_firestore_client()


# Helper functions for common operations

def delete_collection(collection_ref: firestore.CollectionReference, batch_size: int = 100):
    """
    Delete all documents in a collection.

    Args:
        collection_ref: Firestore collection reference
        batch_size: Number of documents to delete per batch (default: 100)
    """
    docs = collection_ref.limit(batch_size).stream()
    deleted = 0

    for doc in docs:
        doc.reference.delete()
        deleted += 1

    if deleted >= batch_size:
        # Recursively delete remaining documents
        return delete_collection(collection_ref, batch_size)


def delete_user_data(db: firestore.Client, user_id: str):
    """
    Delete all user data including subcollections (CASCADE DELETE equivalent).

    Args:
        db: Firestore client instance
        user_id: User document ID
    """
    user_ref = db.collection('users').document(user_id)

    # Delete subcollections
    delete_collection(user_ref.collection('settings'))
    delete_collection(user_ref.collection('monthly_budgets'))
    delete_collection(user_ref.collection('meals'))

    # Delete user document
    user_ref.delete()
