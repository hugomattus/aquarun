-- Missing columns from onboarding
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS open_water_distance TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS target_run_pace TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS target_run_distance TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS target_swim_pace TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS target_swim_distance TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS run_days TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS swim_days TEXT[];
