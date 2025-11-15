-- Create country_progress table to track quiz completion per country
CREATE TABLE IF NOT EXISTS country_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  country_code TEXT NOT NULL,
  region_name TEXT NOT NULL,
  quiz_passed BOOLEAN DEFAULT FALSE,
  quiz_score INTEGER DEFAULT 0,
  quiz_total INTEGER DEFAULT 5,
  times_quizzed INTEGER DEFAULT 0,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, country_code)
);

-- Enable Row Level Security
ALTER TABLE country_progress ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can view their own progress
CREATE POLICY "Users can view own progress"
  ON country_progress FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own progress
CREATE POLICY "Users can insert own progress"
  ON country_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own progress
CREATE POLICY "Users can update own progress"
  ON country_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_country_progress_user_id ON country_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_country_progress_country_code ON country_progress(country_code);
CREATE INDEX IF NOT EXISTS idx_country_progress_region ON country_progress(region_name);

