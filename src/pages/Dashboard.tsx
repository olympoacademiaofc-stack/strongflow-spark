import { AppLayout } from "@/components/AppLayout";
import {
  Users,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
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
} from "recharts";

const monthlyData = [
  { month: "Set", receita: 28000, alunos: 120 },
  { month: "Out", receita: 32000, alunos: 135 },
  { month: "Nov", receita: 35000, alunos: 148 },
  { month: "Dez", receita: 30000, alunos: 140 },
  { month: "Jan", receita: 38000, alunos: 160 },
  { month: "Fev", receita: 42000, alunos: 175 },
];

const modalidadeData = [
  { name: "Musculação", value: 45, color: "hsl(43, 75%, 49%)" },
  { name: "Funcional", value: 20, color: "hsl(38, 80%, 58%)" },
  { name: "Cross Training", value: 15, color: "hsl(0, 0%, 50%)" },
  { name: "Dança", value: 10, color: "hsl(0, 0%, 35%)" },
  { name: "Personal", value: 10, color: "hsl(0, 0%, 70%)" },
];

const stats = [
  {
    title: "Alunos Ativos",
    value: "175",
    change: "+12%",
    positive: true,
    icon: Users,
  },
  {
    title: "Faturamento Mensal",
    value: "R$ 42.000",
    change: "+8%",
    positive: true,
    icon: DollarSign,
  },
  {
    title: "Inadimplentes",
    value: "14",
    change: "-3%",
    positive: true,
    icon: AlertTriangle,
  },
  {
    title: "Frequência Média",
    value: "78%",
    change: "+5%",
    positive: true,
    icon: TrendingUp,
  },
];

const Dashboard = () => {
  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Visão geral da sua academia</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.title} className="stat-card">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <span
                  className={`flex items-center text-xs font-medium ${
                    stat.positive ? "text-success" : "text-danger"
                  }`}
                >
                  {stat.positive ? (
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-0.5" />
                  )}
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.title}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue chart */}
          <div className="stat-card lg:col-span-2">
            <h3 className="font-display text-lg font-semibold mb-4">Faturamento</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,18%)" />
                <XAxis dataKey="month" stroke="hsl(0,0%,55%)" fontSize={12} />
                <YAxis stroke="hsl(0,0%,55%)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(0,0%,10%)",
                    border: "1px solid hsl(0,0%,18%)",
                    borderRadius: "8px",
                    color: "hsl(0,0%,95%)",
                  }}
                />
                <Bar dataKey="receita" fill="hsl(43,75%,49%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart */}
          <div className="stat-card">
            <h3 className="font-display text-lg font-semibold mb-4">Modalidades</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={modalidadeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  stroke="none"
                >
                  {modalidadeData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(0,0%,10%)",
                    border: "1px solid hsl(0,0%,18%)",
                    borderRadius: "8px",
                    color: "hsl(0,0%,95%)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {modalidadeData.map((m) => (
                <div key={m.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ background: m.color }} />
                    <span className="text-muted-foreground">{m.name}</span>
                  </div>
                  <span className="font-medium">{m.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Attendance trend */}
        <div className="stat-card">
          <h3 className="font-display text-lg font-semibold mb-4">Evolução de Alunos</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,18%)" />
              <XAxis dataKey="month" stroke="hsl(0,0%,55%)" fontSize={12} />
              <YAxis stroke="hsl(0,0%,55%)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "hsl(0,0%,10%)",
                  border: "1px solid hsl(0,0%,18%)",
                  borderRadius: "8px",
                  color: "hsl(0,0%,95%)",
                }}
              />
              <Line
                type="monotone"
                dataKey="alunos"
                stroke="hsl(43,75%,49%)"
                strokeWidth={2}
                dot={{ fill: "hsl(43,75%,49%)", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
