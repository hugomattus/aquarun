-- ============================================
-- AquaRun - Etapa: Saúde e Lesões
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- Adicionar colunas para saúde
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS current_injuries TEXT,
  ADD COLUMN IF NOT EXISTS injury_history TEXT,
  ADD COLUMN IF NOT EXISTS medications TEXT,
  ADD COLUMN IF NOT EXISTS chronic_diseases TEXT,
  ADD COLUMN IF NOT EXISTS physical_limitations TEXT;
