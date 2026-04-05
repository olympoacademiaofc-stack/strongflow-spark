import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dumbbell,
  Plus,
  Edit,
  Trash2,
  DollarSign,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface Modalidade {
  id: number;
  nome: string;
  descricao: string;
  alunos_count: number;
}

interface Plano {
  id: number;
  nome: string;
  duracao: string;
  preco: number;
  frequencias: string[];
}

const Modalidades = () => {
  const { toast } = useToast();
  const [modalidades, setModalidades] = useState<Modalidade[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);

  const [novoModalidadeNome, setNovoModalidadeNome] = useState("");
  const [novoModalidadeDesc, setNovoModalidadeDesc] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Edit states
  const [editingModalidade, setEditingModalidade] = useState<Modalidade | null>(null);
  const [editingPlano, setEditingPlano] = useState<Plano | null>(null);
  const [editModNome, setEditModNome] = useState("");
  const [editModDesc, setEditModDesc] = useState("");
  const [editPlanoNome, setEditPlanoNome] = useState("");
  const [editPlanoPreco, setEditPlanoPreco] = useState(0);
  const [editPlanoDuracao, setEditPlanoDuracao] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [modRes, planRes] = await Promise.all([
        supabase.from('modalidades').select('*').order('id'),
        supabase.from('planos').select('*').order('id')
      ]);

      if (modRes.error) throw modRes.error;
      if (planRes.error) throw planRes.error;

      setModalidades(modRes.data || []);
      setPlanos(planRes.data || []);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModalidade = async () => {
    if (!novoModalidadeNome) return;
    try {
      const { data, error } = await supabase.from('modalidades').insert([{
        nome: novoModalidadeNome,
        descricao: novoModalidadeDesc,
        alunos_count: 0
      }]).select();

      if (error) throw error;
      
      setModalidades([...modalidades, data[0]]);
      toast({ title: "Modalidade criada com sucesso" });
      setIsDialogOpen(false);
      setNovoModalidadeNome("");
      setNovoModalidadeDesc("");
    } catch (error) {
       toast({ title: "Erro ao criar", variant: "destructive" });
    }
  };

  const handleUpdateModalidade = async () => {
    if (!editingModalidade || !editModNome) return;
    try {
      const { error } = await supabase
        .from('modalidades')
        .update({ nome: editModNome, descricao: editModDesc })
        .eq('id', editingModalidade.id);

      if (error) throw error;
      
      setModalidades(modalidades.map(m => m.id === editingModalidade.id ? { ...m, nome: editModNome, descricao: editModDesc } : m));
      toast({ title: "Modalidade atualizada" });
      setEditingModalidade(null);
    } catch (error) {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    }
  };

  const handleUpdatePlano = async () => {
    if (!editingPlano || !editPlanoNome) return;
    try {
      const { error } = await supabase
        .from('planos')
        .update({ nome: editPlanoNome, preco: editPlanoPreco, duracao: editPlanoDuracao })
        .eq('id', editingPlano.id);

      if (error) throw error;
      
      setPlanos(planos.map(p => p.id === editingPlano.id ? { ...p, nome: editPlanoNome, preco: editPlanoPreco, duracao: editPlanoDuracao } : p));
      toast({ title: "Plano atualizado" });
      setEditingPlano(null);
    } catch (error) {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    }
  };

  const startEditingModalidade = (mod: Modalidade) => {
    setEditingModalidade(mod);
    setEditModNome(mod.nome);
    setEditModDesc(mod.descricao);
  };

  const startEditingPlano = (p: Plano) => {
    setEditingPlano(p);
    setEditPlanoNome(p.nome);
    setEditPlanoPreco(p.preco);
    setEditPlanoDuracao(p.duracao);
  };

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase.from('modalidades').delete().eq('id', id);
      if (error) throw error;
      
      setModalidades(modalidades.filter((m) => m.id !== id));
      toast({ title: "Modalidade removida" });
    } catch (error) {
      toast({ title: "Erro ao remover", variant: "destructive" });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Modalidades & Planos</h1>
            <p className="text-muted-foreground mt-1">Gerencie as modalidades e planos da academia armazenados no banco</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gold-gradient text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Nova Modalidade
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="font-display">Nova Modalidade</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input placeholder="Ex: Yoga" className="bg-background" value={novoModalidadeNome} onChange={e => setNovoModalidadeNome(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input placeholder="Descrição da modalidade" className="bg-background" value={novoModalidadeDesc} onChange={e => setNovoModalidadeDesc(e.target.value)} />
                </div>
                <Button onClick={handleCreateModalidade} className="w-full gold-gradient text-primary-foreground">Salvar no BD</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Modalidades */}
        <div>
          <h2 className="font-display text-xl font-semibold gold-text mb-4">Modalidades</h2>
          {loading ? (
             <p className="text-muted-foreground">Carregando modalidades...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modalidades.map((mod) => (
                <div key={mod.id} className="stat-card space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Dumbbell className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-display font-semibold">{mod.nome}</h3>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => startEditingModalidade(mod)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(mod.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{mod.descricao}</p>
                  <p className="text-sm">
                    <span className="text-primary font-medium">{mod.alunos_count}</span>{" "}
                    <span className="text-muted-foreground">alunos matriculados</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Planos */}
        <div>
          <h2 className="font-display text-xl font-semibold gold-text mb-4">Planos</h2>
          {loading ? (
             <p className="text-muted-foreground">Carregando planos...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {planos.map((plano) => (
                <div key={plano.id} className="stat-card text-center space-y-4">
                  <h3 className="font-display font-semibold text-lg">{plano.nome}</h3>
                  <div className="flex items-center justify-center gap-1">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="text-2xl font-bold gold-text">R$ {plano.preco}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{plano.duracao}</p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {plano.frequencias?.map((f) => (
                      <Badge key={f} variant="outline" className="text-xs">
                        {f}
                      </Badge>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => startEditingPlano(plano)}>
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Modalidade Dialog */}
        <Dialog open={!!editingModalidade} onOpenChange={(open) => !open && setEditingModalidade(null)}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-display">Editar Modalidade</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input className="bg-background" value={editModNome} onChange={e => setEditModNome(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input className="bg-background" value={editModDesc} onChange={e => setEditModDesc(e.target.value)} />
              </div>
              <Button onClick={handleUpdateModalidade} className="w-full gold-gradient text-primary-foreground">Salvar Alterações</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Plano Dialog */}
        <Dialog open={!!editingPlano} onOpenChange={(open) => !open && setEditingPlano(null)}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-display">Editar Plano</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do Plano</Label>
                <Input className="bg-background" value={editPlanoNome} onChange={e => setEditPlanoNome(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preço (R$)</Label>
                  <Input type="number" className="bg-background" value={editPlanoPreco} onChange={e => setEditPlanoPreco(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Duração</Label>
                  <Input className="bg-background" value={editPlanoDuracao} onChange={e => setEditPlanoDuracao(e.target.value)} placeholder="Ex: Mensal" />
                </div>
              </div>
              <Button onClick={handleUpdatePlano} className="w-full gold-gradient text-primary-foreground">Salvar Alterações</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Modalidades;
