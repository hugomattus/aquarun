-- ============================================
-- AquaRun - Etapa 2: Preferências de Corrida
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- Adicionar colunas para preferências de corrida
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS running_experience VARCHAR(20) CHECK (running_experience IN ('never', 'beginner', 'intermediate', 'advanced')),
  ADD COLUMN IF NOT EXISTS training_days_per_week INTEGER CHECK (training_days_per_week BETWEEN 1 AND 6),
  ADD COLUMN IF NOT EXISTS preferred_time VARCHAR(20) CHECK (preferred_time IN ('morning', 'afternoon', 'evening', 'any')),
  ADD COLUMN IF NOT EXISTS activity_level VARCHAR(20) CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'intense', 'athlete')),
  ADD COLUMN IF NOT EXISTS max_distance VARCHAR(20) CHECK (max_distance IN ('5km', '5-10km', '10-15km', '21-30km', '30-42km', '42+km')),
  ADD COLUMN IF NOT EXISTS comfortable_pace VARCHAR(20);
