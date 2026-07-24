-- Migration: Métricas detalhadas de treino + subjetivas
-- Execute no SQL Editor do Supabase

-- Métricas subjetivas atualizadas (workouts)
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS feedback_effort VARCHAR(20);
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS feedback_energy INTEGER;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS feedback_sleep INTEGER;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS feedback_stress INTEGER;

-- Métricas detalhadas do Strava (workouts)
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS actual_max_heartrate FLOAT;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS actual_cadence FLOAT;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS actual_elevation FLOAT;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS actual_moving_time INTEGER;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS actual_elapsed_time INTEGER;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS actual_swolf FLOAT;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS splits JSONB;

-- Métricas calculadas pelo sistema (workouts)
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS intensity_zone VARCHAR(5);
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS load_score FLOAT;

-- Métricas consolidadas do perfil
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS best_5k_pace FLOAT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS best_10k_pace FLOAT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_weekly_volume FLOAT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_weekly_load FLOAT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
