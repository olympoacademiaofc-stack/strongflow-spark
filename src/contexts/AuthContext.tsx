import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";

export type UserRole = "admin" | "aluno" | "professor" | "colaborador";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Para manter a compatibilidade com os testes/demonstração enquanto o backend puro não tem RLS de perfis complexo.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const metadataRole = session.user.user_metadata?.role as UserRole;
        const isAdmin = session.user.email?.includes("admin@") || session.user.email === "admin@olimpo.com";
        
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.nome || session.user.email?.split('@')[0] || 'Usuário',
          email: session.user.email!,
          role: metadataRole || (isAdmin ? "admin" : "aluno"),
        });
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session?.user) {
          const metadataRole = session.user.user_metadata?.role as UserRole;
          const isAdmin = session.user.email?.includes("admin@") || session.user.email === "admin@olimpo.com";

          setUser({
            id: session.user.id,
            name: session.user.user_metadata?.nome || session.user.email?.split('@')[0] || 'Usuário',
            email: session.user.email!,
            role: metadataRole || (isAdmin ? "admin" : "aluno"),
          });
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error("[Auth] Erro no login:", error.message);
      return false;
    }
    
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <AuthContext.Provider value={{ user, session, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
