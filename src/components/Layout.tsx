import React from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { MobileNavigation } from './MobileNavigation';


interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  
  const getPageTitle = (pathname: string) => {
    const routes: { [key: string]: string } = {
      '/': 'Dashboard',
      '/dashboard': 'Dashboard',
      '/clientes': 'Clientes',
      '/sites': 'Sites',
      '/instalacoes': 'Instalações',
      '/despesas': 'Despesas',
      '/dividas': 'Dívidas',
      '/relatorios': 'Relatórios'
    };
    
    return routes[pathname] || 'Dashboard';
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Desktop Sidebar */}
        <AppSidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Mobile Header */}
          <header className="md:hidden bg-card border-b border-border p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="KemaAI" className="w-8 h-8 object-contain" />
              <div>
                <h1 className="text-lg font-bold text-foreground">{getPageTitle(location.pathname)}</h1>
              </div>
            </div>
            <SidebarTrigger className="text-foreground hover:text-primary transition-colors" />
          </header>

          {/* Main Content */}
          <main className="flex-1 pb-16 md:pb-0 bg-background">
            <div className="relative">
              {/* Subtle background effects */}
              <div className="absolute inset-0 bg-tech-particles pointer-events-none"></div>
              <div className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-50"></div>
              <div className="relative">
                {children}
              </div>
            </div>
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileNavigation />
      </div>
    </SidebarProvider>
  );
};
