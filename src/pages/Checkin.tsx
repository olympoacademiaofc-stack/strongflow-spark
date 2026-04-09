import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, Clock, CheckCircle2 } from "lucide-react";
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

        try {
          const { data: checkinsData } = await supabase
            .from('checkins')
            .select('turma_id')
            .eq('aluno_id', aluno.id);
          
          setCheckinsFeitos(checkinsData?.map(c => c.turma_id) || []);
        } catch (e) {
          console.log('Tabela checkins não existe');
        }
      }

      const { data: turmasData } = await supabase
        .from('turmas')
        .select('*')
        .limit(20);
      
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

  if (loading) return <AppLayout><div className="p-8 text-center">Carregando...</div></AppLayout>;

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold">Check-in</h1>
          <p className="text-muted-foreground mt-1">Turmas disponíveis hoje ({new Date().toLocaleDateString('pt-BR', { weekday: 'long' })})</p>
        </div>

        {turmas.length === 0 ? (
          <div className="stat-card text-center py-12">
            <CalendarCheck className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhuma turma agendada para hoje.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {turmas.map((turma) => {
              const isChecked = checkinsFeitos.includes(turma.id);

              return (
                <div key={turma.id} className="stat-card space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-semibold text-lg">{turma.nome || "Turma sem nome"}</h3>
                    {isChecked ? (
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
                      {turma.horario || "Horário não definido"}
                    </div>
                  </div>

                  <Button
                    onClick={() => handleCheckin(turma.id)}
                    disabled={isChecked}
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
