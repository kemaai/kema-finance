import React from 'react';
import { Layout } from '@/components/Layout';
import { DashboardCard } from '@/components/DashboardCard';
import { RevenueChart } from '@/components/RevenueChart';
import { QuickActions } from '@/components/QuickActions';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { Users, Globe, Wrench, DollarSign, TrendingUp, Calendar } from 'lucide-react';

export const Dashboard = () => {
  const { sites, clientes, instalacoes, despesas, emprestimos, dividasNegativadas } = useSupabaseData();
  
  const hoje = new Date();
  const inicioMesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fimMesAtual = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

  // Calcular sites ativos (apenas status "Ativo")
  const sitesAtivos = sites.filter(site => site.status === 'Ativo').length;

  // Calcular receita mensal dos sites ativos
  const receitaMensalSites = sites
    .filter(site => site.status === 'Ativo')
    .reduce((total, site) => {
      return total + site.valor_mensal;
    }, 0);

  // Calcular receita das instalações da quinzena atual
  const receitaInstalacoes = instalacoes
    .filter(instalacao => {
      const dataInstalacao = new Date(instalacao.data_instalacao);
      const inicioQuinzena = hoje.getDate() <= 15 ? 1 : 16;
      const fimQuinzena = hoje.getDate() <= 15 ? 15 : new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
      const inicioQuinzenaDate = new Date(hoje.getFullYear(), hoje.getMonth(), inicioQuinzena);
      const fimQuinzenaDate = new Date(hoje.getFullYear(), hoje.getMonth(), fimQuinzena);
      
      return dataInstalacao >= inicioQuinzenaDate && dataInstalacao <= fimQuinzenaDate;
    })
    .reduce((total, instalacao) => {
      return total + instalacao.valor;
    }, 0);

  // Calcular despesas do mês
  const despesasMes = despesas
    .filter(despesa => {
      const dataDespesa = new Date(despesa.data_despesa);
      return dataDespesa >= inicioMesAtual && dataDespesa <= fimMesAtual;
    })
    .reduce((total, despesa) => {
      return total + despesa.valor;
    }, 0);

  // Calcular total de clientes
  const totalClientes = clientes.length;

  // Calcular valor total em empréstimos
  const valorTotalEmprestimos = emprestimos.reduce((total, emprestimo) => {
    return total + emprestimo.valor_emprestimo;
  }, 0);

  // Calcular valor total em dívidas negativadas
  const valorTotalDividas = dividasNegativadas.reduce((total, divida) => {
    return total + divida.valor_divida;
  }, 0);

  const receitaTotalMensal = receitaMensalSites + receitaInstalacoes;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Hero Header Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-primary/5 via-primary/10 to-accent/5 border-b border-border/50">
          <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
          <div className="relative p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-muted-foreground text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Visão geral do seu negócio
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6">
              <div className="lg:col-span-1">
                <DashboardCard
                  title="Clientes Ativos"
                  value={totalClientes.toString()}
                  icon={Users}
                  iconColor="bg-gradient-to-r from-blue-500 to-blue-600"
                  className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-800 dark:to-blue-900/20"
                />
              </div>

              <div className="lg:col-span-1">
                <DashboardCard
                  title="Sites Ativos"
                  value={sitesAtivos.toString()}
                  icon={Globe}
                  iconColor="bg-gradient-to-r from-green-500 to-emerald-600"
                  className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-green-50/30 dark:from-slate-800 dark:to-green-900/20"
                />
              </div>

              <div className="lg:col-span-1">
                <DashboardCard
                  title="Instalações (Quinzena)"
                  value={instalacoes.filter(instalacao => {
                    const dataInstalacao = new Date(instalacao.data_instalacao);
                    const inicioQuinzena = hoje.getDate() <= 15 ? 1 : 16;
                    const fimQuinzena = hoje.getDate() <= 15 ? 15 : new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
                    const inicioQuinzenaDate = new Date(hoje.getFullYear(), hoje.getMonth(), inicioQuinzena);
                    const fimQuinzenaDate = new Date(hoje.getFullYear(), hoje.getMonth(), fimQuinzena);
                    
                    return dataInstalacao >= inicioQuinzenaDate && dataInstalacao <= fimQuinzenaDate;
                  }).length.toString()}
                  icon={Wrench}
                  iconColor="bg-gradient-to-r from-orange-500 to-amber-600"
                  className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-orange-50/30 dark:from-slate-800 dark:to-orange-900/20"
                />
              </div>

              <div className="lg:col-span-1">
                <DashboardCard
                  title="Receita Sites"
                  value={`R$ ${receitaMensalSites.toFixed(2)}`}
                  icon={DollarSign}
                  iconColor="bg-gradient-to-r from-purple-500 to-violet-600"
                  className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-purple-50/30 dark:from-slate-800 dark:to-purple-900/20"
                />
              </div>

              <div className="lg:col-span-1">
                <DashboardCard
                  title="Receita Instalações"
                  value={`R$ ${receitaInstalacoes.toFixed(2)}`}
                  icon={TrendingUp}
                  iconColor="bg-gradient-to-r from-teal-500 to-cyan-600"
                  className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-teal-50/30 dark:from-slate-800 dark:to-teal-900/20"
                />
              </div>

              <div className="lg:col-span-1">
                <DashboardCard
                  title="Receita Total"
                  value={`R$ ${receitaTotalMensal.toFixed(2)}`}
                  icon={DollarSign}
                  iconColor="bg-gradient-to-r from-rose-500 to-pink-600"
                  trend={`+${((receitaTotalMensal / (receitaTotalMensal - 1000)) * 100 - 100).toFixed(1)}%`}
                  trendColor="text-green-600 dark:text-green-400"
                  className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-rose-50/30 dark:from-slate-800 dark:to-rose-900/20"
                />
              </div>
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-800 dark:to-slate-700/50 rounded-2xl p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Despesas do Mês</h3>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center shadow-sm">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground">R$ {despesasMes.toFixed(2)}</div>
              </div>

              <div className="bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-800 dark:to-slate-700/50 rounded-2xl p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Empréstimos Ativos</h3>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center shadow-sm">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground">R$ {valorTotalEmprestimos.toFixed(2)}</div>
              </div>

              <div className="bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-800 dark:to-slate-700/50 rounded-2xl p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Dívidas Negativadas</h3>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center shadow-sm">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground">R$ {valorTotalDividas.toFixed(2)}</div>
              </div>
            </div>

            {/* Chart and Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-800 dark:to-slate-700/50 rounded-2xl p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2">Receita Mensal</h3>
                    <p className="text-muted-foreground">Evolução das receitas ao longo do tempo</p>
                  </div>
                  <RevenueChart />
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-800 dark:to-slate-700/50 rounded-2xl p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2">Ações Rápidas</h3>
                    <p className="text-muted-foreground">Acesso rápido às principais funcionalidades</p>
                  </div>
                  <QuickActions />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
