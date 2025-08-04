
import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { 
  Home, 
  Users, 
  Globe, 
  Wrench, 
  BarChart3, 
  Receipt,
  CreditCard,
  LogOut,
  User
} from "lucide-react"
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const navigation = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Clientes",
    url: "/clientes", 
    icon: Users,
  },
  {
    title: "Sites",
    url: "/sites",
    icon: Globe,
  },
  {
    title: "Instalações", 
    url: "/instalacoes",
    icon: Wrench,
  },
  {
    title: "Despesas",
    url: "/despesas",
    icon: Receipt,
  },
  {
    title: "Dívidas",
    url: "/dividas",
    icon: CreditCard,
  },
  {
    title: "Relatórios",
    url: "/relatorios",
    icon: BarChart3,
  }
]

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">KS</span>
          </div>
          <div>
            <h2 className="font-semibold text-lg">KS & KR</h2>
            <p className="text-xs text-muted-foreground">CRM System</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    onClick={() => navigate(item.url)}
                  >
                    <button className="flex items-center gap-2 w-full">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
            <User className="w-4 h-4" />
            <div className="flex-1 text-sm">
              <p className="font-medium">{user?.user_metadata?.full_name || user?.email}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button 
            onClick={handleSignOut}
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
