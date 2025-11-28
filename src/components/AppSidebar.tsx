import React from 'react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter } from "@/components/ui/sidebar";
import { Home, Users, Globe, Wrench, BarChart3, Receipt, CreditCard, LogOut, User, UserPlus, Scissors, FileText, Moon, Sun } from "lucide-react";
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';
const navigation = [{
  title: "Dashboard",
  url: "/dashboard",
  icon: Home
}, {
  title: "Clientes",
  url: "/clientes",
  icon: Users
}, {
  title: "Sites",
  url: "/sites",
  icon: Globe
}, {
  title: "Instalações",
  url: "/instalacoes",
  icon: Wrench
}, {
  title: "Despesas",
  url: "/despesas",
  icon: Receipt
}, {
  title: "Dívidas",
  url: "/dividas",
  icon: CreditCard
}, {
  title: "Relatórios",
  url: "/relatorios",
  icon: BarChart3
}];

const quickActions = [{
  title: "Novo Cliente",
  url: "/clientes",
  icon: UserPlus
}, {
  title: "Novo Site",
  url: "/sites",
  icon: Globe
}, {
  title: "Nova Instalação",
  url: "/instalacoes",
  icon: Scissors
}, {
  title: "Novo Relatório",
  url: "/relatorios",
  icon: FileText
}];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    user,
    signOut
  } = useAuth();
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useLocalStorage<boolean>('darkMode', false);
  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    toast({
      title: "Tema alterado",
      description: `Tema ${newDarkMode ? 'escuro' : 'claro'} ativado`
    });
  };

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  return <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">KS</span>
          </div>
          <div>
            
            <p className="text-xs text-muted-foreground">CRM System</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url} onClick={() => navigate(item.url)}>
                    <button className="flex items-center gap-2 w-full">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Ações Rápidas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickActions.map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild onClick={() => navigate(item.url)}>
                    <button className="flex items-center gap-2 w-full">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
            <User className="w-4 h-4" />
            <div className="flex-1 text-sm">
              <p className="font-medium">{user?.user_metadata?.full_name || user?.email}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors">
            <div className="flex items-center gap-2">
              {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              <span className="text-sm">Tema Escuro</span>
            </div>
            <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
          </div>

          <Button onClick={handleSignOut} variant="ghost" size="sm" className="w-full justify-start gap-2">
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>;
}