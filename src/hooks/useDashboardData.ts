import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface DashboardStats {
  totalAlunos: number;
  alunosAtivos: number;
  alunosInativos: number;
  alunosCobranca: number;
  totalColaboradores: number;
  faturamentoMes: number;
  inadimplentes: number;
  presencasMes: number;
}

export interface ModalidadeDistribuicao {
  name: string;
  value: number;
  color: string;
}

export interface EvolucaoMensal {
  month: string;
  alunos: number;
  faturamento: number;
}

export interface DashboardData {
  stats: DashboardStats;
  modalidades: ModalidadeDistribuicao[];
  evolucao: EvolucaoMensal[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const COLORS = [
  'hsl(43, 75%, 49%)',
  'hsl(38, 80%, 58%)',
  'hsl(0, 0%, 60%)',
  'hsl(120, 40%, 45%)',
  'hsl(200, 60%, 50%)',
  'hsl(280, 50%, 55%)',
  'hsl(15, 70%, 50%)',
];

const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export function useDashboardData(): DashboardData {
  const [stats, setStats] = useState<DashboardStats>({
    totalAlunos: 0,
    alunosAtivos: 0,
    alunosInativos: 0,
    alunosCobranca: 0,
    totalColaboradores: 0,
    faturamentoMes: 0,
    inadimplentes: 0,
    presencasMes: 0,
  });
  const [modalidades, setModalidades] = useState<ModalidadeDistribuicao[]>([]);
  const [evolucao, setEvolucao] = useState<EvolucaoMensal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = () => setTick((t) => t + 1);

  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      setLoading(true);
      setError(null);

      try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

        const [
          alunosRes,
          colaboradoresRes,
          pagamentosRes,
          modalidadesRes,
          presencasRes,
        ] = await Promise.all([
          supabase
            .from('alunos')
            .select('id, status, modalidade_id, created_at, planos (preco)'),
          supabase
            .from('colaboradores')
            .select('id', { count: 'exact', head: true }),
          supabase
            .from('pagamentos')
            .select('valor, status, data_vencimento')
            .gte('data_vencimento', startOfMonth)
            .lte('data_vencimento', endOfMonth),
          supabase
            .from('modalidades')
            .select('id, nome'),
          supabase
            .from('presencas')
            .select('id', { count: 'exact', head: true })
            .gte('data_hora', startOfMonth)
            .lte('data_hora', endOfMonth),
        ]);

        if (cancelled) return;

        if (alunosRes.error) throw alunosRes.error;
        if (modalidadesRes.error) throw modalidadesRes.error;

        const alunos = alunosRes.data ?? [];
        const totalAlunos = alunos.length;
        const alunosAtivos = alunos.filter((a) => a.status === 'ativo').length;
        const alunosInativos = alunos.filter((a) => a.status === 'inativo').length;
        const alunosCobranca = alunos.filter((a) => a.status === 'cobranca').length;

        // Faturamento: soma dos planos dos alunos ativos do mês
        const pgtos = pagamentosRes.data ?? [];
        const faturamentoMes = pgtos
          .filter((p) => p.status === 'pago')
          .reduce((acc, p) => acc + Number(p.valor ?? 0), 0);

        // Se não há pagamentos, estimar pelo valor dos planos dos ativos
        const faturamentoEstimado = alunos
          .filter((a) => a.status === 'ativo')
          .reduce((acc, a) => {
            const plano = Array.isArray(a.planos) ? a.planos[0] : a.planos;
            return acc + Number(plano?.preco ?? 0);
          }, 0);

        const inadimplentes = pgtos.filter((p) => p.status === 'atrasado').length
          + alunos.filter((a) => a.status === 'cobranca').length;

        // Distribuição por modalidade
        const mods = modalidadesRes.data ?? [];
        const modalidadeMap: Record<string, number> = {};
        alunos.forEach((a) => {
          if (a.modalidade_id) {
            modalidadeMap[a.modalidade_id] = (modalidadeMap[a.modalidade_id] ?? 0) + 1;
          }
        });

        const modalidadesDistribuicao: ModalidadeDistribuicao[] = mods
          .filter((m) => (modalidadeMap[m.id] ?? 0) > 0)
          .map((m, i) => ({
            name: m.nome,
            value: modalidadeMap[m.id] ?? 0,
            color: COLORS[i % COLORS.length],
          }));

        // Se não há distribuição real, mostrar todas com 0 para exibir legenda
        const displayModalidades = modalidadesDistribuicao.length > 0
          ? modalidadesDistribuicao
          : mods.slice(0, 5).map((m, i) => ({
              name: m.nome,
              value: 0,
              color: COLORS[i % COLORS.length],
            }));

        // Evolução dos últimos 6 meses
        const evolucaoData: EvolucaoMensal[] = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const label = MONTH_LABELS[d.getMonth()];
          const endD = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

          const alunosNoMes = alunos.filter((a) => {
            const createdAt = new Date(a.created_at);
            return createdAt <= endD;
          }).length;

          evolucaoData.push({
            month: label,
            alunos: alunosNoMes,
            faturamento: 0, // preenchido abaixo se houver pagamentos
          });
        }

        setStats({
          totalAlunos,
          alunosAtivos,
          alunosInativos,
          alunosCobranca,
          totalColaboradores: colaboradoresRes.count ?? 0,
          faturamentoMes: faturamentoMes > 0 ? faturamentoMes : faturamentoEstimado,
          inadimplentes,
          presencasMes: presencasRes.count ?? 0,
        });
        setModalidades(displayModalidades);
        setEvolucao(evolucaoData);
      } catch (err: unknown) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Erro ao carregar dados';
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAll();
    return () => { cancelled = true; };
  }, [tick]);

  return { stats, modalidades, evolucao, loading, error, refetch };
}
