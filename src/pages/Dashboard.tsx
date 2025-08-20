
import React from 'react';
import { DashboardCard } from '@/components/DashboardCard';
import { RevenueChart } from '@/components/RevenueChart';
import { QuickActions } from '@/components/QuickActions';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { BarChart3, Users, Globe, Wrench } from 'lucide-react';

export const Dashboard = () => {
  const { sites, clientes, instalacoes } = useSupabaseData();

  // Calculate current month and year
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
  const currentYear = currentDate.getFullYear();

  // Filter active sites for current month
  const activeSites = sites?.filter(site => {
    if (site.status !== 'Ativo') return false;
    
    const dueDate = new Date(site.data_vencimento);
    return dueDate.getMonth() + 1 === currentMonth && dueDate.getFullYear() === currentYear;
  }) || [];

  // Calculate metrics
  const totalClientes = clientes?.length || 0;
  const totalActiveSites = activeSites.length;
  const monthlyRevenue = activeSites.reduce((sum, site) => sum + site.valor, 0);
  const totalInstalacoes = instalacoes?.length || 0;
  const totalInstalacoesRevenue = instalacoes?.reduce((sum, instalacao) => sum + instalacao.valor, 0) || 0;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Apenas no desktop mostra o título, no mobile já está no header */}
      <div className="hidden md:block">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Visão geral do seu negócio</p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <DashboardCard
          title="Clientes"
          value={totalClientes.toString()}
          icon={Users}
          color="bg-blue-500"
        />
        
        <DashboardCard
          title="Sites Ativos"
          value={totalActiveSites.toString()}
          subtitle={`R$ ${monthlyRevenue.toFixed(2)}`}
          icon={Globe}
          color="bg-green-500"
        />
        
        <DashboardCard
          title="Instalações"
          value={totalInstalacoes.toString()}
          subtitle={`R$ ${totalInstalacoesRevenue.toFixed(2)}`}
          icon={Wrench}
          color="bg-purple-500"
        />
        
        <DashboardCard
          title="Relatórios"
          value="12"
          subtitle="Este mês"
          icon={BarChart3}
          color="bg-orange-500"
        />
      </div>

      {/* Charts and Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RevenueChart />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  );
};
