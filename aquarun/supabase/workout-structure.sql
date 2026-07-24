-- ============================================
-- AquaRun - Migration: Workout Structure
-- Execute no SQL Editor do Supabase
-- ============================================

-- Coluna JSON para estrutura completa do treino (11 seções)
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS structure JSONB;

-- Colunas para dados detalhados do Strava
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS actual_max_heartrate FLOAT;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS actual_cadence FLOAT;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS actual_elevation FLOAT;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS actual_moving_time INTEGER;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS actual_elapsed_time INTEGER;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS actual_swolf INTEGER;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS splits JSONB;

-- Colunas para dados detalhados do Strava (corrida)
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS actual_stride_length FLOAT;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS actual_vo2max FLOAT;

-- Feedback expandido
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS feedback_effort VARCHAR(20);
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS feedback_pain_score INTEGER CHECK (feedback_pain_score BETWEEN 0 AND 10);
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS feedback_energy INTEGER CHECK (feedback_energy BETWEEN 0 AND 10);
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS feedback_sleep INTEGER CHECK (feedback_sleep BETWEEN 0 AND 10);
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS feedback_stress INTEGER CHECK (feedback_stress BETWEEN 0 AND 10);

-- Métricas calculadas
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS intensity_zone VARCHAR(10);
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS load_score FLOAT;
