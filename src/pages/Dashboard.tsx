
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
      return total + (site.valor_mensal || 0);
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
      return total + (instalacao.valor || instalacao.valor_total || 0);
    }, 0);

  // Contar instalações da quinzena atual
  const instalacoesQuinzena = instalacoes.filter(instalacao => {
    const dataInstalacao = new Date(instalacao.data_instalacao);
    const inicioQuinzena = hoje.getDate() <= 15 ? 1 : 16;
    const fimQuinzena = hoje.getDate() <= 15 ? 15 : new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
    const inicioQuinzenaDate = new Date(hoje.getFullYear(), hoje.getMonth(), inicioQuinzena);
    const fimQuinzenaDate = new Date(hoje.getFullYear(), hoje.getMonth(), fimQuinzena);
    
    return dataInstalacao >= inicioQuinzenaDate && dataInstalacao <= fimQuinzenaDate;
  }).length;

  // Calcular despesas do mês
  const despesasMes = despesas
    .filter(despesa => {
      const dataDespesa = new Date(despesa.data_despesa || despesa.data_vencimento);
      return dataDespesa >= inicioMesAtual && dataDespesa <= fimMesAtual;
    })
    .reduce((total, despesa) => {
      return total + (despesa.valor || 0);
    }, 0);

  // Calcular total de clientes
  const totalClientes = clientes.length;

  // Calcular valor total em empréstimos
  const valorTotalEmprestimos = emprestimos.reduce((total, emprestimo) => {
    return total + (emprestimo.valor_emprestimo || emprestimo.valor_atual || emprestimo.valor_original || 0);
  }, 0);

  // Calcular valor total em dívidas negativadas
  const valorTotalDividas = dividasNegativadas.reduce((total, divida) => {
    return total + (divida.valor_divida || divida.valor_atual || divida.valor_original || 0);
  }, 0);

  const receitaTotalMensal = receitaMensalSites + receitaInstalacoes;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Compact Header Section */}
        <div className="relative bg-gradient-to-r from-primary/5 via-primary/10 to-accent/5 border-b border-border/50">
          <div className="p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-primary" />
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    Dashboard
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    Visão geral do seu negócio
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <DashboardCard
                title="Clientes"
                value={totalClientes.toString()}
                icon={Users}
                iconColor="bg-gradient-to-r from-blue-500 to-blue-600"
                className="bg-white/95 dark:bg-slate-800/95 border-0 shadow-sm hover:shadow-md transition-all duration-300"
              />

              <DashboardCard
                title="Sites Ativos"
                value={sitesAtivos.toString()}
                icon={Globe}
                iconColor="bg-gradient-to-r from-green-500 to-emerald-600"
                className="bg-white/95 dark:bg-slate-800/95 border-0 shadow-sm hover:shadow-md transition-all duration-300"
              />

              <DashboardCard
                title="Instalações"
                value={instalacoesQuinzena.toString()}
                subValue="(Quinzena)"
                icon={Wrench}
                iconColor="bg-gradient-to-r from-orange-500 to-amber-600"
                className="bg-white/95 dark:bg-slate-800/95 border-0 shadow-sm hover:shadow-md transition-all duration-300"
              />

              <DashboardCard
                title="Receita Sites"
                value={`R$ ${receitaMensalSites.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon={DollarSign}
                iconColor="bg-gradient-to-r from-purple-500 to-violet-600"
                className="bg-white/95 dark:bg-slate-800/95 border-0 shadow-sm hover:shadow-md transition-all duration-300"
              />

              <DashboardCard
                title="Receita Instalações"
                value={`R$ ${receitaInstalacoes.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon={TrendingUp}
                iconColor="bg-gradient-to-r from-teal-500 to-cyan-600"
                className="bg-white/95 dark:bg-slate-800/95 border-0 shadow-sm hover:shadow-md transition-all duration-300"
              />

              <DashboardCard
                title="Receita Total"
                value={`R$ ${receitaTotalMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon={DollarSign}
                iconColor="bg-gradient-to-r from-rose-500 to-pink-600"
                className="bg-white/95 dark:bg-slate-800/95 border-0 shadow-sm hover:shadow-md transition-all duration-300"
              />
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/95 dark:bg-slate-800/95 rounded-xl p-4 border-0 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground">Despesas do Mês</h3>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="text-xl font-bold text-foreground">
                  R$ {despesasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              <div className="bg-white/95 dark:bg-slate-800/95 rounded-xl p-4 border-0 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground">Empréstimos</h3>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="text-xl font-bold text-foreground">
                  R$ {valorTotalEmprestimos.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              <div className="bg-white/95 dark:bg-slate-800/95 rounded-xl p-4 border-0 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground">Dívidas Negativadas</h3>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="text-xl font-bold text-foreground">
                  R$ {valorTotalDividas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Chart and Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white/95 dark:bg-slate-800/95 rounded-xl p-6 border-0 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-foreground mb-1">Receita Mensal</h3>
                    <p className="text-muted-foreground text-sm">Evolução das receitas ao longo do tempo</p>
                  </div>
                  <RevenueChart />
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white/95 dark:bg-slate-800/95 rounded-xl p-6 border-0 shadow-sm hover:shadow-md transition-all duration-300 h-full">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-foreground mb-1">Ações Rápidas</h3>
                    <p className="text-muted-foreground text-sm">Acesso rápido às principais funcionalidades</p>
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
