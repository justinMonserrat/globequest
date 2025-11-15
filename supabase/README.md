# Supabase Database Setup

This directory contains SQL migration files to set up the database schema for GlobeQuest.

## Setup Instructions

1. **Go to your Supabase project dashboard**: https://app.supabase.com

2. **Navigate to SQL Editor**: Click on "SQL Editor" in the left sidebar

3. **Run migrations in order**:
   - Run `001_create_profiles.sql` first
   - Then run `002_create_country_progress.sql`
   - Then run `003_create_region_progress.sql`
   - Finally run `004_add_profile_customization.sql`

   Or you can copy and paste all four files' contents into the SQL Editor and run them together.

## Tables Created

### `profiles`
Stores user profile information:
- `id` (UUID, Primary Key, references auth.users)
- `email` (TEXT)
- `username` (TEXT)
- `avatar_url` (TEXT)
- `xp` (INTEGER, default 0)
- `level` (INTEGER, default 1)
- `daily_streak` (INTEGER, default 0)
- `last_region_completed` (TEXT)
- `display_name` (TEXT) - Custom display name
- `country_from` (TEXT) - Country user is from
- `favorite_flag` (TEXT) - Favorite country flag
- `country_to_visit` (TEXT) - Country user wants to visit most
- `countries_visited` (TEXT[]) - Array of country codes visited
- `created_at`, `updated_at` (TIMESTAMP)

### `country_progress`
Tracks quiz completion per country:
- `id` (UUID, Primary Key)
- `user_id` (UUID, references auth.users)
- `country_code` (TEXT, e.g., "USA", "CAN")
- `region_name` (TEXT)
- `quiz_passed` (BOOLEAN)
- `quiz_score` (INTEGER)
- `quiz_total` (INTEGER)
- `times_quizzed` (INTEGER)
- `unlocked_at` (TIMESTAMP)
- `created_at`, `updated_at` (TIMESTAMP)
- Unique constraint on (user_id, country_code)

### `region_progress`
Tracks region completion:
- `id` (UUID, Primary Key)
- `user_id` (UUID, references auth.users)
- `region_name` (TEXT)
- `countries_completed` (INTEGER)
- `countries_total` (INTEGER)
- `completion_percentage` (NUMERIC)
- `unlocked_at` (TIMESTAMP)
- `created_at`, `updated_at` (TIMESTAMP)
- Unique constraint on (user_id, region_name)

## Row Level Security (RLS)

All tables have RLS enabled. Users can only:
- View their own data
- Insert their own data
- Update their own data

## Automatic Profile Creation

A trigger automatically creates a profile when a new user signs up via Supabase Auth.

