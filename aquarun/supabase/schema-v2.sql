-- ============================================
-- AquaRun - Schema Completo v2
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- ============================================
-- 1. TABELA DE PERFIS
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  strava_athlete_id BIGINT,
  strava_athlete JSONB,
  strava_tokens JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dados pessoais (Onboarding)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender VARCHAR(20);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS weight FLOAT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS height FLOAT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS state TEXT;

-- Experiência e corrida (Onboarding)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS running_experience TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS training_days_per_week INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS activity_level TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS max_distance TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS comfortable_pace TEXT;

-- Natação (Onboarding)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS swimming_experience TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS swimming_frequency TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS main_stroke TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS swim_distance TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS swim_pace TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_pool_access BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS open_water_experience BOOLEAN DEFAULT FALSE;

-- Saúde (Onboarding)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_injuries TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS injury_history TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS medications TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS chronic_diseases TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS physical_limitations TEXT;

-- Planejamento (Onboarding)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS run_days TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS swim_days TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS training_weekdays TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS long_run_day TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS start_date DATE;

-- Objetivos
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS run_goal TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS swim_goal TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS main_goal TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS custom_goal TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS race_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS target_run_pace TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS target_run_distance TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS target_swim_pace TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS target_swim_distance TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS open_water_distance TEXT;

-- Status
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_week INTEGER DEFAULT 1;

-- Índices
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON profiles(onboarding_completed);

-- ============================================
-- 2. TABELA DE ATIVIDADES (Strava)
-- ============================================
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  strava_id BIGINT UNIQUE,
  type VARCHAR(10) NOT NULL CHECK (type IN ('run', 'swim')),
  name VARCHAR(255),
  distance FLOAT,
  moving_time INTEGER,
  elapsed_time INTEGER,
  start_date TIMESTAMP WITH TIME ZONE,
  average_heartrate FLOAT,
  average_speed FLOAT,
  total_elevation_gain FLOAT,
  calories FLOAT,
  splits JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_strava_id ON activities(strava_id);

-- ============================================
-- 3. TABELA DE TREINOS
-- ============================================
CREATE TABLE IF NOT EXISTS workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('run', 'swim', 'rest')),
  name VARCHAR(255),
  description TEXT,
  scheduled_date DATE,
  duration INTEGER,
  intervals JSONB,
  week_number INTEGER,
  status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'completed', 'skipped', 'missed')),
  completed_activity_id UUID REFERENCES activities(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Performance real (preenchido pelo Strava ao concluir)
  actual_distance FLOAT,
  actual_duration INTEGER,
  actual_pace FLOAT,
  actual_heartrate FLOAT,
  actual_calories FLOAT,

  -- Feedback do atleta (após treino)
  feedback_exhaustion INTEGER CHECK (feedback_exhaustion BETWEEN 1 AND 10),
  feedback_pain TEXT,
  feedback_notes TEXT,

  -- Planejamento (o que foi prescrito)
  planned_distance FLOAT,
  planned_pace TEXT
);

CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_scheduled_date ON workouts(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_workouts_week_number ON workouts(week_number);

-- ============================================
-- 4. TABELA DE LOGS SEMANAIS (Evolução)
-- ============================================
CREATE TABLE IF NOT EXISTS week_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  week_number INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  -- Métricas da semana
  avg_exhaustion FLOAT,
  total_run_distance FLOAT,
  total_swim_distance FLOAT,
  total_run_time INTEGER,
  total_swim_time INTEGER,
  total_workouts INTEGER,
  completed_workouts INTEGER,
  skipped_workouts INTEGER,

  -- Performance média
  avg_run_pace FLOAT,
  avg_swim_pace FLOAT,
  avg_heartrate FLOAT,

  -- Feedback consolidado
  pain_report TEXT,
  notes TEXT,
  plan_adjustments TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_week_logs_user_id ON week_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_week_logs_week_number ON week_logs(week_number);

-- ============================================
-- 5. RLS (Row Level Security)
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE week_logs ENABLE ROW LEVEL SECURITY;

-- Políticas profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas activities
CREATE POLICY "Users can view own activities" ON activities
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activities" ON activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own activities" ON activities
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own activities" ON activities
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas workouts
CREATE POLICY "Users can view own workouts" ON workouts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workouts" ON workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workouts" ON workouts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workouts" ON workouts
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas week_logs
CREATE POLICY "Users can view own week_logs" ON week_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own week_logs" ON week_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own week_logs" ON week_logs
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 6. TRIGGER - Criar perfil no signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
