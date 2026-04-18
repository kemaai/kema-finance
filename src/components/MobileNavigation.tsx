import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Briefcase, 
  Scissors, 
  Receipt,
  FileText,
  CreditCard,
  Brain
} from 'lucide-react';

const menuItems = [
  { name: 'Home', icon: BarChart3, path: '/' },
  { name: 'Clientes', icon: Users, path: '/clientes' },
  { name: 'Serviços', icon: Briefcase, path: '/servicos' },
  { name: 'Instalações', icon: Scissors, path: '/instalacoes' },
  { name: 'Despesas', icon: Receipt, path: '/despesas' },
  { name: 'Dívidas', icon: CreditCard, path: '/dividas' },
  { name: 'Relatórios', icon: FileText, path: '/relatorios' },
  { name: 'KemaAI', icon: Brain, path: '/agente' },
];

export const MobileNavigation = () => {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border md:hidden">
      <div className="h-16 px-2 flex items-center overflow-x-auto scrollbar-hide">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className="flex flex-col items-center justify-center gap-1 min-w-[64px] px-2 py-1.5"
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                isActive 
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}>
                <item.icon className="w-4 h-4" />
              </div>
              <span className={`text-[10px] font-medium whitespace-nowrap ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}>{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};
