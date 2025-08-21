import React from 'react';
import { Plus, UserPlus, Globe, Scissors, FileText, Bell } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
export const QuickActions: React.FC = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const handleNotificationClick = () => {
    toast({
      title: "Notificações",
      description: "Você não tem notificações pendentes no momento."
    });
  };
  const actions = [{
    icon: UserPlus,
    label: 'Novo Cliente',
    description: 'Cadastrar novo cliente',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    onClick: () => navigate('/clientes')
  }, {
    icon: Globe,
    label: 'Novo Site',
    description: 'Criar novo projeto de site',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    onClick: () => navigate('/sites')
  }, {
    icon: Scissors,
    label: 'Nova Instalação',
    description: 'Agendar instalação',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    onClick: () => navigate('/instalacoes')
  }, {
    icon: FileText,
    label: 'Relatório',
    description: 'Gerar relatório personalizado',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    onClick: () => navigate('/relatorios')
  }];
  return <div className="flex gap-2">
      {/* Botão de Notificações */}
      <Popover>
        <PopoverTrigger asChild>
          
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-4 bg-popover border-border shadow-lg" align="end">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-foreground">Notificações</h4>
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">0</span>
              </div>
            </div>
            
            <div className="text-center py-8">
              <Bell className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground text-sm">Nenhuma notificação pendente</p>
            </div>
            
            <Button variant="ghost" className="w-full justify-center text-sm" onClick={handleNotificationClick}>
              Ver todas as notificações
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Menu de Ações Rápidas */}
      <Popover>
        <PopoverTrigger asChild>
          <Button className="h-12 px-4 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200">
            <Plus className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">Ações Rápidas</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-72 p-2 bg-popover border-border shadow-lg" align="end">
          <div className="space-y-1">
            <div className="px-3 py-2 border-b border-border">
              <h4 className="font-semibold text-sm text-foreground">Ações Rápidas</h4>
              <p className="text-xs text-muted-foreground">Crie novos itens rapidamente</p>
            </div>
            
            {actions.map((action, index) => <Button key={index} variant="ghost" className="w-full justify-start h-auto p-3 hover:bg-accent hover:text-accent-foreground" onClick={action.onClick}>
                <div className="flex items-center gap-3 w-full">
                  <div className={`w-10 h-10 rounded-lg ${action.bgColor} flex items-center justify-center`}>
                    <action.icon className={`w-5 h-5 ${action.color}`} />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm text-foreground">{action.label}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                </div>
              </Button>)}
          </div>
        </PopoverContent>
      </Popover>
    </div>;
};