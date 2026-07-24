-- ============================================
-- AquaRun - Etapa: Preferências de Natação
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- Adicionar colunas para natação
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS swimming_experience VARCHAR(20) CHECK (swimming_experience IN ('never', 'beginner', 'intermediate', 'advanced')),
  ADD COLUMN IF NOT EXISTS swimming_frequency VARCHAR(20) CHECK (swimming_frequency IN ('rarely', '1-2x', '3-4x', '5x_plus')),
  ADD COLUMN IF NOT EXISTS main_stroke VARCHAR(20) CHECK (main_stroke IN ('freestyle', 'backstroke', 'breaststroke', 'butterfly', 'mixed')),
  ADD COLUMN IF NOT EXISTS swim_distance VARCHAR(20) CHECK (swim_distance IN ('pool_laps', '200m', '200-500m', '500m_1km', '1km_plus')),
  ADD COLUMN IF NOT EXISTS swim_pace VARCHAR(20),
  ADD COLUMN IF NOT EXISTS has_pool_access BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS open_water_experience BOOLEAN DEFAULT FALSE;
