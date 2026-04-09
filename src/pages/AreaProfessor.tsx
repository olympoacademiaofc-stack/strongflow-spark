import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  ClipboardCheck, 
  Star,
  Plus,
  Search,
  ChevronRight,
  Clock,
  X,
  Edit
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const AreaProfessor = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [turmas, setTurmas] = useState<any[]>([]);
  const [professorId, setProfessorId] = useState<string | null>(null);
  const [alunos, setAlunos] = useState<any[]>([]);
  const [selectedTurma, setSelectedTurma] = useState<any | null>(null);
  const [modalidades, setModalidades] = useState<any[]>([]);
  const { toast } = useToast();
  
  // Turma Form
  const [nomeTurma, setNomeTurma] = useState("");
  const [horarioTurma, setHorarioTurma] = useState("");
  const [showAddTurma, setShowAddTurma] = useState(false);
  const [modalidadeId, setModalidadeId] = useState("");
  const [diaSemana, setDiaSemana] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFim, setHoraFim] = useState("");
  const [vagasTotal, setVagasTotal] = useState(30);

  const [alunoSelecionado, setAlunoSelecionado] = useState("");
  const [conteudoAviso, setConteudoAviso] = useState("");
  const [conteudoFeedback, setConteudoFeedback] = useState("");
  const [loadingAção, setLoadingAção] = useState(false);
  const [presencas, setPresencas] = useState<any[]>([]);
  const [agendas, setAgendas] = useState<any[]>([]);

  // Agenda form
  const [showAddAgenda, setShowAddAgenda] = useState(false);
  const [diaSemanaAgenda, setDiaSemanaAgenda] = useState("");
  const [horaInicioAgenda, setHoraInicioAgenda] = useState("");
  const [horaFimAgenda, setHoraFimAgenda] = useState("");
  const [descricaoAgenda, setDescricaoAgenda] = useState("");
  const [turmaAgenda, setTurmaAgenda] = useState("");

  // Edit states for Turmas
  const [editingTurma, setEditingTurma] = useState<any | null>(null);
  const [editNomeTurma, setEditNomeTurma] = useState("");
  const [editHorarioTurma, setEditHorarioTurma] = useState("");
  const [editHoraInicio, setEditHoraInicio] = useState("");
  const [editHoraFim, setEditHoraFim] = useState("");
  const [editVagas, setEditVagas] = useState(30);
  const [editDiaSemana, setEditDiaSemana] = useState("");
  const [editModalidadeId, setEditModalidadeId] = useState("");

  useEffect(() => {
    if (user?.email) {
      fetchProfessorData();
      fetchAllAlunos();
      fetchModalidades();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchModalidades = async () => {
    const { data } = await supabase.from('modalidades').select('id, nome');
    setModalidades(data || []);
  };

  const fetchPresencasTurma = async (turmaId: string) => {
    const idsAlunos = turmas.find(t => t.id === turmaId)?.turma_alunos?.map((ta: any) => ta.aluno_id) || [];
    if (idsAlunos.length === 0) return;

    const { data } = await supabase
      .from('presencas')
      .select('*, alunos(nome)')
      .in('aluno_id', idsAlunos)
      .order('data_hora', { ascending: false });
    
    setPresencas(data || []);
  };

  const fetchAllAlunos = async () => {
    const { data } = await supabase.from('alunos').select('id, nome, status').eq('status', 'ativo');
    setAlunos(data || []);
  };

  const fetchProfessorData = async () => {
    try {
      const { data: prof } = await supabase
        .from('colaboradores')
        .select('id')
        .eq('email', user?.email)
        .single();
      
      if (!prof) return;
      setProfessorId(prof.id);

      const { data: turmasData, error: turmasError } = await supabase
        .from('turmas')
        .select('*')
        .eq('professor_id', prof.id);
      
      if (turmasError) console.error('Erro turmas:', turmasError);
      setTurmas(turmasData || []);

      const { data: agendasData } = await supabase
        .from('agendas')
        .select('*, turmas(nome)')
        .eq('professor_id', prof.id)
        .order('dia_semana', { ascending: true });

      setAgendas(agendasData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTurma = async () => {
    if (!nomeTurma || !professorId) return;
    const { error } = await supabase.from('turmas').insert([{
      professor_id: professorId,
      nome: nomeTurma,
      horario: `${horaInicio} - ${horaFim}`
    }]).select();
    if (!error) {
      setNomeTurma(""); setHoraInicio(""); setHoraFim(""); setDiaSemana(""); setModalidadeId(""); setVagasTotal(30);
      setShowAddTurma(false);
      fetchProfessorData();
      toast({ title: "Turma criada!", description: "A turma foi cadastrada com sucesso." });
    } else {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  const handleCreateAgenda = async () => {
    if (!diaSemanaAgenda || !horaInicioAgenda || !horaFimAgenda || !professorId) return;
    const { error } = await supabase.from('agendas').insert([{
      professor_id: professorId,
      dia_semana: diaSemanaAgenda,
      hora_inicio: horaInicioAgenda,
      hora_fim: horaFimAgenda,
      descricao: descricaoAgenda,
      turma_id: turmaAgenda || null
    }]);
    if (!error) {
      toast({ title: "Agenda criada!", description: "Seu horário foi adicionado à agenda." });
      setDiaSemanaAgenda(""); setHoraInicioAgenda(""); setHoraFimAgenda(""); setDescricaoAgenda(""); setTurmaAgenda("");
      setShowAddAgenda(false);
      fetchProfessorData();
    } else {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  const handleUpdateTurma = async () => {
    if (!editingTurma || !editNomeTurma) return;
    try {
      const { error } = await supabase
        .from('turmas')
        .update({
          nome: editNomeTurma,
          hora_inicio: editHoraInicio,
          hora_fim: editHoraFim,
          vagas_total: editVagas,
          dia_semana: editDiaSemana,
          modalidade_id: editModalidadeId || null
        })
        .eq('id', editingTurma.id);

      if (error) throw error;

      setTurmas(turmas.map(t => t.id === editingTurma.id ? { ...t, nome: editNomeTurma, hora_inicio: editHoraInicio, hora_fim: editHoraFim, vagas_total: editVagas, dia_semana: editDiaSemana, modalidade_id: editModalidadeId } : t));
      toast({ title: "Turma atualizada", description: "As alterações foram salvas." });
      setEditingTurma(null);
    } catch (err: any) {
      toast({ title: "Erro na atualização", description: err.message, variant: "destructive" });
    }
  };

  const startEditingTurma = (t: any) => {
    setEditingTurma(t);
    setEditNomeTurma(t.nome);
    setEditHorarioTurma(t.horario || "");
    setEditHoraInicio(t.hora_inicio || "");
    setEditHoraFim(t.hora_fim || "");
    setEditVagas(t.vagas_total || 30);
    setEditDiaSemana(t.dia_semana || "");
    setEditModalidadeId(t.modalidade_id || "");
  };

  const handleAddAlunoToTurma = async (alunoId: string, turmaId: string) => {
    await supabase.from('turma_alunos').insert([{ turma_id: turmaId, aluno_id: alunoId }]);
    fetchProfessorData();
  };

  const handleRemoveAlunoFromTurma = async (alunoId: string, turmaId: string) => {
    await supabase.from('turma_alunos').delete().eq('turma_id', turmaId).eq('aluno_id', alunoId);
    fetchProfessorData();
  };

  const handleSendAviso = async () => {
    if (!conteudoAviso || !professorId) return;
    setLoadingAção(true);
    const { error } = await supabase.from('avisos').insert([{
      professor_id: professorId,
      aluno_id: alunoSelecionado || null,
      conteudo: conteudoAviso
    }]);
    if (!error) {
       toast({ title: "Aviso enviado!", description: "Sua mensagem foi entregue." });
       setConteudoAviso("");
    }
    setLoadingAção(false);
  };

  const handleSendFeedback = async () => {
    if (!conteudoFeedback || !alunoSelecionado || !professorId) return;
    setLoadingAção(true);
    const { error } = await supabase.from('feedback_treino').insert([{
      professor_id: professorId,
      aluno_id: alunoSelecionado,
      conteudo: conteudoFeedback
    }]);
    if (!error) {
       toast({ title: "Feedback enviado!", description: "O aluno receberá sua avaliação." });
       setConteudoFeedback("");
    }
    setLoadingAção(false);
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-display font-bold">Portal do Professor</h1>
            <p className="text-muted-foreground mt-1">Bem-vindo, {user?.name}</p>
          </div>
          <Badge variant="outline" className="gold-gradient text-primary-foreground border-none px-4 py-1">
            Professor Ativo
          </Badge>
        </div>

        <Tabs defaultValue="dashboard" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full bg-card mb-8">
            <TabsTrigger value="dashboard" className="gap-2">
              <Users className="h-4 w-4" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="turmas" className="gap-2">
              <ClipboardCheck className="h-4 w-4" /> Turmas
            </TabsTrigger>
            <TabsTrigger value="agenda" className="gap-2">
              <Calendar className="h-4 w-4" /> Agenda
            </TabsTrigger>
            <TabsTrigger value="avisos" className="gap-2">
              <MessageSquare className="h-4 w-4" /> Avisos
            </TabsTrigger>
            <TabsTrigger value="feedback" className="gap-2">
              <Star className="h-4 w-4" /> Feedback
            </TabsTrigger>
          </TabsList>

          {/* DYNAMIC CONTENT BASED ON TABS */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="stat-card gold-gradient text-primary-foreground">
                <p className="text-sm opacity-80">Minhas Turmas</p>
                <h3 className="text-3xl font-bold">{turmas.length}</h3>
              </div>
              <div className="stat-card bg-secondary/20">
                <p className="text-sm text-muted-foreground">Alunos Ativos</p>
                <h3 className="text-3xl font-bold">
                  {turmas.reduce((acc, t) => acc + (t.turma_alunos?.length || 0), 0)}
                </h3>
              </div>
              <div className="stat-card bg-secondary/20">
                <p className="text-sm text-muted-foreground">Aulas Hoje</p>
                <h3 className="text-3xl font-bold">2</h3>
              </div>
            </div>

            <h2 className="text-xl font-display font-semibold mt-8 mb-4">Aulas do Dia</h2>
            <div className="space-y-4">
              {turmas.length === 0 ? (
                <p className="text-muted-foreground italic">Nenhuma turma cadastrada.</p>
              ) : (
                turmas.map(turma => (
                  <div key={turma.id} className="stat-card flex items-center justify-between group cursor-pointer hover:border-primary/50 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-secondary/20 flex items-center justify-center text-primary">
                        <Clock className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-bold">{turma.nome}</h4>
                        <p className="text-sm text-muted-foreground">{turma.horario}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-3 overflow-hidden">
                        {turma.turma_alunos?.slice(0, 3).map((ta: any, i: number) => (
                          <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-background gold-gradient flex items-center justify-center text-[10px] font-bold">
                            {ta.alunos?.nome?.charAt(0)}
                          </div>
                        ))}
                        {turma.turma_alunos?.length > 3 && (
                          <div className="inline-block h-8 w-8 rounded-full ring-2 ring-background bg-secondary flex items-center justify-center text-[10px] font-bold">
                            +{turma.turma_alunos.length - 3}
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" size="icon" onClick={(e) => {
                        e.stopPropagation();
                        startEditingTurma(turma);
                      }}>
                        <Edit className="h-4 w-4 text-muted-foreground mr-1" />
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="turmas" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-display font-semibold">Gestão de Turmas</h2>
              <Button onClick={() => setShowAddTurma(!showAddTurma)} className="gold-gradient text-primary-foreground font-semibold">
                 {showAddTurma ? "Fechar" : "Nova Turma"}
              </Button>
            </div>

            {showAddTurma && (
              <div className="stat-card border-primary/50 animate-slide-up space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nomeT">Nome da Turma</Label>
                    <Input id="nomeT" value={nomeTurma} onChange={e => setNomeTurma(e.target.value)} placeholder="Ex: Musculação Avançada A" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="modalidadeT">Modalidade</Label>
                    <select 
                      id="modalidadeT"
                      value={modalidadeId}
                      onChange={e => setModalidadeId(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Selecionar...</option>
                      {modalidades.map(m => (
                        <option key={m.id} value={m.id}>{m.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="diaSemanaT">Dia da Semana</Label>
                    <select 
                      id="diaSemanaT"
                      value={diaSemana}
                      onChange={e => setDiaSemana(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Selecionar...</option>
                      <option value="segunda">Segunda-feira</option>
                      <option value="terca">Terça-feira</option>
                      <option value="quarta">Quarta-feira</option>
                      <option value="quinta">Quinta-feira</option>
                      <option value="sexta">Sexta-feira</option>
                      <option value="sabado">Sábado</option>
                      <option value="domingo">Domingo</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vagasT">Vagas Totais</Label>
                    <Input id="vagasT" type="number" value={vagasTotal} onChange={e => setVagasTotal(parseInt(e.target.value) || 30)} placeholder="30" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="horaInicioT">Hora de Início</Label>
                    <Input id="horaInicioT" type="time" value={horaInicio} onChange={e => setHoraInicio(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="horaFimT">Hora de Término</Label>
                    <Input id="horaFimT" type="time" value={horaFim} onChange={e => setHoraFim(e.target.value)} />
                  </div>
                </div>
                <Button onClick={handleCreateTurma} className="w-full gold-gradient">Salvar Turma</Button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {turmas.map(turma => (
                <div key={turma.id} className="stat-card space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{turma.nome}</h3>
                      <p className="text-sm text-muted-foreground">{turma.modalidade?.nome}</p>
                      <p className="text-xs text-muted-foreground capitalize">{turma.dia_semana} · {turma.hora_inicio} - {turma.hora_fim}</p>
                      <p className="text-xs text-primary font-semibold mt-1">Vagas: {turma.vagas_disponiveis}/{turma.vagas_total}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => fetchPresencasTurma(turma.id)}>
                      Ver Presenças
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs uppercase text-muted-foreground font-bold">Adicionar Aluno à Turma</Label>
                    <select 
                      onChange={(e) => handleAddAlunoToTurma(e.target.value, turma.id)}
                      value=""
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="" disabled>Selecionar aluno...</option>
                      {alunos.filter(a => !turma.turma_alunos?.some((ta: any) => ta.aluno_id === a.id)).map(a => (
                        <option key={a.id} value={a.id}>{a.nome}</option>
                      ))}
                    </select>
                  </div>

                  {presencas.length > 0 && selectedTurma === turma.id && (
                     <div className="bg-secondary/10 p-3 rounded-lg text-xs space-y-2 animate-fade-in">
                        <div className="flex justify-between font-bold border-b pb-1">
                           <span>Presenças Recentes:</span>
                           <button onClick={() => setPresencas([])}><X className="h-3 w-3" /></button>
                        </div>
                        {presencas.slice(0, 5).map((p, i) => (
                           <div key={i} className="flex justify-between">
                              <span>{p.alunos?.nome}</span>
                              <span className="text-muted-foreground">{new Date(p.data_hora).toLocaleDateString()}</span>
                           </div>
                        ))}
                     </div>
                  )}

                  <div className="pt-4 border-t border-border">
                    <p className="text-xs font-semibold mb-2">Lista de Alunos:</p>
                    <div className="flex flex-wrap gap-2">
                      {turma.turma_alunos?.map((ta: any) => (
                        <Badge key={ta.aluno_id} variant="secondary" className="gap-1 pr-1">
                          {ta.alunos?.nome}
                          <button onClick={() => handleRemoveAlunoFromTurma(ta.aluno_id, turma.id)} className="text-muted-foreground hover:text-destructive">
                             <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="agenda" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-display font-semibold">Minha Agenda</h2>
              <Button onClick={() => setShowAddAgenda(!showAddAgenda)} className="gold-gradient text-primary-foreground font-semibold">
                {showAddAgenda ? "Fechar" : "Criar Agenda"}
              </Button>
            </div>

            {showAddAgenda && (
              <div className="stat-card border-primary/50 animate-slide-up space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="diaSemanaAgenda">Dia da Semana</Label>
                    <select 
                      id="diaSemanaAgenda"
                      value={diaSemanaAgenda}
                      onChange={e => setDiaSemanaAgenda(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Selecione...</option>
                      <option value="segunda">Segunda-feira</option>
                      <option value="terca">Terça-feira</option>
                      <option value="quarta">Quarta-feira</option>
                      <option value="quinta">Quinta-feira</option>
                      <option value="sexta">Sexta-feira</option>
                      <option value="sabado">Sábado</option>
                      <option value="domingo">Domingo</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="turmaAgenda">Turma (opcional)</Label>
                    <select 
                      id="turmaAgenda"
                      value={turmaAgenda}
                      onChange={e => setTurmaAgenda(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Sem turma específica</option>
                      {turmas.map(t => (
                        <option key={t.id} value={t.id}>{t.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="horaInicioAgenda">Hora de Início</Label>
                    <Input id="horaInicioAgenda" type="time" value={horaInicioAgenda} onChange={e => setHoraInicioAgenda(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="horaFimAgenda">Hora de Término</Label>
                    <Input id="horaFimAgenda" type="time" value={horaFimAgenda} onChange={e => setHoraFimAgenda(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricaoAgenda">Descrição</Label>
                  <Input id="descricaoAgenda" value={descricaoAgenda} onChange={e => setDescricaoAgenda(e.target.value)} placeholder="Ex: Treino de Musculação" />
                </div>
                <Button onClick={handleCreateAgenda} className="w-full gold-gradient">Salvar Agenda</Button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agendas.length === 0 ? (
                <div className="stat-card col-span-full text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-muted-foreground">Nenhum horário cadastrado na agenda.</p>
                  <p className="text-sm text-muted-foreground/70">Clique em "Criar Agenda" para adicionar.</p>
                </div>
              ) : (
                agendas.map(agenda => (
                  <div key={agenda.id} className="stat-card border-l-4 border-l-primary">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-lg capitalize">{agenda.dia_semana}</h4>
                        <p className="text-sm text-muted-foreground">{agenda.turmas?.nome || "Horário geral"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="font-semibold">{agenda.hora_inicio} - {agenda.hora_fim}</span>
                    </div>
                    {agenda.descricao && (
                      <p className="text-sm text-muted-foreground mt-2">{agenda.descricao}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="avisos">
             <div className="stat-card">
                <h3 className="font-bold mb-4">Enviar Novo Aviso</h3>
                <div className="space-y-4">
                  <select 
                    value={alunoSelecionado} 
                    onChange={e => setAlunoSelecionado(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Aviso para todos os meus alunos</option>
                    {turmas.flatMap(t => t.turma_alunos || []).map((ta: any) => (
                      <option key={ta.aluno_id} value={ta.aluno_id}>{ta.alunos?.nome}</option>
                    ))}
                  </select>
                  <textarea 
                    value={conteudoAviso}
                    onChange={e => setConteudoAviso(e.target.value)}
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Escreva sua mensagem aqui..."
                  />
                  <Button 
                    onClick={handleSendAviso} 
                    disabled={loadingAção}
                    className="w-full gold-gradient"
                  >
                    {loadingAção ? "Enviando..." : "Enviar Mensagem"}
                  </Button>
                </div>
             </div>
          </TabsContent>

          <TabsContent value="feedback">
             <div className="stat-card">
                <h3 className="font-bold mb-4">Feedback de Treino</h3>
                <div className="space-y-4">
                  <Label>Selecione o Aluno</Label>
                  <select 
                    value={alunoSelecionado} 
                    onChange={e => setAlunoSelecionado(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Escolher aluno da turma...</option>
                    {turmas.flatMap(t => t.turma_alunos || []).map((ta: any) => (
                      <option key={ta.aluno_id} value={ta.aluno_id}>{ta.alunos?.nome}</option>
                    ))}
                  </select>
                  <textarea 
                    value={conteudoFeedback}
                    onChange={e => setConteudoFeedback(e.target.value)}
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Como foi o treino hoje? (Carga, técnica, intensidade)"
                  />
                  <Button 
                    onClick={handleSendFeedback} 
                    disabled={loadingAção}
                    className="w-full gold-gradient"
                  >
                    {loadingAção ? "Salvando..." : "Registrar Feedback"}
                  </Button>
                </div>
             </div>
          </TabsContent>

        </Tabs>

        {/* Edit Turma Dialog */}
        <Dialog open={!!editingTurma} onOpenChange={(open) => !open && setEditingTurma(null)}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-display">Editar Detalhes da Turma</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-nome-turma">Nome da Turma</Label>
                  <Input id="edit-nome-turma" value={editNomeTurma} onChange={e => setEditNomeTurma(e.target.value)} className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-modalidade">Modalidade</Label>
                  <select 
                    id="edit-modalidade"
                    value={editModalidadeId}
                    onChange={e => setEditModalidadeId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Selecionar...</option>
                    {modalidades.map(m => (
                      <option key={m.id} value={m.id}>{m.nome}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-dia-semana">Dia da Semana</Label>
                  <select 
                    id="edit-dia-semana"
                    value={editDiaSemana}
                    onChange={e => setEditDiaSemana(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Selecionar...</option>
                    <option value="segunda">Segunda-feira</option>
                    <option value="terca">Terça-feira</option>
                    <option value="quarta">Quarta-feira</option>
                    <option value="quinta">Quinta-feira</option>
                    <option value="sexta">Sexta-feira</option>
                    <option value="sabado">Sábado</option>
                    <option value="domingo">Domingo</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-vagas">Vagas Totais</Label>
                  <Input id="edit-vagas" type="number" value={editVagas} onChange={e => setEditVagas(parseInt(e.target.value) || 30)} className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-hora-inicio">Hora de Início</Label>
                  <Input id="edit-hora-inicio" type="time" value={editHoraInicio} onChange={e => setEditHoraInicio(e.target.value)} className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-hora-fim">Hora de Término</Label>
                  <Input id="edit-hora-fim" type="time" value={editHoraFim} onChange={e => setEditHoraFim(e.target.value)} className="bg-background" />
                </div>
              </div>
              <Button onClick={handleUpdateTurma} className="w-full gold-gradient text-primary-foreground h-11 font-bold mt-2">
                Salvar Alterações
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default AreaProfessor;
