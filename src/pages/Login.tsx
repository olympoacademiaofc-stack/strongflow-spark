import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, Eye, EyeOff } from "lucide-react";
import logoOlimpo from "@/assets/logo-olimpo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Preencha todos os campos");
      return;
    }

    // Lógica interna: Transforma @olympo.com em @olimpo.com para compatibilidade com o DB
    let formattedEmail = email.toLowerCase();
    if (!formattedEmail.includes("@")) {
      formattedEmail = `${formattedEmail}@olimpo.com`;
    } else {
      formattedEmail = formattedEmail.replace("@olympo.com", "@olimpo.com");
    }

    const success = await login(formattedEmail, password);
    if (success) {
      navigate("/");
    } else {
      setError("E-mail ou senha inválidos");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center">
          <img src={logoOlimpo} alt="OLYMPO Centro de Treinamento" className="h-32 w-auto mx-auto mb-4" />
          <h1 className="text-4xl font-bold gold-text font-display">OLYMPO</h1>
          <p className="text-gray-400 mt-2 font-medium uppercase tracking-widest text-[10px]">Sistema Black Office</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-8 space-y-6 shadow-2xl mt-8"
        >
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Login ou E-mail</Label>
            <Input
              id="email"
              type="text"
              placeholder="ex: aluno ou seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#252525] border-none text-white h-11 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" title="password" className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#252525] border-none text-white h-11 rounded-xl"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 font-medium bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>
          )}

          <Button type="submit" className="w-full gold-gradient text-primary-foreground font-bold h-11 rounded-xl shadow-lg transform active:scale-[0.98] transition-all">
            <LogIn className="h-4 w-4 mr-2" />
            Acessar Sistema
          </Button>

          {/* Demo credentials */}
          <div className="border-t border-white/5 pt-6 space-y-3">
            <p className="text-[10px] text-gray-500 text-center font-bold uppercase tracking-widest">Credenciais OLYMPO</p>
            <div className="grid grid-cols-2 gap-3 text-[10px]">
              <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                <p className="font-bold text-primary uppercase mb-1">Admin</p>
                <p className="text-gray-400 font-medium">admin@olympo.com</p>
                <p className="text-gray-500 italic">admin123</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                <p className="font-bold text-primary uppercase mb-1">Aluno</p>
                <p className="text-gray-400 font-medium">carlos@email.com</p>
                <p className="text-gray-500 italic">aluno123</p>
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
