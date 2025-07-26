
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Globe, 
  Scissors, 
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { name: 'Dashboard', icon: BarChart3, path: '/' },
  { name: 'Clientes', icon: Users, path: '/clientes' },
  { name: 'Sites', icon: Globe, path: '/sites' },
  { name: 'Instalações', icon: Scissors, path: '/instalacoes' },
  { name: 'Relatórios', icon: FileText, path: '/relatorios' },
];

export const MobileNavigation = () => {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border md:hidden">
      <div className="grid grid-cols-5 h-16">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-1 px-2 py-2 transition-colors ${
                isActive 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium truncate">{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};
