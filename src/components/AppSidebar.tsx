import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  UserPlus,
  Users,
  MessageSquare,
  CalendarCheck,
  Dumbbell,
  UserCircle,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import logoOlimpo from "@/assets/logo-olimpo.png";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Matrícula", url: "/matricula", icon: UserPlus },
  { title: "Alunos", url: "/alunos", icon: Users },
  { title: "Equipe", url: "/equipe", icon: UserCircle },
  { title: "Mural", url: "/timeline", icon: MessageSquare }, // Renamed to Mural
  { title: "Check-in", url: "/checkin", icon: CalendarCheck },
  { title: "Modalidades", url: "/modalidades", icon: Dumbbell },
  { title: "Área do Aluno", url: "/area-aluno", icon: UserCircle },
  { title: "Área do Professor", url: "/area-professor", icon: LayoutDashboard },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const filteredNavItems = user?.role === "aluno"
    ? navItems.filter((item) => ["/area-aluno", "/timeline", "/checkin"].includes(item.url))
    : user?.role === "professor"
    ? navItems.filter((item) => ["/area-professor", "/timeline", "/alunos"].includes(item.url))
    : navItems.filter((item) => !["/area-aluno", "/area-professor", "/checkin"].includes(item.url)); // Admin is Master


  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-card border border-border"
      >
        <Menu className="h-5 w-5 text-foreground" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 z-50 h-screen
          bg-sidebar border-r border-sidebar-border
          transition-all duration-300 flex flex-col
          ${collapsed ? "w-[70px]" : "w-[250px]"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3 px-1 py-1">
            <img src={logoOlimpo} alt="OLYMPO" className="h-8 w-8 shrink-0 object-contain" />
            {!collapsed && (
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-bold text-sm gold-text tracking-widest font-display">
                  OLYMPO
                </span>
                <span className="text-[10px] text-gray-400 font-medium tracking-tighter uppercase">
                  Centro de Treinamento
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => {
              setCollapsed(!collapsed);
              setMobileOpen(false);
            }}
            className="text-muted-foreground hover:text-foreground transition-colors hidden md:block"
          >
            {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="text-muted-foreground hover:text-foreground transition-colors md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <NavLink
                key={item.url}
                to={item.url}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                  ${
                    isActive
                      ? "gold-gradient text-primary-foreground font-medium shadow-lg"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }
                `}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span className="text-sm">{item.title}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="p-4 border-t border-sidebar-border space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full gold-gradient flex items-center justify-center text-xs font-bold text-primary-foreground">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => { logout(); navigate("/login"); }}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors w-full"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
