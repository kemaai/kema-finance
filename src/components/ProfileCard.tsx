import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Moon, Sun, UserCog } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const ProfileCard: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [isDarkMode, setIsDarkMode] = useLocalStorage<boolean>('darkMode', false);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    if (newDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    toast.success(`Tema ${newDarkMode ? 'escuro' : 'claro'} ativado!`);
  };

  React.useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const displayName = profile?.full_name || 'Usuário';
  const initials = (profile?.full_name || user?.email || 'U')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-12 px-3 bg-background hover:bg-accent border-border shadow-sm hover:shadow-md transition-all duration-200">
          <Avatar className="w-8 h-8">
            <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {initials || <User className="w-4 h-4" />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0 bg-popover border-border shadow-lg" align="end">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
              <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-foreground truncate">{displayName}</div>
              <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
            </div>
          </div>
        </div>

        <div className="p-2">
          <Button
            variant="ghost"
            className="w-full justify-start h-10 px-3 text-foreground"
            onClick={() => navigate('/perfil')}
          >
            <UserCog className="w-4 h-4 mr-3" />
            Meu Perfil
          </Button>

          <div className="flex items-center justify-between px-3 py-2 hover:bg-accent rounded-md transition-colors">
            <div className="flex items-center gap-3">
              {isDarkMode ? <Moon className="w-4 h-4 text-foreground" /> : <Sun className="w-4 h-4 text-foreground" />}
              <span className="text-sm text-foreground">Tema Escuro</span>
            </div>
            <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} className="data-[state=checked]:bg-primary" />
          </div>
        </div>

        <div className="p-2 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start h-10 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sair
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
