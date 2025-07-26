
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Globe, 
  Scissors, 
  FileText,
  User
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', icon: BarChart3, path: '/' },
  { name: 'Clientes', icon: Users, path: '/clientes' },
  { name: 'Sites', icon: Globe, path: '/sites' },
  { name: 'Instalações', icon: Scissors, path: '/instalacoes' },
  { name: 'Relatórios', icon: FileText, path: '/relatorios' },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="w-80 bg-white border-r border-border h-screen fixed left-0 top-0 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral do negócio</p>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-sm">KS & KR</p>
            <p className="text-muted-foreground text-xs">Proprietário</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-50 text-blue-600 font-medium' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Navigation Icons */}
      <div className="p-4 border-t border-border">
        <div className="flex justify-around">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={`p-2 rounded-lg ${
                  isActive ? 'text-blue-600' : 'text-muted-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" />
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
};
