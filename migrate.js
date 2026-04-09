const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rybqrejixazcelobgzlo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5YnFyZWppeGF6Y2Vsb2JnemxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzMDc5NDksImV4cCI6MjA5MDg4Mzk0OX0.j8tFH-vc4z4Bhx5GVolyjGlxrU9fDMB6xhvpVmHeZ2o';

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  console.log('Criando tabela inscricoes_turma...');
  
  try {
    const { error } = await supabase.rpc('create_inscricoes_turma', {});
    if (error) console.log('Erro:', error.message);
  } catch (e) {
    console.log('Erro ao criar via RPC');
  }
  
  console.log('Verificando estrutura atual...');
  const { data, error } = await supabase
    .from('turmas')
    .select('*')
    .limit(1);
    
  if (error) {
    console.log('Erro ao buscar turmas:', error.message);
  } else {
    console.log('Colunas disponíveis:', data ? Object.keys(data[0] || {}) : 'Nenhum dado');
  }
}

migrate();
