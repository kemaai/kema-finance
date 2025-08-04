
import React from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { MobileNavigation } from './MobileNavigation';
import { QuickActions } from './QuickActions';
import { ProfileCard } from './ProfileCard';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  children
}) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        {/* Desktop Sidebar */}
        <AppSidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Header for both mobile and desktop */}
          <header className="bg-white border-b border-border p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Sidebar Trigger */}
              <div className="md:hidden">
                <SidebarTrigger />
              </div>
              <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center gap-3">
              <QuickActions />
              <ProfileCard />
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 pb-16 md:pb-0">
            {children}
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileNavigation />
      </div>
    </SidebarProvider>
  );
};
