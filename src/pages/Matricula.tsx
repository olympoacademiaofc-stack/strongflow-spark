import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Matricula = () => {
  const { toast } = useToast();
  const [foto, setFoto] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Aluno cadastrado!",
      description: "Matrícula realizada com sucesso.",
    });
  };

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl animate-fade-in space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Matrícula</h1>
          <p className="text-muted-foreground mt-1">Cadastro de novos alunos</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Foto */}
          <div className="flex items-center gap-6">
            <label
              htmlFor="foto-upload"
              className="h-24 w-24 rounded-full border-2 border-dashed border-border hover:border-primary cursor-pointer flex items-center justify-center overflow-hidden transition-colors bg-muted"
            >
              {foto ? (
                <img src={foto} alt="Foto" className="h-full w-full object-cover" />
              ) : (
                <Camera className="h-8 w-8 text-muted-foreground" />
              )}
            </label>
            <input
              id="foto-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFoto}
            />
            <div>
              <p className="font-medium">Foto do aluno</p>
              <p className="text-sm text-muted-foreground">Clique para fazer upload</p>
            </div>
          </div>

          {/* Dados do aluno */}
          <div className="stat-card space-y-6">
            <h2 className="font-display text-lg font-semibold gold-text">Dados do Aluno</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome completo</Label>
                <Input id="nome" placeholder="João da Silva" className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input id="cpf" placeholder="000.000.000-00" className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input id="whatsapp" placeholder="(00) 00000-0000" className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nascimento">Data de nascimento</Label>
                <Input id="nascimento" type="date" className="bg-background" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input id="endereco" placeholder="Rua, número, bairro, cidade" className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data-matricula">Data da matrícula</Label>
                <Input id="data-matricula" type="date" className="bg-background" />
              </div>
            </div>
          </div>

          {/* Contato de emergência */}
          <div className="stat-card space-y-6">
            <h2 className="font-display text-lg font-semibold gold-text">Contato de Emergência</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contato-nome">Nome do contato</Label>
                <Input id="contato-nome" placeholder="Maria da Silva" className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contato-tel">Telefone</Label>
                <Input id="contato-tel" placeholder="(00) 00000-0000" className="bg-background" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="contato-end">Endereço do contato</Label>
                <Input id="contato-end" placeholder="Rua, número, bairro, cidade" className="bg-background" />
              </div>
            </div>
          </div>

          {/* Plano */}
          <div className="stat-card space-y-6">
            <h2 className="font-display text-lg font-semibold gold-text">Dados do Plano</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Modalidade</Label>
                <Select>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="musculacao">Musculação</SelectItem>
                    <SelectItem value="funcional">Funcional</SelectItem>
                    <SelectItem value="cross">Cross Training</SelectItem>
                    <SelectItem value="danca">Dança</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Plano</Label>
                <Select>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensal">Mensal</SelectItem>
                    <SelectItem value="bimestral">Bimestral</SelectItem>
                    <SelectItem value="trimestral">Trimestral</SelectItem>
                    <SelectItem value="semestral">Semestral</SelectItem>
                    <SelectItem value="anual">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="gold-gradient text-primary-foreground font-semibold px-8">
              <UserPlus className="h-4 w-4 mr-2" />
              Cadastrar Aluno
            </Button>
            <Button type="button" variant="outline">
              Editar Cadastro
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};

export default Matricula;
