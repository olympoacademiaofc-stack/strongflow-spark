import { useState, useEffect } from "react";
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
import { supabase } from "@/lib/supabase";

interface Modalidade { id: number; nome: string; }
interface Plano { id: number; nome: string; }

const Matricula = () => {
  const { toast } = useToast();
  const [foto, setFoto] = useState<string | null>(null);
  
  const [modalidades, setModalidades] = useState<Modalidade[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // Form State
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [endereco, setEndereco] = useState("");
  const [dataMatricula, setDataMatricula] = useState("");
  const [contatoNome, setContatoNome] = useState("");
  const [contatoTel, setContatoTel] = useState("");
  const [contatoEnd, setContatoEnd] = useState("");
  const [modalidadeId, setModalidadeId] = useState("");
  const [planoId, setPlanoId] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  useEffect(() => {
    const fetchOptions = async () => {
      const { data: mods } = await supabase.from('modalidades').select('id, nome');
      const { data: plans } = await supabase.from('planos').select('id, nome');
      setModalidades(mods || []);
      setPlanos(plans || []);
      setLoadingOptions(false);
    };
    fetchOptions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !cpf || !modalidadeId || !planoId || !email || !senha) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }

    if (senha.length < 6) {
      toast({ title: "Senha muito curta", description: "A senha deve ter no mínimo 6 dígitos", variant: "destructive" });
      return;
    }

    setLoadingSubmit(true);
    try {
      // 1. Criar o login no Supabase Auth (Oficial & Seguro)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          data: {
            role: 'aluno',
            nome
          },
          emailRedirectTo: window.location.origin
        }
      });

      if (signUpError) throw signUpError;
      if (!signUpData.user) throw new Error("Usuário não retornado pelo Auth");

      // 2. Salvar o perfil na tabela public.alunos vinculado ao user_id
      const { error: insertError } = await supabase.from('alunos').insert([{
        user_id: signUpData.user.id,
        nome,
        cpf,
        email,
        whatsapp,
        nascimento: dataNascimento || null,
        endereco,
        modalidade_id: modalidadeId,
        plano_id: planoId,
        status: 'ativo',
        contato_nome: contatoNome,
        contato_tel: contatoTel,
        contato_end: contatoEnd
      }]);

      if (insertError) throw insertError;

      toast({ title: "Matrícula realizada!", description: `Acesso criado para ${nome}` });
      
      // Reset
      setNome(""); setCpf(""); setWhatsapp(""); setDataNascimento("");
      setEndereco(""); setContatoNome(""); setContatoTel("");
      setContatoEnd(""); setEmail(""); setSenha("");
      
    } catch (error: any) {
      console.error("[Matricula] Erro:", error);
      let errorMsg = error.message;
      
      if (error.message?.includes("already exists") || error.code === "23505") {
        errorMsg = "Este e-mail já está sendo utilizado por outro usuário.";
      }
      
      toast({ title: "Erro ao matricular", description: errorMsg, variant: "destructive" });
    } finally {
      setLoadingSubmit(false);
    }
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
          <p className="text-muted-foreground mt-1">Cadastro de novos alunos (Integrado com Banco de Dados)</p>
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
                <Label htmlFor="nome">Nome completo *</Label>
                <Input id="nome" value={nome} onChange={e => setNome(e.target.value)} placeholder="João da Silva" className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input id="cpf" value={cpf} onChange={e => setCpf(e.target.value)} placeholder="000.000.000-00" className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input id="whatsapp" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="(00) 00000-0000" className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nascimento">Data de nascimento</Label>
                <Input id="nascimento" value={dataNascimento} onChange={e => setDataNascimento(e.target.value)} type="date" className="bg-background" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input id="endereco" value={endereco} onChange={e => setEndereco(e.target.value)} placeholder="Rua, número, bairro, cidade" className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data-matricula">Data da matrícula</Label>
                <Input id="data-matricula" value={dataMatricula} onChange={e => setDataMatricula(e.target.value)} type="date" className="bg-background" />
              </div>
            </div>
          </div>

          {/* Acesso ao Sistema */}
          <div className="stat-card space-y-6">
            <h2 className="font-display text-lg font-semibold gold-text">Acesso ao Sistema</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail de Acesso *</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="aluno@exemplo.com" className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senha">Senha de Acesso (mín. 6 dígitos) *</Label>
                <Input id="senha" type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="******" className="bg-background" />
              </div>
            </div>
          </div>

          {/* Contato de emergência */}
          <div className="stat-card space-y-6">
            <h2 className="font-display text-lg font-semibold gold-text">Contato de Emergência</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contato-nome">Nome do contato</Label>
                <Input id="contato-nome" value={contatoNome} onChange={e => setContatoNome(e.target.value)} placeholder="Maria da Silva" className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contato-tel">Telefone</Label>
                <Input id="contato-tel" value={contatoTel} onChange={e => setContatoTel(e.target.value)} placeholder="(00) 00000-0000" className="bg-background" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="contato-end">Endereço do contato</Label>
                <Input id="contato-end" value={contatoEnd} onChange={e => setContatoEnd(e.target.value)} placeholder="Rua, número, bairro, cidade" className="bg-background" />
              </div>
            </div>
          </div>

          {/* Plano */}
          <div className="stat-card space-y-6">
            <h2 className="font-display text-lg font-semibold gold-text">Dados do Plano</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Modalidade *</Label>
                <Select value={modalidadeId} onValueChange={setModalidadeId} disabled={loadingOptions}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder={loadingOptions ? "Carregando..." : "Selecione"} />
                  </SelectTrigger>
                  <SelectContent>
                    {modalidades.map(m => (
                      <SelectItem key={m.id} value={m.id.toString()}>{m.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Plano *</Label>
                <Select value={planoId} onValueChange={setPlanoId} disabled={loadingOptions}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder={loadingOptions ? "Carregando..." : "Selecione"} />
                  </SelectTrigger>
                  <SelectContent>
                    {planos.map(p => (
                      <SelectItem key={p.id} value={p.id.toString()}>{p.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={loadingSubmit} className="gold-gradient text-primary-foreground font-semibold px-8">
              <UserPlus className="h-4 w-4 mr-2" />
              {loadingSubmit ? "Salvando..." : "Cadastrar Aluno"}
            </Button>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};

export default Matricula;
