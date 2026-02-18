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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Preencha todos os campos");
      return;
    }

    const success = login(email, password);
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
        <div className="text-center mb-8">
          <img src={logoOlimpo} alt="OLIMPO Centro de Treinamento" className="h-32 w-auto mx-auto mb-4 mix-blend-screen" />
          <h1 className="text-4xl font-bold gold-text font-display">OLIMPO</h1>
          <p className="text-muted-foreground mt-1 text-sm tracking-widest">CENTRO DE TREINAMENTO</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-2xl p-8 space-y-6 card-glow"
        >
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive font-medium">{error}</p>
          )}

          <Button type="submit" className="w-full gold-gradient text-primary-foreground font-semibold h-11">
            <LogIn className="h-4 w-4 mr-2" />
            Entrar
          </Button>

          {/* Demo credentials */}
          <div className="border-t border-border pt-4 space-y-2">
            <p className="text-xs text-muted-foreground text-center font-medium">Credenciais de demonstração</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-secondary/50 rounded-lg p-3">
                <p className="font-semibold text-foreground">Admin</p>
                <p className="text-muted-foreground">admin@olimpo.com</p>
                <p className="text-muted-foreground">admin123</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3">
                <p className="font-semibold text-foreground">Aluno</p>
                <p className="text-muted-foreground">carlos@email.com</p>
                <p className="text-muted-foreground">aluno123</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
