import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Edit, History, CalendarCheck, ChevronRight } from "lucide-react";

type StatusType = "ativo" | "inativo" | "cobranca";

const mockAlunos = [
  { id: 1, nome: "Carlos Silva", cpf: "123.456.789-00", modalidade: "Musculação", plano: "Mensal", status: "ativo" as StatusType, whatsapp: "(11) 99999-0001" },
  { id: 2, nome: "Ana Oliveira", cpf: "234.567.890-11", modalidade: "Funcional", plano: "Trimestral", status: "ativo" as StatusType, whatsapp: "(11) 99999-0002" },
  { id: 3, nome: "Pedro Santos", cpf: "345.678.901-22", modalidade: "Cross Training", plano: "Semestral", status: "inativo" as StatusType, whatsapp: "(11) 99999-0003" },
  { id: 4, nome: "Maria Costa", cpf: "456.789.012-33", modalidade: "Dança", plano: "Anual", status: "cobranca" as StatusType, whatsapp: "(11) 99999-0004" },
  { id: 5, nome: "Lucas Ferreira", cpf: "567.890.123-44", modalidade: "Musculação", plano: "Mensal", status: "ativo" as StatusType, whatsapp: "(11) 99999-0005" },
  { id: 6, nome: "Juliana Lima", cpf: "678.901.234-55", modalidade: "Personal", plano: "Mensal", status: "cobranca" as StatusType, whatsapp: "(11) 99999-0006" },
];

const statusConfig: Record<StatusType, { label: string; color: string }> = {
  ativo: { label: "Ativo", color: "bg-success/20 text-success border-success/30" },
  inativo: { label: "Inativo", color: "bg-danger/20 text-danger border-danger/30" },
  cobranca: { label: "Em cobrança", color: "bg-warning/20 text-warning border-warning/30" },
};

const Alunos = () => {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<StatusType | "todos">("todos");

  const filtered = mockAlunos.filter((a) => {
    const matchNome = a.nome.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === "todos" || a.status === filtroStatus;
    return matchNome && matchStatus;
  });

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold">Alunos</h1>
          <p className="text-muted-foreground mt-1">Gerenciamento de alunos cadastrados</p>
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
          {filtered.map((aluno) => (
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
                    {aluno.modalidade} · {aluno.plano}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="outline" className={statusConfig[aluno.status].color}>
                  {statusConfig[aluno.status].label}
                </Badge>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" title="Editar">
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
      </div>
    </AppLayout>
  );
};

export default Alunos;
