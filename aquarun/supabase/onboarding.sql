-- ============================================
-- AquaRun - Onboarding: Colunas do Perfil
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- Adicionar colunas para onboarding
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other')),
  ADD COLUMN IF NOT EXISTS weight FLOAT,
  ADD COLUMN IF NOT EXISTS height FLOAT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Criar índice para onboarding
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON profiles(onboarding_completed);
