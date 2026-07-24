-- Add run_goal and swim_goal columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS run_goal TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS swim_goal TEXT;
