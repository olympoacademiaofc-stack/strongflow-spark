import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "admin" | "aluno";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Mock users
const MOCK_USERS: (User & { password: string })[] = [
  { id: "1", name: "Administrador", email: "admin@olimpo.com", password: "admin123", role: "admin" },
  { id: "2", name: "Carlos Silva", email: "carlos@email.com", password: "aluno123", role: "aluno" },
  { id: "3", name: "Ana Costa", email: "ana@email.com", password: "aluno123", role: "aluno" },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("olimpo_user");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("olimpo_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("olimpo_user");
    }
  }, [user]);

  const login = (email: string, password: string): boolean => {
    const found = MOCK_USERS.find((u) => u.email === email && u.password === password);
    if (found) {
      const { password: _, ...userData } = found;
      setUser(userData);
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
