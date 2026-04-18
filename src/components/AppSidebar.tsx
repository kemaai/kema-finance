import React from 'react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter } from "@/components/ui/sidebar";
import { Home, Users, Globe, Wrench, BarChart3, Receipt, CreditCard, LogOut, User, UserPlus, Scissors, FileText, Moon, Sun, Brain } from "lucide-react";
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';

const navigation = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Sites", url: "/sites", icon: Globe },
  { title: "Instalações", url: "/instalacoes", icon: Wrench },
  { title: "Despesas", url: "/despesas", icon: Receipt },
  { title: "Dívidas", url: "/dividas", icon: CreditCard },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
  { title: "KemaFinance AI", url: "/agente", icon: Brain },
];

const quickActions = [
  { title: "Novo Cliente", url: "/clientes", icon: UserPlus },
  { title: "Novo Site", url: "/sites", icon: Globe },
  { title: "Nova Instalação", url: "/instalacoes", icon: Scissors },
  { title: "Novo Relatório", url: "/relatorios", icon: FileText },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useLocalStorage<boolean>('darkMode', true);

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

  return (
    <Sidebar className="border-r border-border bg-sidebar">
      <SidebarHeader className="p-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-bold text-foreground">KEMA Finance</h1>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground text-[11px] uppercase tracking-wider px-2 mb-1">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      onClick={() => navigate(item.url)}
                      className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-primary/15 text-primary border-l-2 border-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      <button className="flex items-center gap-3 w-full">
                        <item.icon className={`w-4 h-4 ${isActive ? 'text-primary' : ''}`} />
                        <span className="font-medium text-sm">{item.title}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-muted-foreground text-[11px] uppercase tracking-wider px-2 mb-1">
            Ações Rápidas
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickActions.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    onClick={() => navigate(item.url)}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
                  >
                    <button className="flex items-center gap-3 w-full">
                      <item.icon className="w-4 h-4" />
                      <span className="text-sm">{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border">
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border">
            <div className="w-9 h-9 bg-accent/20 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                Adriano Silva
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-2">
              {isDarkMode ? <Moon className="w-4 h-4 text-accent" /> : <Sun className="w-4 h-4 text-amber-500" />}
              <span className="text-sm text-foreground">Tema Escuro</span>
            </div>
            <Switch
              checked={isDarkMode}
              onCheckedChange={toggleDarkMode}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          <Button
            onClick={handleSignOut}
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
