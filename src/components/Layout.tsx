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
          <header className="md:hidden sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/60 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">KemaFinance</p>
                <h1 className="font-display text-lg font-bold text-foreground leading-tight">{getPageTitle(location.pathname)}</h1>
              </div>
            </div>
            <SidebarTrigger className="rounded-xl text-muted-foreground hover:text-primary hover:bg-muted/60 transition-colors" />
          </header>

          {/* Main Content */}
          <main className="flex-1 pb-24 md:pb-0 bg-background">
            {children}
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileNavigation />
      </div>
    </SidebarProvider>
  );
};
