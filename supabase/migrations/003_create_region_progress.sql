-- Create region_progress table to track region completion
CREATE TABLE IF NOT EXISTS region_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  region_name TEXT NOT NULL,
  countries_completed INTEGER DEFAULT 0,
  countries_total INTEGER NOT NULL,
  completion_percentage NUMERIC(5, 2) DEFAULT 0,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, region_name)
);

-- Enable Row Level Security
ALTER TABLE region_progress ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can view their own region progress
CREATE POLICY "Users can view own region progress"
  ON region_progress FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own region progress
CREATE POLICY "Users can insert own region progress"
  ON region_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own region progress
CREATE POLICY "Users can update own region progress"
  ON region_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_region_progress_user_id ON region_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_region_progress_region ON region_progress(region_name);

