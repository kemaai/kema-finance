
import React from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { MobileNavigation } from './MobileNavigation';
import { PWAInstallPrompt } from './PWAInstallPrompt';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  children
}) => {
  const location = useLocation();
  
  // Mapear as rotas para os nomes das páginas
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

  return <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        {/* Desktop Sidebar */}
        <AppSidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Mobile Header with Trigger - apenas no mobile */}
          <header className="md:hidden bg-white border-b border-border p-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">{getPageTitle(location.pathname)}</h1>
            </div>
            <SidebarTrigger />
          </header>

          {/* Main Content */}
          <main className="flex-1 pb-16 md:pb-0">
            {children}
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileNavigation />

        {/* PWA Install Prompt */}
        <PWAInstallPrompt />
      </div>
    </SidebarProvider>;
};
