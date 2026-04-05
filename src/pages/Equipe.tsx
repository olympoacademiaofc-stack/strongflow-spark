import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Search, Plus, UserCircle, Briefcase, Mail, ShieldCheck, Trash2, ShieldAlert, Edit } from "lucide-react";
import { supabase } from "@/lib/supabase";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Colaborador {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  cargo: string;
  especialidade: string;
  status: string;
}

const Equipe = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [busca, setBusca] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingName, setDeletingName] = useState("");
  const [sessionInfo, setSessionInfo] = useState<string>("Verificando...");

  // Form states
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [cargo, setCargo] = useState("Professor");
  const [especialidade, setEspecialidade] = useState("");

  // Edit states
  const [editingColaborador, setEditingColaborador] = useState<Colaborador | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editCpf, setEditCpf] = useState("");
  const [editCargo, setEditCargo] = useState("");
  const [editEspecialidade, setEditEspecialidade] = useState("");
  const [editStatus, setEditStatus] = useState("");

  useEffect(() => {
    fetchEquipe();
    checkSession();
  }, []);

  const checkSession = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setSessionInfo(`${user.email} (${user.user_metadata?.role || 'autenticado'})`);
    } else {
      setSessionInfo("Desconectado");
    }
  };

  const fetchEquipe = async () => {
    try {
      const { data, error } = await supabase
        .from('colaboradores')
        .select('*');
      if (error) throw error;
      setColaboradores(data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email || !cpf || !senha) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }

    try {
      // 1. Criar o login no Supabase Auth (Oficial & Seguro)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          data: {
            role: cargo.toLowerCase(),
            nome
          },
          emailRedirectTo: window.location.origin
        }
      });

      if (signUpError) throw signUpError;
      if (!signUpData.user) throw new Error("Usuário não retornado pelo Auth");

      // 2. Salvar o perfil na tabela public.colaboradores vinculado ao user_id
      const { error: insertError } = await supabase.from('colaboradores').insert([{
        user_id: signUpData.user.id,
        nome,
        email,
        cpf,
        cargo,
        especialidade,
        status: 'ativo'
      }]);

      if (insertError) throw insertError;

      toast({ title: "Colaborador cadastrado!", description: `Acesso criado para ${nome}` });
      setShowForm(false);
      setNome(""); setEmail(""); setCpf(""); setSenha(""); setEspecialidade("");
      fetchEquipe();
    } catch (err: any) {
      console.error("[Equipe] Erro:", err);
      let errorMsg = err.message;
      if (err.message?.includes("already exists") || err.code === "23505") {
        errorMsg = "Este e-mail já está sendo utilizado por outro usuário.";
      }
      toast({ title: "Erro no cadastro", description: errorMsg, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    console.log(`[Equipe] Iniciando exclusão de: ${nome} (${id})`);
    try {
      const { data, error } = await supabase
        .from('colaboradores')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Erro Supabase:", error);
        throw error;
      }

      console.log("Exclusão bem-sucedida no banco.");
      setColaboradores(prev => prev.filter(c => c.id !== id));
      toast({ title: "Colaborador excluído", description: `${nome} foi removido com sucesso.` });
    } catch (err: any) {
      console.error("Erro completo na exclusão:", err);
      toast({ 
        title: "Erro na exclusão", 
        description: err.message || "Erro desconhecido ao deletar.", 
        variant: "destructive" 
      });
    }
  };

  const confirmDelete = (c: Colaborador) => {
    setDeletingName(c.nome);
    setDeleteConfirmId(c.id);
  };

  const handleUpdateEquipe = async () => {
    if (!editingColaborador || !editNome) return;
    try {
      const { error } = await supabase
        .from('colaboradores')
        .update({
          nome: editNome,
          email: editEmail,
          cpf: editCpf,
          cargo: editCargo,
          especialidade: editEspecialidade,
          status: editStatus
        })
        .eq('id', editingColaborador.id);

      if (error) throw error;

      setColaboradores(colaboradores.map(c => c.id === editingColaborador.id ? { ...c, nome: editNome, email: editEmail, cpf: editCpf, cargo: editCargo, especialidade: editEspecialidade, status: editStatus } : c));
      toast({ title: "Cadastro atualizado", description: `${editNome} foi atualizado com sucesso.` });
      setEditingColaborador(null);
    } catch (err: any) {
      toast({ title: "Erro na atualização", description: err.message, variant: "destructive" });
    }
  };

  const startEditingEquipe = (c: Colaborador) => {
    setEditingColaborador(c);
    setEditNome(c.nome);
    setEditEmail(c.email);
    setEditCpf(c.cpf);
    setEditCargo(c.cargo);
    setEditEspecialidade(c.especialidade || "");
    setEditStatus(c.status);
  };

  const filtered = colaboradores.filter(c => 
    c.nome.toLowerCase().includes(busca.toLowerCase()) || 
    c.cargo.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Equipe</h1>
            <p className="text-muted-foreground mt-1">Gerenciamento de professores e colaboradores</p>
            <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest bg-card border border-border p-1 px-2 rounded w-fit">
              <ShieldAlert className="h-3 w-3 text-warning" />
              Sessão Admin: <span className="gold-text font-bold ml-1">{sessionInfo}</span>
            </div>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)} 
            className="gold-gradient text-primary-foreground font-semibold"
          >
            {showForm ? "Cancelar" : <><Plus className="mr-2 h-4 w-4" /> Novo Colaborador</>}
          </Button>
        </div>

        {showForm && (
          <div className="stat-card border-primary/50 animate-slide-up">
            <h2 className="text-xl font-display font-semibold gold-text mb-6">Cadastrar Novo Professor/Colaborador</h2>
            <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input id="nome" value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Carlos Professor" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail de Acesso *</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="professor@olympo.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF (somente números) *</Label>
                <Input id="cpf" value={cpf} onChange={e => setCpf(e.target.value)} placeholder="000.000.000-00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senha">Senha Temporária (mín. 6 dígitos) *</Label>
                <Input id="senha" type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="******" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo *</Label>
                <select 
                  id="cargo" 
                  value={cargo} 
                  onChange={e => setCargo(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="Professor">Professor</option>
                  <option value="Personal Trainer">Personal Trainer</option>
                  <option value="Recepcionista">Recepcionista</option>
                  <option value="Gestor">Gestor</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="especialidade">Especialidade / Recurso</Label>
                <Input id="especialidade" value={especialidade} onChange={e => setEspecialidade(e.target.value)} placeholder="Ex: Musculação, Yoga, Pilates" />
                <p className="text-[10px] text-muted-foreground italic">
                  O professor servirá este e-mail e senha acima para acessar a Área do Professor.
                </p>
              </div>
              <div className="md:col-span-2 pt-4">
                <Button type="submit" className="w-full gold-gradient text-primary-foreground h-12 text-lg font-bold">
                  Finalizar Cadastro e Criar Acesso
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou cargo..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10 bg-card"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <p className="text-muted-foreground col-span-full">Carregando equipe...</p>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground col-span-full text-center py-12">Nenhum colaborador encontrado.</p>
          ) : filtered.map((c) => (
            <div key={c.id} className="stat-card group hover:border-primary/40 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-full gold-gradient flex items-center justify-center text-primary-foreground font-bold text-xl">
                  {c.nome.charAt(0)}
                </div>
                <Badge variant={c.status === 'ativo' ? 'outline' : 'destructive'} className={c.status === 'ativo' ? 'bg-success/20 text-success border-success/30' : ''}>
                  {c.status}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h3 className="font-bold text-lg group-hover:gold-text transition-colors">{c.nome}</h3>
                  <div className="flex items-center text-sm text-muted-foreground gap-2">
                    <Briefcase className="h-3 w-3" />
                    {c.cargo} • {c.especialidade || 'Geral'}
                  </div>
                </div>

                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    {c.email}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Acesso Ativo (Login)
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => confirmDelete(c)}
                  className="text-destructive/50 hover:text-destructive hover:bg-destructive/10 transition-all focus:ring-2 focus:ring-destructive/50"
                  title="Excluir Colaborador"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => startEditingEquipe(c)}
                  className="text-primary/70 hover:text-primary hover:bg-primary/10 transition-all"
                  title="Editar Colaborador"
                >
                  <Edit className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  Gerenciar Agenda
                </Button>
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
                Esta ação é irreversível e removerá todos os dados vinculados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-6">
              <AlertDialogCancel className="bg-transparent hover:bg-muted border-border">Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => deleteConfirmId && handleDelete(deleteConfirmId, deletingName)}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold"
              >
                Sim, Excluir Registro
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit Colaborador Dialog */}
        <Dialog open={!!editingColaborador} onOpenChange={(open) => !open && setEditingColaborador(null)}>
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display">Editar Colaborador</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nome">Nome Completo</Label>
                <Input id="edit-nome" value={editNome} onChange={e => setEditNome(e.target.value)} className="bg-background" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-email">E-mail</Label>
                  <Input id="edit-email" type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-cpf">CPF</Label>
                  <Input id="edit-cpf" value={editCpf} onChange={e => setEditCpf(e.target.value)} className="bg-background" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-cargo">Cargo</Label>
                  <select 
                    id="edit-cargo" 
                    value={editCargo} 
                    onChange={e => setEditCargo(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="Professor">Professor</option>
                    <option value="Personal Trainer">Personal Trainer</option>
                    <option value="Recepcionista">Recepcionista</option>
                    <option value="Gestor">Gestor</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <select 
                    id="edit-status" 
                    value={editStatus} 
                    onChange={e => setEditStatus(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-especialidade">Especialidade / Recurso</Label>
                <Input id="edit-especialidade" value={editEspecialidade} onChange={e => setEditEspecialidade(e.target.value)} className="bg-background" />
              </div>
              <Button onClick={handleUpdateEquipe} className="w-full gold-gradient text-primary-foreground h-11 font-bold mt-2">
                Salvar Alterações
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Equipe;
