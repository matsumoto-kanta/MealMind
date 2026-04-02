-- MealMind Database Migration Script
-- Run this script in Cloud SQL to create all required tables

-- 1. Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    google_id VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    name VARCHAR,
    picture VARCHAR,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS ix_users_email ON users(email);
CREATE UNIQUE INDEX IF NOT EXISTS ix_users_google_id ON users(google_id);

-- 2. Create enum types for user_settings
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'genderenum') THEN
        CREATE TYPE genderenum AS ENUM ('male', 'female', 'other');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activitylevelenum') THEN
        CREATE TYPE activitylevelenum AS ENUM ('low', 'medium', 'high');
    END IF;
END
$$;

-- 3. Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    gender genderenum NOT NULL,
    age INTEGER NOT NULL,
    height INTEGER NOT NULL,
    weight INTEGER NOT NULL,
    activity_level activitylevelenum NOT NULL,
    target_weight INTEGER NOT NULL,
    target_period_months INTEGER NOT NULL,
    disliked_foods VARCHAR[] NOT NULL,
    allergies VARCHAR[] NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS ix_user_settings_user_id ON user_settings(user_id);

-- 4. Create monthly_budgets table
CREATE TABLE IF NOT EXISTS monthly_budgets (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    year_month VARCHAR NOT NULL,
    monthly_budget INTEGER NOT NULL,
    spent INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_user_year_month UNIQUE (user_id, year_month)
);

CREATE INDEX IF NOT EXISTS ix_monthly_budgets_user_id ON monthly_budgets(user_id);

-- 5. Create enum types for meals
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mealtypeenum') THEN
        CREATE TYPE mealtypeenum AS ENUM ('breakfast', 'lunch', 'dinner');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mealstatusenum') THEN
        CREATE TYPE mealstatusenum AS ENUM ('draft', 'confirmed');
    END IF;
END
$$;

-- 6. Create meals table
CREATE TABLE IF NOT EXISTS meals (
    id VARCHAR PRIMARY KEY,
    user_id UUID NOT NULL,
    meal_date DATE NOT NULL,
    meal_type mealtypeenum NOT NULL,
    status mealstatusenum NOT NULL,
    name VARCHAR NOT NULL,
    kcal INTEGER NOT NULL,
    cost INTEGER NOT NULL,
    protein INTEGER NOT NULL,
    fat INTEGER NOT NULL,
    carbohydrates INTEGER NOT NULL,
    ingredients JSON NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uix_user_meal_date_type UNIQUE (user_id, meal_date, meal_type)
);

CREATE INDEX IF NOT EXISTS ix_meals_user_id ON meals(user_id);
CREATE INDEX IF NOT EXISTS ix_meals_meal_date ON meals(meal_date);

-- 7. Create alembic_version table (for tracking migrations)
CREATE TABLE IF NOT EXISTS alembic_version (
    version_num VARCHAR(32) NOT NULL,
    CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num)
);

-- Insert the latest migration version
INSERT INTO alembic_version (version_num) VALUES ('b2c3d4e5f6a7')
ON CONFLICT (version_num) DO NOTHING;

-- Verification query
SELECT 'Migration completed successfully!' as status;
