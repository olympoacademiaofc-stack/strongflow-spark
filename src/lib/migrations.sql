-- Adicionar novos campos na tabela turmas
ALTER TABLE turmas 
ADD COLUMN IF NOT EXISTS modalidade_id UUID REFERENCES modalidades(id),
ADD COLUMN IF NOT EXISTS hora_inicio TIME NOT NULL,
ADD COLUMN IF NOT EXISTS hora_fim TIME NOT NULL,
ADD COLUMN IF NOT EXISTS vagas_total INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS vagas_disponiveis INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS dia_semana TEXT NOT NULL;

-- Criar tabela de inscrições de alunos em turmas
CREATE TABLE IF NOT EXISTS inscricoes_turma (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE,
  turma_id UUID REFERENCES turmas(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'ativo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(aluno_id, turma_id)
);

-- Criar tabela de check-ins
CREATE TABLE IF NOT EXISTS checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE,
  turma_id UUID REFERENCES turmas(id) ON DELETE CASCADE,
  data_checkin TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'confirmado'
);

-- Habilitar RLS
ALTER TABLE inscricoes_turma ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

-- Policies para inscricoes_turma
CREATE POLICY "Alunos podem ver suas inscrições" ON inscricoes_turma
  FOR SELECT USING (aluno_id = auth.uid());

CREATE POLICY "Alunos podem criar inscrição" ON inscricoes_turma
  FOR INSERT WITH CHECK (aluno_id = auth.uid());

CREATE POLICY "Alunos podem cancelar inscrição" ON inscricoes_turma
  FOR DELETE USING (aluno_id = auth.uid());

-- Policies para checkins
CREATE POLICY "Usuários podem inserir checkin" ON checkins
  FOR INSERT WITH CHECK (aluno_id = auth.uid());

CREATE POLICY "Professores podem ver checkins das turmas" ON checkins
  FOR SELECT USING (true);
