import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  User,
  CreditCard,
  CalendarCheck,
  MessageSquare,
  Dumbbell,
  Clock,
  CheckCircle2,
  AlertCircle,
  Crown,
  ChevronRight,
} from "lucide-react";

const alunoData = {
  nome: "Carlos Silva",
  cpf: "123.456.789-00",
  whatsapp: "(11) 99999-0001",
  foto: null,
  modalidade: "Musculação",
  plano: "Mensal",
  status: "ativo" as const,
  vencimento: "15/03/2026",
  frequencia: 18,
  totalDias: 22,
  dataMatricula: "10/01/2025",
};

const pagamentos = [
  { id: 1, mes: "Fev/2026", valor: "R$ 129,90", status: "pago", data: "05/02/2026", metodo: "PIX" },
  { id: 2, mes: "Jan/2026", valor: "R$ 129,90", status: "pago", data: "03/01/2026", metodo: "Cartão" },
  { id: 3, mes: "Dez/2025", valor: "R$ 129,90", status: "pago", data: "02/12/2025", metodo: "PIX" },
  { id: 4, mes: "Nov/2025", valor: "R$ 129,90", status: "atrasado", data: "-", metodo: "-" },
  { id: 5, mes: "Out/2025", valor: "R$ 129,90", status: "pago", data: "01/10/2025", metodo: "Boleto" },
];

const checkins = [
  { id: 1, turma: "Musculação — Manhã", horario: "07:00", data: "14/02/2026", status: "confirmado" },
  { id: 2, turma: "Musculação — Manhã", horario: "07:00", data: "13/02/2026", status: "confirmado" },
  { id: 3, turma: "Musculação — Manhã", horario: "07:00", data: "12/02/2026", status: "confirmado" },
  { id: 4, turma: "Funcional — Tarde", horario: "16:00", data: "11/02/2026", status: "confirmado" },
  { id: 5, turma: "Musculação — Manhã", horario: "07:00", data: "10/02/2026", status: "falta" },
];

const turmasDisponiveis = [
  { id: 1, nome: "Musculação — Manhã", horario: "07:00 - 08:00", vagas: 12, total: 30 },
  { id: 2, nome: "Musculação — Tarde", horario: "16:00 - 17:00", vagas: 5, total: 30 },
  { id: 3, nome: "Funcional — Manhã", horario: "08:00 - 09:00", vagas: 20, total: 30 },
];

const timelinePosts = [
  {
    id: 1,
    autor: "Academia Olimpo",
    texto: "🏆 Novo horário de Cross Training disponível! Segundas e Quartas às 19h.",
    data: "14/02/2026",
    curtidas: 24,
    fixado: true,
  },
  {
    id: 2,
    autor: "Academia Olimpo",
    texto: "💪 Promoção de Carnaval! Indique um amigo e ganhe 15% de desconto na próxima mensalidade.",
    data: "12/02/2026",
    curtidas: 42,
    fixado: true,
  },
  {
    id: 3,
    autor: "João Mendes",
    texto: "Mais um dia de treino pesado! 💪🔥 #OlimpoFit",
    data: "13/02/2026",
    curtidas: 8,
    fixado: false,
  },
];

const statusPagamento: Record<string, { label: string; class: string }> = {
  pago: { label: "Pago", class: "bg-success/20 text-success border-success/30" },
  pendente: { label: "Pendente", class: "bg-warning/20 text-warning border-warning/30" },
  atrasado: { label: "Atrasado", class: "bg-danger/20 text-danger border-danger/30" },
};

