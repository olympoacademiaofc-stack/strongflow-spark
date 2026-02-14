import { useState } from "react";
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

const initialModalidades = [
  { id: 1, nome: "Musculação", descricao: "Treino de força com aparelhos e pesos livres", alunos: 80 },
  { id: 2, nome: "Funcional", descricao: "Treinamento funcional com exercícios compostos", alunos: 35 },
  { id: 3, nome: "Cross Training", descricao: "Treino de alta intensidade variado", alunos: 26 },
  { id: 4, nome: "Dança", descricao: "Aulas de ritmos variados e coreografia", alunos: 18 },
  { id: 5, nome: "Personal", descricao: "Acompanhamento individual personalizado", alunos: 16 },
];

const planos = [
  { nome: "Mensal", duracao: "1 mês", preco: "R$ 120", frequencias: ["3x/semana", "5x/semana"] },
  { nome: "Bimestral", duracao: "2 meses", preco: "R$ 220", frequencias: ["3x/semana", "5x/semana"] },
  { nome: "Trimestral", duracao: "3 meses", preco: "R$ 300", frequencias: ["3x/semana", "5x/semana"] },
  { nome: "Semestral", duracao: "6 meses", preco: "R$ 550", frequencias: ["3x/semana", "5x/semana"] },
  { nome: "Anual", duracao: "12 meses", preco: "R$ 960", frequencias: ["3x/semana", "5x/semana"] },
];

const Modalidades = () => {
  const { toast } = useToast();
  const [modalidades, setModalidades] = useState(initialModalidades);

  const handleDelete = (id: number) => {
    setModalidades(modalidades.filter((m) => m.id !== id));
    toast({ title: "Modalidade removida" });
  };

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Modalidades & Planos</h1>
            <p className="text-muted-foreground mt-1">Gerencie as modalidades e planos da academia</p>
          </div>
          <Dialog>
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
                  <Input placeholder="Ex: Yoga" className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input placeholder="Descrição da modalidade" className="bg-background" />
                </div>
                <Button className="w-full gold-gradient text-primary-foreground">Salvar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Modalidades */}
        <div>
          <h2 className="font-display text-xl font-semibold gold-text mb-4">Modalidades</h2>
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
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(mod.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{mod.descricao}</p>
                <p className="text-sm">
                  <span className="text-primary font-medium">{mod.alunos}</span>{" "}
                  <span className="text-muted-foreground">alunos matriculados</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Planos */}
        <div>
          <h2 className="font-display text-xl font-semibold gold-text mb-4">Planos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {planos.map((plano) => (
              <div key={plano.nome} className="stat-card text-center space-y-4">
                <h3 className="font-display font-semibold text-lg">{plano.nome}</h3>
                <div className="flex items-center justify-center gap-1">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="text-2xl font-bold gold-text">{plano.preco}</span>
                </div>
                <p className="text-sm text-muted-foreground">{plano.duracao}</p>
                <div className="flex flex-wrap gap-1 justify-center">
                  {plano.frequencias.map((f) => (
                    <Badge key={f} variant="outline" className="text-xs">
                      {f}
                    </Badge>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Modalidades;
