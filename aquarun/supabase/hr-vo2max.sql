-- Adiciona campos de FC máxima, VO2max e FC repouso ao perfil
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fc_max FLOAT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vo2_max FLOAT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS resting_heartrate FLOAT;

-- Adiciona colunas que faltam na tabela activities
ALTER TABLE activities ADD COLUMN IF NOT EXISTS max_heartrate FLOAT;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS average_cadence FLOAT;

-- Adiciona braçadas totais na tabela workouts
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS actual_strokes INTEGER;
