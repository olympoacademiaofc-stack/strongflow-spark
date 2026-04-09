import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, Clock, Users, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const Checkin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [turmas, setTurmas] = useState<any[]>([]);
  const [alunoId, setAlunoId] = useState<string | null>(null);
  const [checkinsFeitos, setCheckinsFeitos] = useState<string[]>([]);

  useEffect(() => {
    if (user?.email) {
      fetchData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchData = async () => {
    try {
      const { data: aluno } = await supabase
        .from('alunos')
        .select('id')
        .eq('email', user?.email)
        .single();
      
      if (aluno) {
        setAlunoId(aluno.id);

        const { data: checkinsData } = await supabase
          .from('checkins')
          .select('turma_id')
          .eq('aluno_id', aluno.id)
          .eq('data_checkin', new Date().toISOString().split('T')[0]);
        
        setCheckinsFeitos(checkinsData?.map(c => c.turma_id) || []);
      }

      const { data: turmasData } = await supabase
        .from('turmas')
        .select('*, modalidade(nome), colaboradores(nome)')
        .eq('status', 'ativa')
        .order('hora_inicio', { ascending: true });
      
      setTurmas(turmasData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckin = async (turmaId: string) => {
    if (!alunoId || checkinsFeitos.includes(turmaId)) return;
    
    const { error } = await supabase.from('checkins').insert([{
      aluno_id: alunoId,
      turma_id: turmaId
    }]);
    
    if (!error) {
      setCheckinsFeitos([...checkinsFeitos, turmaId]);
      toast({
        title: "Check-in realizado!",
        description: "Presença confirmada com sucesso.",
      });
    } else {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getDiaSemana = () => {
    const dias = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    return dias[new Date().getDay()];
  };

  const turmasHoje = turmas.filter(t => t.dia_semana === getDiaSemana());

  if (loading) return <AppLayout><div className="p-8 text-center">Carregando...</div></AppLayout>;

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold">Check-in</h1>
          <p className="text-muted-foreground mt-1">Turmas disponíveis hoje ({new Date().toLocaleDateString('pt-BR', { weekday: 'long' })})</p>
        </div>

        {turmasHoje.length === 0 ? (
          <div className="stat-card text-center py-12">
            <CalendarCheck className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhuma turma agendada para hoje.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {turmasHoje.map((turma) => {
              const isLotada = turma.vagas_disponiveis <= 0;
              const isChecked = checkinsFeitos.includes(turma.id);
              const percentOcupado = ((turma.vagas_total - turma.vagas_disponiveis) / turma.vagas_total) * 100;

              return (
                <div key={turma.id} className="stat-card space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-semibold text-lg">{turma.nome}</h3>
                    {isLotada ? (
                      <Badge variant="outline" className="bg-danger/20 text-danger border-danger/30">
                        Lotada
                      </Badge>
                    ) : isChecked ? (
                      <Badge variant="outline" className="bg-success/20 text-success border-success/30">
                        Confirmado
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                        Disponível
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {turma.hora_inicio} - {turma.hora_fim}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {turma.vagas_total - turma.vagas_disponiveis}/{turma.vagas_total} vagas
                    </div>
                    <p>{turma.colaboradores?.nome}</p>
                    <p className="text-primary">{turma.modalidade?.nome}</p>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentOcupado}%`,
                        background:
                          percentOcupado >= 100
                            ? "hsl(0, 72%, 51%)"
                            : percentOcupado >= 80
                            ? "hsl(38, 92%, 50%)"
                            : "hsl(43, 75%, 49%)",
                      }}
                    />
                  </div>

                  <Button
                    onClick={() => handleCheckin(turma.id)}
                    disabled={isLotada || isChecked}
                    className={`w-full ${
                      isChecked
                        ? "bg-success/20 text-success border border-success/30"
                        : "gold-gradient text-primary-foreground"
                    }`}
                    variant={isChecked ? "outline" : "default"}
                  >
                    {isChecked ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Check-in Feito
                      </>
                    ) : (
                      <>
                        <CalendarCheck className="h-4 w-4 mr-2" />
                        Fazer Check-in
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Checkin;
