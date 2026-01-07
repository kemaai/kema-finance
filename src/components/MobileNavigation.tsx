import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Globe, 
  Scissors, 
  Receipt,
  FileText,
  CreditCard
} from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"

const menuItems = [
  { name: 'Dashboard', icon: BarChart3, path: '/' },
  { name: 'Clientes', icon: Users, path: '/clientes' },
  { name: 'Sites', icon: Globe, path: '/sites' },
  { name: 'Instalações', icon: Scissors, path: '/instalacoes' },
  { name: 'Despesas', icon: Receipt, path: '/despesas' },
  { name: 'Dívidas', icon: CreditCard, path: '/dividas' },
  { name: 'Relatórios', icon: FileText, path: '/relatorios' },
];

export const MobileNavigation = () => {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden">
      <div className="h-16 px-4">
        <Carousel
          opts={{
            align: "start",
            dragFree: true,
            containScroll: "trimSnaps",
          }}
          className="w-full h-full"
        >
          <CarouselContent className="h-full">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <CarouselItem key={item.name} className="basis-auto pl-2">
                  <NavLink
                    to={item.path}
                    className={`flex flex-col items-center justify-center gap-1 px-4 py-2 h-full min-w-[80px] transition-all duration-200 rounded-lg ${
                      isActive 
                        ? 'text-primary bg-primary/10 border border-primary/30' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                    <span className="text-xs font-medium whitespace-nowrap">{item.name}</span>
                  </NavLink>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
};
