import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  UserPlus,
  Users,
  MessageSquare,
  CalendarCheck,
  Dumbbell,
  Menu,
  X,
  Crown,
} from "lucide-react";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Matrícula", url: "/matricula", icon: UserPlus },
  { title: "Alunos", url: "/alunos", icon: Users },
  { title: "Timeline", url: "/timeline", icon: MessageSquare },
  { title: "Check-in", url: "/checkin", icon: CalendarCheck },
  { title: "Modalidades", url: "/modalidades", icon: Dumbbell },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

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
          <div className="flex items-center gap-2 overflow-hidden">
            <Crown className="h-7 w-7 text-primary shrink-0" />
            {!collapsed && (
              <span className="font-display text-xl font-bold gold-text whitespace-nowrap">
                OLIMPO
              </span>
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
          {navItems.map((item) => {
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
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full gold-gradient flex items-center justify-center text-xs font-bold text-primary-foreground">
                A
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-foreground truncate">Admin</p>
                <p className="text-xs text-muted-foreground truncate">admin@olimpo.com</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
