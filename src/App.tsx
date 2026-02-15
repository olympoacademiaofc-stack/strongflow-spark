import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Matricula from "./pages/Matricula";
import Alunos from "./pages/Alunos";
import Timeline from "./pages/Timeline";
import Checkin from "./pages/Checkin";
import Modalidades from "./pages/Modalidades";
import AreaAluno from "./pages/AreaAluno";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            {user?.role === "aluno" ? <Navigate to="/area-aluno" replace /> : <Dashboard />}
          </ProtectedRoute>
        }
      />
      <Route path="/matricula" element={<ProtectedRoute allowedRoles={["admin"]}><Matricula /></ProtectedRoute>} />
      <Route path="/alunos" element={<ProtectedRoute allowedRoles={["admin"]}><Alunos /></ProtectedRoute>} />
      <Route path="/timeline" element={<ProtectedRoute><Timeline /></ProtectedRoute>} />
      <Route path="/checkin" element={<ProtectedRoute><Checkin /></ProtectedRoute>} />
      <Route path="/modalidades" element={<ProtectedRoute allowedRoles={["admin"]}><Modalidades /></ProtectedRoute>} />
      <Route path="/area-aluno" element={<ProtectedRoute><AreaAluno /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
