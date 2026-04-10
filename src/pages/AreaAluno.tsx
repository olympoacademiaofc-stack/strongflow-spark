import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  CreditCard,
  CalendarCheck,
  Dumbbell,
  Clock,
  CheckCircle2,
  AlertCircle,
  Crown,
  Users,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

const AreaAluno = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState("meu-plano");
  const [loading, setLoading] = useState(true);
  const [alunoData, setAlunoData] = useState<any>(null);
  const [turmasDisponiveis, setTurmasDisponiveis] = useState<any[]>([]);
  const [minhasTurmas, setMinhasTurmas] = useState<any[]>([]);
  const [checkins, setCheckins] = useState<any[]>([]);
  const [inscricoes, setInscricoes] = useState<any[]>([]);

  useEffect(() => {
    console.log('AreaAluno: user:', user);
    if (user?.email) {
      console.log('AreaAluno: fetching data for:', user.email);
      fetchAlunoData();
    } else {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchAlunoData = async () => {
    console.log('fetchAlunoData started');
    try {
      console.log('Buscando aluno com email:', user?.email);
      const { data: aluno, error: alunoError } = await supabase
        .from('alunos')
        .select('*')
        .eq('email', user?.email)
        .single();
      
      console.log('Aluno resultado:', aluno, 'Erro:', alunoError);
      
      if (alunoError) {
        console.error('Erro ao buscar aluno:', alunoError);
        setLoading(false);
        return;
      }
      
      if (aluno) {
        setAlunoData(aluno);
        console.log('Aluno definido:', aluno);
        
        const { data: turmas } = await supabase
          .from('turmas')
          .select('*')
          .limit(20);
        
        setTurmasDisponiveis(turmas || []);
        console.log('Turmas definidas:', turmas?.length);

        setLoading(false);
        console.log('Loading definido para false');
      } else {
        console.log('Aluno não encontrado para email:', user?.email);
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Erro fetchAlunoData:', err);
      setLoading(false);
    }
  };

  const handleInscrever = async (turmaId: string) => {
    if (!alunoData) return;
    const { error } = await supabase.from('inscricoes_turma').insert([{
      aluno_id: alunoData.id,
      turma_id: turmaId
    }]);
    if (!error) {
      toast({ title: "Inscrição realizada!", description: "Você foi inscrito na turma com sucesso." });
      fetchAlunoData();
    } else {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  const handleCancelarInscricao = async (turmaId: string) => {
    if (!alunoData) return;
    const { error } = await supabase
      .from('inscricoes_turma')
      .delete()
      .eq('aluno_id', alunoData.id)
      .eq('turma_id', turmaId);
    
    if (!error) {
      toast({ title: "Inscrição cancelada", description: "Você foi removido da turma." });
      fetchAlunoData();
    }
  };

  const handleCheckinTurma = async (turmaId: string) => {
    if (!alunoData) return;
    const { error } = await supabase.from('checkins').insert([{
      aluno_id: alunoData.id,
      turma_id: turmaId
    }]);
    if (!error) {
      toast({ title: "Check-in realizado!", description: "Sua presença foi confirmada." });
      fetchAlunoData();
    } else {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  if (loading) {
    console.log('Rendering: loading state');
    return (
      <AppLayout>
        <div className="p-8 text-center text-white">Carregando dados do aluno...</div>
      </AppLayout>
    );
  }
  
  console.log('Rendering: alunoData:', alunoData);
  
  if (!alunoData) {
    console.log('Rendering: no aluno data');
    return (
      <AppLayout>
        <div className="p-8 text-center text-white">
          <h1 className="text-2xl mb-4">Área do Aluno</h1>
          <p>Você precisa estar cadastrado como aluno para acessar esta área.</p>
          <p className="mt-2 text-gray-400">Email: {user?.email}</p>
        </div>
      </AppLayout>
    );
  }

  const frequenciaPercent = Math.round((checkins.length / 30) * 100);

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header do aluno */}
        <div className="stat-card flex flex-col sm:flex-row items-center gap-6">
          <div className="h-20 w-20 rounded-full gold-gradient flex items-center justify-center text-primary-foreground font-display text-3xl font-bold shrink-0">
            {alunoData.nome?.charAt(0)}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-display font-bold">{alunoData.nome}</h1>
            <p className="text-muted-foreground mt-1">
              Sem modalidade
            </p>
            <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
              <Badge variant="outline" className="bg-success/20 text-success border-success/30">
                {alunoData.status === 'ativo' ? 'Ativo' : alunoData.status}
              </Badge>
              <Badge variant="outline" className="border-border text-muted-foreground">
                Desde {new Date(alunoData.created_at).toLocaleDateString('pt-BR')}
              </Badge>
            </div>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-xs text-muted-foreground">Próximo vencimento</p>
            <p className="text-lg font-semibold gold-text">{alunoData.vencimento || "—"}</p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="stat-card text-center">
            <Dumbbell className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Modalidade</p>
            <p className="font-semibold text-sm">{alunoData.modalidade || "—"}</p>
          </div>
          <div className="stat-card text-center">
            <CreditCard className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Plano</p>
            <p className="font-semibold text-sm">{alunoData.plano || "—"}</p>
          </div>
          <div className="stat-card text-center">
            <CalendarCheck className="h-5 w-5 text-success mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Frequência</p>
            <p className="font-semibold text-sm">{checkins.length}/30 dias</p>
          </div>
          <div className="stat-card text-center">
            <Clock className="h-5 w-5 text-warning mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Vencimento</p>
            <p className="font-semibold text-sm">{alunoData.vencimento || "—"}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full grid grid-cols-3 bg-card border border-border">
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
                    <p className="font-medium">{alunoData.modalidade || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Plano</p>
                    <p className="font-medium">{alunoData.plano || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="font-medium">{alunoData.status === 'ativo' ? 'Ativo' : alunoData.status}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Próximo Vencimento</p>
                    <p className="font-medium">{alunoData.vencimento || "—"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Minhas Turmas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {minhasTurmas.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Você não está inscrito em nenhuma turma.</p>
                ) : (
                  minhasTurmas.map((turma: any) => (
                    <div key={turma.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <div>
                        <p className="font-medium">{turma.nome}</p>
                        <p className="text-xs text-muted-foreground capitalize">{turma.dia_semana} · {turma.hora_inicio} - {turma.hora_fim}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleCheckinTurma(turma.id)}>
                        Check-in
                      </Button>
                    </div>
                  ))
                )}
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
                  Você compareceu {checkins.length} dias este mês.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Check-in */}
          <TabsContent value="checkin" className="space-y-4 mt-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Minhas Turmas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {minhasTurmas.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Você não está inscrito em nenhuma turma.</p>
                ) : (
                  minhasTurmas.map((turma: any) => {
                    const jaFeitoCheckin = checkins.some(c => c.turma_id === turma.id && new Date(c.data_checkin).toDateString() === new Date().toDateString());
                    return (
                      <div
                        key={turma.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/30 transition-colors"
                      >
                        <div>
                          <p className="font-medium">{turma.nome}</p>
                          <p className="text-sm text-muted-foreground capitalize">{turma.dia_semana} · {turma.hora_inicio} - {turma.hora_fim}</p>
                          <p className="text-xs text-primary mt-1">{turma.modalidade?.nome}</p>
                        </div>
                        <Button 
                          size="sm" 
                          className={jaFeitoCheckin ? "bg-success/20 text-success border border-success/30" : "gold-gradient text-primary-foreground"}
                          onClick={() => handleCheckinTurma(turma.id)}
                          disabled={jaFeitoCheckin}
                        >
                          {jaFeitoCheckin ? "Check-in Feito" : "Fazer Check-in"}
                        </Button>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Histórico de Presença</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {checkins.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Nenhum check-in realizado ainda.</p>
                ) : (
                  checkins.map((ci) => (
                    <div key={ci.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-success" />
                        <div>
                          <p className="text-sm font-medium">{ci.turmas?.nome}</p>
                          <p className="text-xs text-muted-foreground">{new Date(ci.data_checkin).toLocaleDateString('pt-BR')} · {new Date(ci.data_checkin).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-success/20 text-success border-success/30">
                        Presente
                      </Badge>
                    </div>
                  ))
                )}
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
                <p className="text-muted-foreground text-sm">
                  Em breve: integração com sistema de pagamentos.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AreaAluno;
