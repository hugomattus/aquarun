-- ============================================
-- AquaRun - Etapa 3: Planejamento
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- Adicionar colunas para planejamento
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS main_goal VARCHAR(50) CHECK (main_goal IN ('walk', 'lose_weight', 'improve_fitness', 'first_3km', '5km', '10km', 'half_marathon', 'marathon', 'custom')),
  ADD COLUMN IF NOT EXISTS custom_goal TEXT,
  ADD COLUMN IF NOT EXISTS race_date DATE,
  ADD COLUMN IF NOT EXISTS training_weekdays TEXT[],
  ADD COLUMN IF NOT EXISTS long_run_day VARCHAR(10) CHECK (long_run_day IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  ADD COLUMN IF NOT EXISTS start_date DATE;
