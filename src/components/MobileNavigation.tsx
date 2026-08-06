import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Briefcase, 
  Scissors, 
  Receipt,
  FileText,
  CreditCard,
  Brain,
  User,
  Settings
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
  { name: 'Perfil', icon: User, path: '/perfil' },
  { name: 'Config', icon: Settings, path: '/configuracoes' },
];

export const MobileNavigation = () => {
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(true);

  const updateFades = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeftFade(el.scrollLeft > 4);
    setShowRightFade(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateFades();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateFades, { passive: true });
    window.addEventListener('resize', updateFades);
    return () => {
      el.removeEventListener('scroll', updateFades);
      window.removeEventListener('resize', updateFades);
    };
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1">
      <div className="relative rounded-3xl border border-border/70 bg-card/85 backdrop-blur-xl shadow-elev-2 overflow-hidden">
        {/* Left fade indicator */}
        <div
          className={`pointer-events-none absolute left-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-r from-card to-transparent transition-opacity duration-200 ${
            showLeftFade ? 'opacity-100' : 'opacity-0'
          }`}
        />
        {/* Right fade indicator */}
        <div
          className={`pointer-events-none absolute right-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-l from-card to-transparent transition-opacity duration-200 ${
            showRightFade ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div
          ref={scrollRef}
          className="h-[68px] px-1.5 flex items-center overflow-x-auto scrollbar-hide"
        >
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const slug = item.path === '/' ? 'home' : item.path.replace(/^\//, '');
            return (
              <NavLink
                key={item.name}
                to={item.path}
                data-testid={`nav-${slug}`}
                aria-label={item.name}
                className="group flex flex-col items-center justify-center gap-1 flex-shrink-0 w-[20%] min-w-[20%] px-1 py-1.5"
              >
                <div className={`w-10 h-9 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-glow-primary scale-105'
                    : 'text-muted-foreground group-active:scale-95 group-hover:text-foreground group-hover:bg-muted/60'
                }`}>
                  <item.icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.4 : 2} />
                </div>
                <span className={`text-[10px] whitespace-nowrap transition-colors ${
                  isActive ? 'text-primary font-semibold' : 'text-muted-foreground font-medium'
                }`}>{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
};
