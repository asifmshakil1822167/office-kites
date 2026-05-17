import {
  LayoutDashboard, Users, Package, DollarSign, LogOut, Building2, Menu,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const navItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'HR Module', url: '/hr', icon: Users },
  { title: 'Inventory', url: '/inventory', icon: Package },
  { title: 'Finance', url: '/finance', icon: DollarSign },
];

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/20 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 flex flex-col bg-sidebar text-sidebar-foreground transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 px-5 h-16 border-b border-sidebar-border">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Building2 className="w-4 h-4 text-sidebar-primary-foreground" />
          </div>
          <span className="font-semibold text-sidebar-accent-foreground text-lg">ERP System</span>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.url}
              to={item.url}
              end={item.url === '/'}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.title}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-sidebar-accent-foreground truncate">{user?.name}</p>
              <p className="text-xs text-sidebar-muted">{user?.role}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} className="text-sidebar-muted hover:text-sidebar-accent-foreground hover:bg-sidebar-accent shrink-0">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 h-14 flex items-center gap-3 px-4 bg-card border-b lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <span className="font-semibold text-foreground">ERP System</span>
        </header>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
