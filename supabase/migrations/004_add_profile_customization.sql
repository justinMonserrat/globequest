-- Add profile customization fields
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS country_from TEXT,
ADD COLUMN IF NOT EXISTS favorite_flag TEXT,
ADD COLUMN IF NOT EXISTS country_to_visit TEXT,
ADD COLUMN IF NOT EXISTS countries_visited TEXT[] DEFAULT '{}';

-- Update existing profiles to have display_name from username or email
UPDATE profiles
SET display_name = COALESCE(username, split_part(email, '@', 1))
WHERE display_name IS NULL;

