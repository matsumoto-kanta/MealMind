#!/usr/bin/env python3
"""
Cloud SQLからFirestoreへのデータ移行スクリプト

使用方法:
    python scripts/migrate_to_firestore.py [--dry-run] [--skip-users] [--skip-settings] [--skip-budgets] [--skip-meals]

オプション:
    --dry-run: 実際には書き込まずに、移行内容を表示のみ
    --skip-users: ユーザーの移行をスキップ
    --skip-settings: 設定の移行をスキップ
    --skip-budgets: 予算の移行をスキップ
    --skip-meals: 食事記録の移行をスキップ
"""

import sys
import os
import argparse
from datetime import datetime, timezone

# プロジェクトルートをPythonパスに追加
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from google.cloud import firestore
from google.oauth2 import service_account

from app.core.config import settings as app_settings
from app.models.user import User
from app.models.user_settings import UserSettings
from app.models.monthly_budget import MonthlyBudget
from app.models.meal import Meal


class DataMigrator:
    def __init__(self, dry_run=False):
        self.dry_run = dry_run
        self.stats = {
            'users': {'migrated': 0, 'errors': 0},
            'settings': {'migrated': 0, 'errors': 0},
            'budgets': {'migrated': 0, 'errors': 0},
            'meals': {'migrated': 0, 'errors': 0},
        }

        # Cloud SQL接続
        print("Connecting to Cloud SQL...")
        # DATABASE_URLが設定されていない場合は、環境変数から構築
        if not app_settings.DATABASE_URL:
            db_url = os.getenv('DATABASE_URL')
            if not db_url:
                # Cloud SQL接続情報から構築
                db_user = os.getenv('DB_USER', 'dbuser')
                db_pass = os.getenv('DB_PASSWORD', '')
                db_name = os.getenv('DB_NAME', 'mealmind')
                db_host = os.getenv('DB_HOST', 'localhost')
                db_port = os.getenv('DB_PORT', '5432')
                db_url = f"postgresql://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}"
        else:
            db_url = app_settings.DATABASE_URL

        self.sql_engine = create_engine(db_url)
        self.sql_session = sessionmaker(bind=self.sql_engine)()

        # Firestore接続
        print("Connecting to Firestore...")
        credentials_path = app_settings.FIRESTORE_CREDENTIALS_PATH
        if not os.path.isabs(credentials_path):
            backend_dir = os.path.dirname(os.path.dirname(__file__))
            credentials_path = os.path.join(backend_dir, credentials_path)

        credentials = service_account.Credentials.from_service_account_file(
            credentials_path
        )
        self.firestore_db = firestore.Client(credentials=credentials)

        print(f"Connected! (Dry run: {dry_run})")
        print("-" * 60)

    def migrate_all(self, skip_users=False, skip_settings=False, skip_budgets=False, skip_meals=False):
        """全データを移行"""
        try:
            if not skip_users:
                self.migrate_users()

            if not skip_settings:
                self.migrate_settings()

            if not skip_budgets:
                self.migrate_budgets()

            if not skip_meals:
                self.migrate_meals()

            self.print_summary()

        except Exception as e:
            print(f"❌ Migration failed: {e}")
            import traceback
            traceback.print_exc()
            sys.exit(1)
        finally:
            self.sql_session.close()

    def migrate_users(self):
        """ユーザーデータを移行"""
        print("\n📊 Migrating Users...")
        users = self.sql_session.query(User).all()
        print(f"Found {len(users)} users")

        for user in users:
            try:
                user_data = {
                    'google_id': user.google_id,
                    'email': user.email,
                    'name': user.name,
                    'picture': user.picture,
                    'created_at': user.created_at,
                    'updated_at': user.updated_at,
                }

                if self.dry_run:
                    print(f"  [DRY RUN] Would migrate user: {user.email} (ID: {user.id})")
                else:
                    user_ref = self.firestore_db.collection('users').document(str(user.id))
                    user_ref.set(user_data)
                    print(f"  ✓ Migrated user: {user.email}")

                self.stats['users']['migrated'] += 1

            except Exception as e:
                print(f"  ❌ Error migrating user {user.email}: {e}")
                self.stats['users']['errors'] += 1

    def migrate_settings(self):
        """ユーザー設定を移行"""
        print("\n⚙️  Migrating User Settings...")
        settings = self.sql_session.query(UserSettings).all()
        print(f"Found {len(settings)} settings")

        for setting in settings:
            try:
                settings_data = {
                    'gender': setting.gender.value if setting.gender else 'male',
                    'age': setting.age,
                    'height': setting.height,
                    'weight': setting.weight,
                    'activity_level': setting.activity_level.value if setting.activity_level else 'low',
                    'target_weight': setting.target_weight,
                    'target_period_months': setting.target_period_months,
                    'disliked_foods': setting.disliked_foods or [],
                    'allergies': setting.allergies or [],
                    'created_at': setting.created_at,
                    'updated_at': setting.updated_at,
                }

                if self.dry_run:
                    print(f"  [DRY RUN] Would migrate settings for user: {setting.user_id}")
                else:
                    settings_ref = self.firestore_db.collection('users').document(str(setting.user_id)) \
                                                    .collection('settings').document('default')
                    settings_ref.set(settings_data)
                    print(f"  ✓ Migrated settings for user: {setting.user_id}")

                self.stats['settings']['migrated'] += 1

            except Exception as e:
                print(f"  ❌ Error migrating settings for user {setting.user_id}: {e}")
                self.stats['settings']['errors'] += 1

    def migrate_budgets(self):
        """月間予算を移行"""
        print("\n💰 Migrating Monthly Budgets...")
        budgets = self.sql_session.query(MonthlyBudget).all()
        print(f"Found {len(budgets)} budgets")

        for budget in budgets:
            try:
                budget_data = {
                    'monthly_budget': budget.monthly_budget,
                    'spent': budget.spent,
                    'created_at': budget.created_at,
                    'updated_at': budget.updated_at,
                }

                if self.dry_run:
                    print(f"  [DRY RUN] Would migrate budget: {budget.user_id} / {budget.year_month}")
                else:
                    budget_ref = self.firestore_db.collection('users').document(str(budget.user_id)) \
                                                  .collection('monthly_budgets').document(budget.year_month)
                    budget_ref.set(budget_data)
                    print(f"  ✓ Migrated budget: {budget.user_id} / {budget.year_month}")

                self.stats['budgets']['migrated'] += 1

            except Exception as e:
                print(f"  ❌ Error migrating budget {budget.year_month} for user {budget.user_id}: {e}")
                self.stats['budgets']['errors'] += 1

    def migrate_meals(self):
        """食事記録を移行"""
        print("\n🍽️  Migrating Meals...")
        meals = self.sql_session.query(Meal).all()
        print(f"Found {len(meals)} meals")

        # バッチ処理で効率化
        batch = self.firestore_db.batch()
        batch_count = 0
        max_batch_size = 500

        for meal in meals:
            try:
                # DateをTimestampに変換
                meal_date = datetime.combine(meal.meal_date, datetime.min.time()).replace(tzinfo=timezone.utc)

                meal_data = {
                    'meal_date': meal_date,
                    'meal_type': meal.meal_type.value if hasattr(meal.meal_type, 'value') else meal.meal_type,
                    'status': meal.status.value if hasattr(meal.status, 'value') else meal.status,
                    'name': meal.name,
                    'kcal': meal.kcal,
                    'cost': meal.cost,
                    'protein': meal.protein,
                    'fat': meal.fat,
                    'carbohydrates': meal.carbohydrates,
                    'ingredients': meal.ingredients,
                    'created_at': meal.created_at,
                    'updated_at': meal.updated_at,
                }

                if self.dry_run:
                    print(f"  [DRY RUN] Would migrate meal: {meal.user_id} / {meal.meal_date} / {meal.meal_type}")
                else:
                    meal_ref = self.firestore_db.collection('users').document(str(meal.user_id)) \
                                                .collection('meals').document(meal.id)
                    batch.set(meal_ref, meal_data)
                    batch_count += 1

                    # バッチが上限に達したらコミット
                    if batch_count >= max_batch_size:
                        batch.commit()
                        print(f"  ✓ Committed batch of {batch_count} meals")
                        batch = self.firestore_db.batch()
                        batch_count = 0

                self.stats['meals']['migrated'] += 1

            except Exception as e:
                print(f"  ❌ Error migrating meal {meal.id}: {e}")
                self.stats['meals']['errors'] += 1

        # 残りのバッチをコミット
        if batch_count > 0 and not self.dry_run:
            batch.commit()
            print(f"  ✓ Committed final batch of {batch_count} meals")

    def print_summary(self):
        """移行結果のサマリーを表示"""
        print("\n" + "=" * 60)
        print("📊 Migration Summary")
        print("=" * 60)

        for data_type, stats in self.stats.items():
            status = "✓" if stats['errors'] == 0 else "⚠"
            print(f"{status} {data_type.capitalize()}: {stats['migrated']} migrated, {stats['errors']} errors")

        total_migrated = sum(s['migrated'] for s in self.stats.values())
        total_errors = sum(s['errors'] for s in self.stats.values())

        print("-" * 60)
        print(f"Total: {total_migrated} records migrated, {total_errors} errors")
        print("=" * 60)

        if self.dry_run:
            print("\n⚠️  DRY RUN MODE - No data was actually written to Firestore")

    def verify_migration(self):
        """データ整合性を検証"""
        print("\n🔍 Verifying Migration...")

        # ユーザー数の確認
        sql_user_count = self.sql_session.query(User).count()
        firestore_user_count = len(list(self.firestore_db.collection('users').stream()))

        print(f"Users: SQL={sql_user_count}, Firestore={firestore_user_count}")

        if sql_user_count != firestore_user_count:
            print("⚠️  User count mismatch!")
        else:
            print("✓ User count matches")


def main():
    parser = argparse.ArgumentParser(description='Migrate data from Cloud SQL to Firestore')
    parser.add_argument('--dry-run', action='store_true', help='Run without writing to Firestore')
    parser.add_argument('--skip-users', action='store_true', help='Skip users migration')
    parser.add_argument('--skip-settings', action='store_true', help='Skip settings migration')
    parser.add_argument('--skip-budgets', action='store_true', help='Skip budgets migration')
    parser.add_argument('--skip-meals', action='store_true', help='Skip meals migration')
    parser.add_argument('--verify', action='store_true', help='Verify migration after completion')

    args = parser.parse_args()

    print("=" * 60)
    print("🚀 Cloud SQL → Firestore Migration")
    print("=" * 60)

    migrator = DataMigrator(dry_run=args.dry_run)

    migrator.migrate_all(
        skip_users=args.skip_users,
        skip_settings=args.skip_settings,
        skip_budgets=args.skip_budgets,
        skip_meals=args.skip_meals,
    )

    if args.verify and not args.dry_run:
        migrator.verify_migration()

    print("\n✨ Migration completed!")


if __name__ == '__main__':
    main()
