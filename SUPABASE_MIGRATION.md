# Como executar as migrações no Supabase

## Passo 1: Acesse o Supabase
1. Vá para https://supabase.com/dashboard
2. Selecione seu projeto: `rybqrejixazcelobgzlo`

## Passo 2: Abra o SQL Editor
No menu à esquerda, clique em **SQL Editor** (ícone de console)

## Passo 3: Execute o SQL
Copie todo o código abaixo e cole na área de texto, depois clique em **Run**:

```sql
-- ADICIONAR COLUNAS NA TABELA TURMAS
ALTER TABLE turmas 
ADD COLUMN IF NOT EXISTS modalidade_id UUID,
ADD COLUMN IF NOT EXISTS hora_inicio TIME,
ADD COLUMN IF NOT EXISTS hora_fim TIME,
ADD COLUMN IF NOT EXISTS vagas_total INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS vagas_disponiveis INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS dia_semana TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ativa';

-- CRIAR TABELA DE INSCRIÇÕES
CREATE TABLE IF NOT EXISTS inscricoes_turma (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE,
  turma_id UUID REFERENCES turmas(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'ativo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(aluno_id, turma_id)
);

-- CRIAR TABELA DE CHECK-INS
CREATE TABLE IF NOT EXISTS checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE,
  turma_id UUID REFERENCES turmas(id) ON DELETE CASCADE,
  data_checkin TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'confirmado'
);
```
