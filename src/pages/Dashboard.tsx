import { AppLayout } from '@/components/AppLayout';
import {
  Users,
  DollarSign,
  AlertTriangle,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  UsersRound,
  CalendarCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Button } from '@/components/ui/button';

// ─── helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(val: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
}

const TOOLTIP_STYLE = {
  background: 'hsl(0,0%,10%)',
  border: '1px solid hsl(0,0%,18%)',
  borderRadius: '8px',
  color: 'hsl(0,0%,95%)',
};

// ─── skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-white/5 ${className}`}
      aria-hidden="true"
    />
  );
}

function StatSkeleton() {
  return (
    <div className="stat-card space-y-3">
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}

// ─── stat card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string;
  sub?: string;
  change?: string;
  positive?: boolean;
  icon: React.ElementType;
}

function StatCard({ title, value, sub, change, positive, icon: Icon }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-4">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
        {change && (
          <span
            className={`flex items-center text-xs font-medium ${
              positive ? 'text-success' : 'text-danger'
            }`}
          >
            {positive ? (
              <ArrowUpRight className="h-3 w-3 mr-0.5" aria-hidden="true" />
            ) : (
              <ArrowDownRight className="h-3 w-3 mr-0.5" aria-hidden="true" />
            )}
            {change}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{title}</p>
      {sub && <p className="text-xs text-muted-foreground/70 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── error state ───────────────────────────────────────────────────────────────

function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm"
    >
      <span className="text-danger font-medium">{message}</span>
      <Button size="sm" variant="outline" onClick={onRetry} className="shrink-0">
        <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
        Tentar novamente
      </Button>
    </div>
  );
}

// ─── dashboard ─────────────────────────────────────────────────────────────────

const Dashboard = () => {
  const { stats, modalidades, evolucao, loading, error, refetch } = useDashboardData();

  const taxaAtividade =
    stats.totalAlunos > 0
      ? Math.round((stats.alunosAtivos / stats.totalAlunos) * 100)
      : 0;

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-display font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Visão geral em tempo real — dados direto do banco
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={loading}
            aria-label="Atualizar dados"
            className="shrink-0"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            Atualizar
          </Button>
        </div>

        {/* Error */}
        {error && <ErrorBanner message={error} onRetry={refetch} />}

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
          ) : (
            <>
              <StatCard
                title="Alunos Cadastrados"
                value={String(stats.totalAlunos)}
                sub={`${stats.alunosAtivos} ativos · ${stats.alunosInativos} inativos`}
                icon={Users}
              />
              <StatCard
                title="Faturamento Potencial"
                value={formatCurrency(stats.faturamentoMes)}
                sub="Soma dos planos dos alunos ativos"
                positive
                icon={DollarSign}
              />
              <StatCard
                title="Em Cobrança / Inadimplentes"
                value={String(stats.inadimplentes)}
                sub={`${stats.alunosCobranca} marcados em cobrança`}
                positive={stats.inadimplentes === 0}
                change={stats.inadimplentes > 0 ? 'atenção' : 'ok'}
                icon={AlertTriangle}
              />
              <StatCard
                title="Taxa de Atividade"
                value={`${taxaAtividade}%`}
                sub={`${stats.presencasMes} presenças este mês`}
                positive={taxaAtividade >= 70}
                change={taxaAtividade >= 70 ? 'boa' : 'baixa'}
                icon={Activity}
              />
            </>
          )}
        </div>

        {/* Secondary stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {loading ? (
            Array.from({ length: 2 }).map((_, i) => <StatSkeleton key={i} />)
          ) : (
            <>
              <StatCard
                title="Equipe / Colaboradores"
                value={String(stats.totalColaboradores)}
                sub="Professores e staff cadastrados"
                icon={UsersRound}
              />
              <StatCard
                title="Presenças no Mês"
                value={String(stats.presencasMes)}
                sub="Registradas via check-in"
                positive={stats.presencasMes > 0}
                icon={CalendarCheck}
              />
            </>
          )}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Evolução de alunos (bar) */}
          <div className="stat-card lg:col-span-2">
            <h3 className="font-display text-lg font-semibold mb-4">
              Evolução de Alunos — últimos 6 meses
            </h3>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={evolucao}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,18%)" />
                  <XAxis dataKey="month" stroke="hsl(0,0%,55%)" fontSize={12} />
                  <YAxis stroke="hsl(0,0%,55%)" fontSize={12} allowDecimals={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar
                    dataKey="alunos"
                    name="Alunos acumulados"
                    fill="hsl(43,75%,49%)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Distribuição por modalidade (pie) */}
          <div className="stat-card">
            <h3 className="font-display text-lg font-semibold mb-4">
              Distribuição por Modalidade
            </h3>
            {loading ? (
              <Skeleton className="h-48 w-full" />
            ) : modalidades.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">
                Sem dados de modalidades
              </p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={modalidades}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      dataKey="value"
                      stroke="none"
                    >
                      {modalidades.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      formatter={(v: number) => [`${v} aluno${v !== 1 ? 's' : ''}`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-3">
                  {modalidades.map((m) => {
                    const total = modalidades.reduce((a, b) => a + b.value, 0);
                    const pct = total > 0 ? Math.round((m.value / total) * 100) : 0;
                    return (
                      <div key={m.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2.5 w-2.5 rounded-full shrink-0"
                            style={{ background: m.color }}
                            aria-hidden="true"
                          />
                          <span className="text-muted-foreground">{m.name}</span>
                        </div>
                        <span className="font-medium tabular-nums">
                          {m.value} ({pct}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Status breakdown */}
        {!loading && stats.totalAlunos > 0 && (
          <div className="stat-card">
            <h3 className="font-display text-lg font-semibold mb-6">
              Situação Geral dos Alunos
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  label: 'Ativos',
                  count: stats.alunosAtivos,
                  color: 'bg-success/20 text-success border-success/30',
                  bar: 'bg-success',
                },
                {
                  label: 'Inativos',
                  count: stats.alunosInativos,
                  color: 'bg-danger/20 text-danger border-danger/30',
                  bar: 'bg-danger',
                },
                {
                  label: 'Em Cobrança',
                  count: stats.alunosCobranca,
                  color: 'bg-warning/20 text-warning border-warning/30',
                  bar: 'bg-warning',
                },
              ].map(({ label, count, color, bar }) => {
                const pct = stats.totalAlunos > 0 ? (count / stats.totalAlunos) * 100 : 0;
                return (
                  <div key={label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full border text-xs font-medium ${color}`}
                      >
                        {label}
                      </span>
                      <span className="font-bold tabular-nums">
                        {count}{' '}
                        <span className="text-muted-foreground font-normal text-xs">
                          ({Math.round(pct)}%)
                        </span>
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${bar}`}
                        style={{ width: `${pct}%` }}
                        role="progressbar"
                        aria-valuenow={Math.round(pct)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && stats.totalAlunos === 0 && !error && (
          <div className="stat-card text-center py-16 space-y-3">
            <Users className="h-12 w-12 text-muted-foreground/40 mx-auto" aria-hidden="true" />
            <p className="font-display text-lg font-semibold text-muted-foreground">
              Nenhum dado ainda
            </p>
            <p className="text-sm text-muted-foreground/70">
              Cadastre alunos na página de Matrícula para ver os dados aqui.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