const AreaAluno = () => {
  const [tab, setTab] = useState("meu-plano");
  const frequenciaPercent = Math.round((alunoData.frequencia / alunoData.totalDias) * 100);

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header do aluno */}
        <div className="stat-card flex flex-col sm:flex-row items-center gap-6">
          <div className="h-20 w-20 rounded-full gold-gradient flex items-center justify-center text-primary-foreground font-display text-3xl font-bold shrink-0">
            {alunoData.nome.charAt(0)}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-display font-bold">{alunoData.nome}</h1>
            <p className="text-muted-foreground mt-1">
              {alunoData.modalidade} · Plano {alunoData.plano}
            </p>
            <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
              <Badge variant="outline" className="bg-success/20 text-success border-success/30">
                Ativo
              </Badge>
              <Badge variant="outline" className="border-border text-muted-foreground">
                Desde {alunoData.dataMatricula}
              </Badge>
            </div>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-xs text-muted-foreground">Próximo vencimento</p>
            <p className="text-lg font-semibold gold-text">{alunoData.vencimento}</p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="stat-card text-center">
            <Dumbbell className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Modalidade</p>
            <p className="font-semibold text-sm">{alunoData.modalidade}</p>
          </div>
          <div className="stat-card text-center">
            <CreditCard className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Plano</p>
            <p className="font-semibold text-sm">{alunoData.plano}</p>
          </div>
          <div className="stat-card text-center">
            <CalendarCheck className="h-5 w-5 text-success mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Frequência</p>
            <p className="font-semibold text-sm">{alunoData.frequencia}/{alunoData.totalDias} dias</p>
          </div>
          <div className="stat-card text-center">
            <Clock className="h-5 w-5 text-warning mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Vencimento</p>
            <p className="font-semibold text-sm">{alunoData.vencimento}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full grid grid-cols-4 bg-card border border-border">
            <TabsTrigger value="meu-plano" className="data-[state=active]:gold-gradient data-[state=active]:text-primary-foreground text-xs sm:text-sm">
              <Crown className="h-4 w-4 mr-1 hidden sm:inline" />
              Meu Plano
            </TabsTrigger>
            <TabsTrigger value="checkin" className="data-[state=active]:gold-gradient data-[state=active]:text-primary-foreground text-xs sm:text-sm">
              <CalendarCheck className="h-4 w-4 mr-1 hidden sm:inline" />
              Check-in
            </TabsTrigger>
            <TabsTrigger value="pagamentos" className="data-[state=active]:gold-gradient data-[state=active]:text-primary-foreground text-xs sm:text-sm">
              <CreditCard className="h-4 w-4 mr-1 hidden sm:inline" />
              Pagamentos
            </TabsTrigger>
            <TabsTrigger value="timeline" className="data-[state=active]:gold-gradient data-[state=active]:text-primary-foreground text-xs sm:text-sm">
              <MessageSquare className="h-4 w-4 mr-1 hidden sm:inline" />
              Timeline
            </TabsTrigger>
          </TabsList>

          {/* Meu Plano */}
          <TabsContent value="meu-plano" className="space-y-4 mt-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Crown className="h-5 w-5 text-primary" />
                  Detalhes do Plano
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Modalidade</p>
                    <p className="font-medium">{alunoData.modalidade}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Plano</p>
                    <p className="font-medium">{alunoData.plano}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Valor</p>
                    <p className="font-medium gold-text">R$ 129,90/mês</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Próximo Vencimento</p>
                    <p className="font-medium">{alunoData.vencimento}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarCheck className="h-5 w-5 text-success" />
                  Frequência Mensal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="font-medium">{frequenciaPercent}%</span>
                </div>
                <Progress value={frequenciaPercent} className="h-3" />
                <p className="text-xs text-muted-foreground">
                  Você compareceu {alunoData.frequencia} de {alunoData.totalDias} dias úteis este mês.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Check-in */}
          <TabsContent value="checkin" className="space-y-4 mt-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Fazer Check-in</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {turmasDisponiveis.map((turma) => (
                  <div
                    key={turma.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/30 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{turma.nome}</p>
                      <p className="text-sm text-muted-foreground">{turma.horario}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {turma.vagas}/{turma.total} vagas
                      </span>
                      <Button size="sm" className="gold-gradient text-primary-foreground">
                        Check-in
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Histórico de Presença</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {checkins.map((ci) => (
                  <div key={ci.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      {ci.status === "confirmado" ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-danger" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{ci.turma}</p>
                        <p className="text-xs text-muted-foreground">{ci.data} · {ci.horario}</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        ci.status === "confirmado"
                          ? "bg-success/20 text-success border-success/30"
                          : "bg-danger/20 text-danger border-danger/30"
                      }
                    >
                      {ci.status === "confirmado" ? "Presente" : "Falta"}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pagamentos */}
          <TabsContent value="pagamentos" className="space-y-4 mt-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Histórico de Pagamentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {pagamentos.map((pag) => (
                    <div
                      key={pag.id}
                      className="flex items-center justify-between py-3 border-b border-border last:border-0"
                    >
                      <div>
                        <p className="font-medium text-sm">{pag.mes}</p>
                        <p className="text-xs text-muted-foreground">
                          {pag.data !== "-" ? `Pago em ${pag.data} · ${pag.metodo}` : "Aguardando pagamento"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-sm">{pag.valor}</span>
                        <Badge variant="outline" className={statusPagamento[pag.status].class}>
                          {statusPagamento[pag.status].label}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline */}
          <TabsContent value="timeline" className="space-y-4 mt-4">
            {timelinePosts.map((post) => (
              <Card key={post.id} className={`bg-card border-border ${post.fixado ? "border-primary/30" : ""}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full gold-gradient flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                      {post.autor.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{post.autor}</span>
                        {post.fixado && (
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
                            Fixado
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">{post.data}</span>
                      </div>
                      <p className="text-sm mt-2">{post.texto}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <button className="text-xs text-muted-foreground hover:text-primary transition-colors">
                          ❤️ {post.curtidas}
                        </button>
                        <button className="text-xs text-muted-foreground hover:text-primary transition-colors">
                          💬 Comentar
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AreaAluno;
