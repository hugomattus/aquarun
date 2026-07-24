-- Tabela para armazenar questoes geradas por IA
CREATE TABLE IF NOT EXISTS question_bank (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic TEXT NOT NULL,
  difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  nivel TEXT NOT NULL CHECK (nivel IN ('fundamental', 'medio', 'superior')),
  modalidade TEXT NOT NULL DEFAULT 'multipla-escolha',
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  options JSONB NOT NULL,
  source TEXT DEFAULT 'gemini',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: qualquer user autenticado pode ler
ALTER TABLE question_bank ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth read question_bank" ON question_bank
  FOR SELECT USING (auth.role() = 'authenticated');

-- Indices para performance
CREATE INDEX IF NOT EXISTS idx_question_bank_topic ON question_bank(topic);
CREATE INDEX IF NOT EXISTS idx_question_bank_difficulty ON question_bank(difficulty);
CREATE INDEX IF NOT EXISTS idx_question_bank_nivel ON question_bank(nivel);
