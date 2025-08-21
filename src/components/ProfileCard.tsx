import React from 'react';
import { User, Settings, LogOut, Bell, Moon, Sun } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";
export const ProfileCard: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useLocalStorage<boolean>('darkMode', false);
  const [notifications, setNotifications] = useLocalStorage<boolean>('notifications', true);
  const {
    toast
  } = useToast();
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);

    // Aplicar o tema escuro no documento
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    toast({
      title: "Tema alterado",
      description: `Tema ${newDarkMode ? 'escuro' : 'claro'} ativado com sucesso!`
    });
  };
  const toggleNotifications = () => {
    const newNotifications = !notifications;
    setNotifications(newNotifications);
    toast({
      title: "Notificações",
      description: `Notificações ${newNotifications ? 'ativadas' : 'desativadas'} com sucesso!`
    });
  };

  // Aplicar tema escuro no carregamento inicial
  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  const handleLogout = () => {
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso!"
    });

    // Aqui você pode adicionar a lógica de logout real
    console.log('Logout realizado');
  };
  const handleProfileClick = () => {
    toast({
      title: "Perfil",
      description: "Abrindo configurações do perfil..."
    });
  };
  const handleSettingsClick = () => {
    toast({
      title: "Configurações",
      description: "Abrindo configurações do sistema..."
    });
  };
  return <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-12 px-4 bg-background hover:bg-accent border-border shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="hidden sm:block text-left">
              <div className="font-medium text-sm text-foreground">KS & KR</div>
              <div className="text-xs text-muted-foreground">Proprietário</div>
            </div>
          </div>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0 bg-popover border-border shadow-lg" align="end">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <div className="font-semibold text-foreground">KS & KR</div>
              <div className="text-sm text-muted-foreground">Proprietário</div>
              <div className="text-xs text-muted-foreground">ks.kr@exemplo.com</div>
            </div>
          </div>
        </div>
        
        <div className="p-2">
          <div className="space-y-1">
            
            
            
            
            
            
            <div className="flex items-center justify-between px-3 py-2 hover:bg-accent rounded-md transition-colors">
              <div className="flex items-center gap-3">
                {isDarkMode ? <Moon className="w-4 h-4 text-foreground" /> : <Sun className="w-4 h-4 text-foreground" />}
                <span className="text-sm text-foreground">Tema Escuro</span>
              </div>
              <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} className="data-[state=checked]:bg-primary" />
            </div>
          </div>
        </div>
        
        <div className="p-2 border-t border-border">
          <Button variant="ghost" className="w-full justify-start h-10 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 dark:hover:text-red-400" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-3" />
            Sair
          </Button>
        </div>
      </PopoverContent>
    </Popover>;
};