import React from 'react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter } from "@/components/ui/sidebar";
import { Home, Users, Briefcase, Wrench, BarChart3, Receipt, CreditCard, LogOut, User, UserPlus, Scissors, FileText, Moon, Sun, Brain, Settings } from "lucide-react";
import kemaIcon from "@/assets/kema-icon.png";
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';

const navigation = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Serviços", url: "/servicos", icon: Briefcase },
  { title: "Instalações", url: "/instalacoes", icon: Wrench },
  { title: "Despesas", url: "/despesas", icon: Receipt },
  { title: "Dívidas", url: "/dividas", icon: CreditCard },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
  { title: "KemaFinance AI", url: "/agente", icon: Brain },
  { title: "Meu Perfil", url: "/perfil", icon: User },
];

const quickActions = [
  { title: "Novo Cliente", url: "/clientes", icon: UserPlus },
  { title: "Novo Serviço", url: "/servicos", icon: Briefcase },
  { title: "Nova Instalação", url: "/instalacoes", icon: Scissors },
  { title: "Novo Relatório", url: "/relatorios", icon: FileText },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
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

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-block-ink flex items-center justify-center">
            <img
              src={kemaIcon}
              alt="KemaFinance"
              width={24}
              height={24}
              className="w-6 h-6 object-contain"
            />
          </div>
          <div className="leading-tight">
            <h1 className="font-display text-base font-bold text-foreground">KemaFinance</h1>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Gestão financeira</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/70 text-[10px] font-semibold uppercase tracking-[0.18em] px-2 mb-1.5">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.url;
                const slug = item.url.replace(/^\//, '') || 'home';
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      onClick={() => navigate(item.url)}
                      className={`relative flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-block-ink text-block-ink-foreground font-semibold shadow-elev-1'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <button
                        data-testid={`nav-${slug}`}
                        aria-label={item.title}
                        className="flex items-center gap-3 w-full"
                      >
                        <item.icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.4 : 2} />
                        <span className="text-sm">{item.title}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-5">
          <SidebarGroupLabel className="text-muted-foreground/70 text-[10px] font-semibold uppercase tracking-[0.18em] px-2 mb-1.5">
            Ações Rápidas
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {quickActions.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    onClick={() => navigate(item.url)}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
                  >
                    <button className="flex items-center gap-3 w-full">
                      <item.icon className="w-4 h-4 opacity-80" />
                      <span className="text-sm">{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border">
        <div className="space-y-2">
          {(() => {
            const displayName = profile?.full_name || profile?.first_name || user?.email?.split('@')[0] || 'Usuário';
            const initials = displayName
              .split(' ')
              .map((p) => p[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();
            return (
              <button
                type="button"
                onClick={() => navigate('/perfil')}
                className="flex items-center gap-3 p-2.5 bg-surface-2 rounded-2xl border border-border w-full text-left hover:bg-muted transition-colors"
              >
                <Avatar className="w-9 h-9 ring-2 ring-border">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
                  <AvatarFallback className="bg-block-violet text-block-violet-foreground text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {displayName}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">Ver perfil</p>
                </div>
              </button>
            );
          })()}
          
          <div className="flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-muted/40 transition-colors">
            <div className="flex items-center gap-2">
              {isDarkMode ? <Moon className="w-4 h-4 text-accent" /> : <Sun className="w-4 h-4 text-amber-500" />}
              <span className="text-sm text-muted-foreground">Tema Escuro</span>
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
            data-testid="nav-logout"
            className="w-full justify-start gap-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
