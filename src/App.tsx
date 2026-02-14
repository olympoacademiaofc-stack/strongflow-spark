import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Matricula from "./pages/Matricula";
import Alunos from "./pages/Alunos";
import Timeline from "./pages/Timeline";
import Checkin from "./pages/Checkin";
import Modalidades from "./pages/Modalidades";
import AreaAluno from "./pages/AreaAluno";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/matricula" element={<Matricula />} />
          <Route path="/alunos" element={<Alunos />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/checkin" element={<Checkin />} />
          <Route path="/modalidades" element={<Modalidades />} />
          <Route path="/area-aluno" element={<AreaAluno />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
