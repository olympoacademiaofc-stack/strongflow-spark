import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Edit, History, CalendarCheck, ChevronRight, Trash2, ShieldAlert } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type StatusType = "ativo" | "inativo" | "cobranca";

interface Aluno {
  id: string;
  nome: string;
  cpf: string;
  whatsapp: string;
  status: StatusType;
  modalidades?: { nome: string } | null;
  planos?: { nome: string } | null;
}

const statusConfig: Record<StatusType, { label: string; color: string }> = {
  ativo: { label: "Ativo", color: "bg-success/20 text-success border-success/30" },
  inativo: { label: "Inativo", color: "bg-danger/20 text-danger border-danger/30" },
  cobranca: { label: "Em cobrança", color: "bg-warning/20 text-warning border-warning/30" },
};

const Alunos = () => {
  const { toast } = useToast();
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<StatusType | "todos">("todos");
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingName, setDeletingName] = useState("");
  const [sessionInfo, setSessionInfo] = useState<string>("Verificando...");

  // Edit states
  const [editingAluno, setEditingAluno] = useState<Aluno | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editCpf, setEditCpf] = useState("");
  const [editWhatsapp, setEditWhatsapp] = useState("");
  const [editStatus, setEditStatus] = useState<StatusType>("ativo");

  useEffect(() => {
    fetchAlunos();
    checkSession();
  }, []);

  const checkSession = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setSessionInfo(`${user.email} (${user.user_metadata?.role || 'aluno'})`);
    } else {
      setSessionInfo("Desconectado");
    }
  };

  const fetchAlunos = async () => {
    try {
      const { data, error } = await supabase
        .from('alunos')
        .select(`
          id, nome, cpf, whatsapp, status,
          modalidades (nome),
          planos (nome)
        `);

      if (error) throw error;
      
      // Converte arrays de join para objetos únicos se necessário
      const formattedData = (data as any[]).map(aluno => ({
        ...aluno,
        modalidades: Array.isArray(aluno.modalidades) ? aluno.modalidades[0] : aluno.modalidades,
        planos: Array.isArray(aluno.planos) ? aluno.planos[0] : aluno.planos
      }));

      setAlunos(formattedData);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o cadastro de ${nome}?`)) return;

    try {
      const { error } = await supabase
        .from('alunos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAlunos(alunos.filter(a => a.id !== id));
      toast({ title: "Cadastro excluído", description: `${nome} removido com sucesso.` });
    } catch (err: any) {
      toast({ title: "Erro na exclusão", description: err.message, variant: "destructive" });
    }
  };

  const handleUpdateAluno = async () => {
    if (!editingAluno || !editNome) return;
    try {
      const { error } = await supabase
        .from('alunos')
        .update({
          nome: editNome,
          cpf: editCpf,
          whatsapp: editWhatsapp,
          status: editStatus
        })
        .eq('id', editingAluno.id);

      if (error) throw error;

      setAlunos(alunos.map(a => a.id === editingAluno.id ? { ...a, nome: editNome, cpf: editCpf, whatsapp: editWhatsapp, status: editStatus } : a));
      toast({ title: "Cadastro atualizado", description: `${editNome} foi atualizado com sucesso.` });
      setEditingAluno(null);
    } catch (err: any) {
      toast({ title: "Erro na atualização", description: err.message, variant: "destructive" });
    }
  };

  const startEditingAluno = (aluno: Aluno) => {
    setEditingAluno(aluno);
    setEditNome(aluno.nome);
    setEditCpf(aluno.cpf || "");
    setEditWhatsapp(aluno.whatsapp || "");
    setEditStatus(aluno.status);
  };

  const confirmDelete = (aluno: Aluno) => {
    setDeletingName(aluno.nome);
    setDeleteConfirmId(aluno.id);
  };

  const filtered = alunos.filter((a) => {
    const matchNome = a.nome.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === "todos" || a.status === filtroStatus;
    return matchNome && matchStatus;
  });

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="text-3xl font-display font-bold">Alunos</h1>
            <p className="text-muted-foreground mt-1">Gestão de alunos e matrículas</p>
            <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest bg-card border border-border p-1 px-2 rounded w-fit">
              <ShieldAlert className="h-3 w-3 text-warning" />
              Sessão Admin: <span className="gold-text font-bold ml-1">{sessionInfo}</span>
            </div>
          </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10 bg-card"
            />
          </div>
          <div className="flex gap-2">
            {(["todos", "ativo", "inativo", "cobranca"] as const).map((s) => (
              <Button
                key={s}
                variant={filtroStatus === s ? "default" : "outline"}
                size="sm"
                onClick={() => setFiltroStatus(s)}
                className={filtroStatus === s ? "gold-gradient text-primary-foreground" : ""}
              >
                {s === "todos" ? "Todos" : statusConfig[s].label}
              </Button>
            ))}
          </div>
        </div>

        {/* Student list */}
        <div className="space-y-3">
          {loading ? (
             <p className="text-muted-foreground">Carregando alunos do BD...</p>
          ) : filtered.length === 0 ? (
             <p className="text-muted-foreground">Nenhum aluno encontrado no banco.</p>
          ) : filtered.map((aluno) => (
            <div
              key={aluno.id}
              className="stat-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full gold-gradient flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0">
                  {aluno.nome.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold">{aluno.nome}</p>
                  <p className="text-sm text-muted-foreground">
                    {aluno.modalidades?.nome || "Sem modalidade"} · {aluno.planos?.nome || "Sem plano"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="outline" className={statusConfig[aluno.status]?.color || statusConfig['ativo'].color}>
                  {statusConfig[aluno.status]?.label || "Ativo"}
                </Badge>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    title="Excluir Aluno" 
                    onClick={() => confirmDelete(aluno)} 
                    className="text-destructive/50 hover:text-destructive hover:bg-destructive/10 transition-all focus:ring-2 focus:ring-destructive/50"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                    <Button variant="ghost" size="icon" title="Editar" onClick={() => startEditingAluno(aluno)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  <Button variant="ghost" size="icon" title="Pagamentos">
                    <History className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Frequência">
                    <CalendarCheck className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Detalhes">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
          <AlertDialogContent className="bg-card border-destructive/20 shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" /> Confirmar Exclusão
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground pt-2">
                Tem certeza que deseja excluir o cadastro de <strong className="text-foreground">{deletingName}</strong>? 
                Esta ação é irreversível e removerá todos os dados vinculados ao aluno.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-6">
              <AlertDialogCancel className="bg-transparent hover:bg-muted border-border">Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => deleteConfirmId && handleDelete(deleteConfirmId, deletingName)}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold"
              >
                Sim, Excluir Aluno
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit Aluno Dialog */}
        <Dialog open={!!editingAluno} onOpenChange={(open) => !open && setEditingAluno(null)}>
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display">Editar Cadastro de Aluno</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nome">Nome Completo</Label>
                <Input id="edit-nome" value={editNome} onChange={e => setEditNome(e.target.value)} className="bg-background" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-cpf">CPF</Label>
                  <Input id="edit-cpf" value={editCpf} onChange={e => setEditCpf(e.target.value)} className="bg-background" placeholder="000.000.000-00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-whatsapp">WhatsApp</Label>
                  <Input id="edit-whatsapp" value={editWhatsapp} onChange={e => setEditWhatsapp(e.target.value)} className="bg-background" placeholder="(00) 0 0000-0000" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status do Aluno</Label>
                <select 
                  id="edit-status" 
                  value={editStatus} 
                  onChange={e => setEditStatus(e.target.value as StatusType)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                  <option value="cobranca">Em cobrança</option>
                </select>
              </div>
              <Button onClick={handleUpdateAluno} className="w-full gold-gradient text-primary-foreground h-11 font-bold mt-2">
                Salvar Alterações
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Alunos;
