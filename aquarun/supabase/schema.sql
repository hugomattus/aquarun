-- ============================================
-- AquaRun - Schema completo (idempotente)
-- Pode ser executado no SQL Editor do Supabase
-- quantas vezes precisar. Substitui os arquivos
-- setup.sql, schema-v2.sql, onboarding*.sql,
-- missing-columns.sql, detailed-metrics.sql,
-- workout-structure.sql, hr-vo2max.sql e
-- run-swim-goals.sql.
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

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS weight FLOAT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS height FLOAT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS state TEXT;

-- Experiência e corrida
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS running_experience VARCHAR(20) CHECK (running_experience IN ('never', 'beginner', 'intermediate', 'advanced'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS training_days_per_week INTEGER CHECK (training_days_per_week BETWEEN 1 AND 6);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS activity_level VARCHAR(20) CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'intense', 'athlete'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS max_distance VARCHAR(20) CHECK (max_distance IN ('5km', '5-10km', '10-15km', '21-30km', '30-42km', '42+km'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS comfortable_pace VARCHAR(20);

-- Natação
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS swimming_experience VARCHAR(20) CHECK (swimming_experience IN ('never', 'beginner', 'intermediate', 'advanced'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS swimming_frequency VARCHAR(20) CHECK (swimming_frequency IN ('rarely', '1-2x', '3-4x', '5x_plus'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS main_stroke VARCHAR(20) CHECK (main_stroke IN ('freestyle', 'backstroke', 'breaststroke', 'butterfly', 'mixed'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS swim_distance VARCHAR(20) CHECK (swim_distance IN ('pool_laps', '200m', '200-500m', '500m_1km', '1km_plus'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS swim_pace VARCHAR(20);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_pool_access BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS open_water_experience BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS open_water_distance TEXT;

-- Saúde
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_injuries TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS injury_history TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS medications TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS chronic_diseases TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS physical_limitations TEXT;

-- Planejamento
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS run_days TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS swim_days TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS training_weekdays TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS long_run_day VARCHAR(10) CHECK (long_run_day IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_time VARCHAR(20) CHECK (preferred_time IN ('morning', 'afternoon', 'evening', 'any'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS start_date DATE;

-- Objetivos
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS run_goal TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS swim_goal TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS main_goal VARCHAR(50) CHECK (main_goal IN ('walk', 'lose_weight', 'improve_fitness', 'first_3km', '5km', '10km', 'half_marathon', 'marathon', 'custom'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS custom_goal TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS race_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS target_run_pace TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS target_run_distance TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS target_swim_pace TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS target_swim_distance TEXT;

-- Fisiológicos
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fc_max FLOAT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vo2_max FLOAT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS resting_heartrate FLOAT;

-- Métricas consolidadas
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS best_5k_pace FLOAT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS best_10k_pace FLOAT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_weekly_volume FLOAT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_weekly_load FLOAT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;

-- Preferências (notificações, unidades etc.)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;

-- Status
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_week INTEGER DEFAULT 1;

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
  max_heartrate FLOAT,
  average_speed FLOAT,
  average_cadence FLOAT,
  total_elevation_gain FLOAT,
  calories FLOAT,
  splits JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE workouts ADD COLUMN IF NOT EXISTS structure JSONB;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS planned_distance FLOAT;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS planned_pace TEXT;

-- Performance real (Strava ou manual)
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS actual_distance FLOAT;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS actual_duration INTEGER;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS actual_pace FLOAT;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS actual_heartrate FLOAT;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS actual_max_heartrate FLOAT;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS actual_cadence FLOAT;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS actual_elevation FLOAT;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS actual_calories FLOAT;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS actual_strokes INTEGER;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS actual_swolf FLOAT;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS actual_moving_time INTEGER;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS actual_elapsed_time INTEGER;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS actual_stride_length FLOAT;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS actual_vo2max FLOAT;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS splits JSONB;

-- Feedback subjetivo
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS feedback_effort VARCHAR(20);
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS feedback_pain TEXT;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS feedback_energy INTEGER CHECK (feedback_energy BETWEEN 0 AND 10);
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS feedback_sleep INTEGER CHECK (feedback_sleep BETWEEN 0 AND 10);
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS feedback_stress INTEGER CHECK (feedback_stress BETWEEN 0 AND 10);
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS feedback_notes TEXT;

-- Métricas calculadas
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS intensity_zone VARCHAR(5);
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS load_score FLOAT;

-- ============================================
-- 4. TABELA DE LOGS SEMANAIS
-- ============================================
CREATE TABLE IF NOT EXISTS week_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  week_number INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  avg_exhaustion FLOAT,
  total_run_distance FLOAT,
  total_swim_distance FLOAT,
  total_run_time INTEGER,
  total_swim_time INTEGER,
  total_workouts INTEGER,
  completed_workouts INTEGER,
  skipped_workouts INTEGER,
  avg_run_pace FLOAT,
  avg_swim_pace FLOAT,
  avg_heartrate FLOAT,
  pain_report TEXT,
  notes TEXT,
  plan_adjustments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. ÍNDICES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON profiles(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_strava_id ON activities(strava_id);
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_scheduled_date ON workouts(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_workouts_week_number ON workouts(week_number);
CREATE INDEX IF NOT EXISTS idx_week_logs_user_id ON week_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_week_logs_week_number ON week_logs(week_number);

-- ============================================
-- 6. RLS (Row Level Security)
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE week_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view own activities" ON activities;
DROP POLICY IF EXISTS "Users can insert own activities" ON activities;
DROP POLICY IF EXISTS "Users can update own activities" ON activities;
DROP POLICY IF EXISTS "Users can delete own activities" ON activities;
CREATE POLICY "Users can view own activities" ON activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activities" ON activities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own activities" ON activities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own activities" ON activities FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can insert own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can update own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can delete own workouts" ON workouts;
CREATE POLICY "Users can view own workouts" ON workouts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workouts" ON workouts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workouts" ON workouts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workouts" ON workouts FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own week_logs" ON week_logs;
DROP POLICY IF EXISTS "Users can insert own week_logs" ON week_logs;
DROP POLICY IF EXISTS "Users can update own week_logs" ON week_logs;
CREATE POLICY "Users can view own week_logs" ON week_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own week_logs" ON week_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own week_logs" ON week_logs FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 7. TRIGGER - Criar perfil no signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 8. TABELA DE INSCRIÇÕES PUSH (Web Push)
-- ============================================
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  keys JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_reminder_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own push subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Users can insert own push subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Users can delete own push subscriptions" ON push_subscriptions;
CREATE POLICY "Users can view own push subscriptions" ON push_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own push subscriptions" ON push_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own push subscriptions" ON push_subscriptions FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 10. RPC - Excluir dados do próprio usuário
-- ============================================
CREATE OR REPLACE FUNCTION public.delete_my_data()
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  DELETE FROM public.week_logs WHERE user_id = auth.uid();
  DELETE FROM public.push_subscriptions WHERE user_id = auth.uid();
  DELETE FROM public.activities WHERE user_id = auth.uid();
  DELETE FROM public.workouts WHERE user_id = auth.uid();
  DELETE FROM public.profiles WHERE id = auth.uid();
END;
$$;