-- Todas as colunas faltantes de uma vez
-- Colunas de corrida/natação
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS run_goal TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS swim_goal TEXT;

-- Colunas de planejamento
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS target_run_pace TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS target_run_distance TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS target_swim_pace TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS target_swim_distance TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS run_days TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS swim_days TEXT[];

-- Coluna que deu erro
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS open_water_distance TEXT;
