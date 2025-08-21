
import React from 'react';
import { DashboardCard } from '../components/DashboardCard';
import { RevenueChart } from '../components/RevenueChart';
import { ProfileCard } from '../components/ProfileCard';
import { QuickActions } from '../components/QuickActions';
import { useSites, useClientes, useInstalacoes, useDespesas } from '../hooks/useSupabaseData';
import { DollarSign, Globe, Scissors, Users, TrendingUp, Calendar, Bell, CheckCircle, Sparkles, CreditCard, AlertTriangle } from 'lucide-react';

export const Dashboard = () => {
  const { data: sites = [], isLoading: sitesLoading } = useSites();
  const { data: clientes = [], isLoading: clientesLoading } = useClientes();
  const { data: instalacoes = [], isLoading: instalacoesLoading } = useInstalacoes();
  const { data: despesas = [], isLoading: despesasLoading } = useDespesas();

  const hoje = new Date();
  const inicioMesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fimMesAtual = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

  // Calcular sites ativos no mês atual (status "Ativo" E que tenham vencimento no mês atual)
  const sitesAtivosMes = sites.filter(site => {
    const dataVencimento = new Date(site.data_vencimento);
    return site.status === 'Ativo' && 
           dataVencimento >= inicioMesAtual && 
           dataVencimento <= fimMesAtual;
  });

  const sitesAtivos = sitesAtivosMes.length;

  // Calcular receita mensal dos sites ativos no mês atual
  const receitaMensalSites = sitesAtivosMes
    .filter(site => site.tipo_plano.includes('assinatura') || site.hospedagem)
    .reduce((total, site) => {
      if (site.tipo_plano.includes('assinatura')) {
        return total + site.valor_mensal;
      } else if (site.hospedagem) {
        return total + 40; // Valor da hospedagem
      }
      return total;
    }, 0);

  // Calcular receita das instalações da quinzena atual
  const inicioQuinzena = hoje.getDate() <= 15 ? 1 : 16;
  const fimQuinzena = hoje.getDate() <= 15 ? 15 : new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
  
  const instalacoesDaQuinzena = instalacoes.filter(instalacao => {
    const dataInstalacao = new Date(instalacao.data_instalacao);
    const diaInstalacao = dataInstalacao.getDate();
    return dataInstalacao.getMonth() === hoje.getMonth() && 
           dataInstalacao.getFullYear() === hoje.getFullYear() && 
           diaInstalacao >= inicioQuinzena && 
           diaInstalacao <= fimQuinzena && 
           instalacao.status === 'Concluído';
  });

  const receitaQuinzenaInstalacoes = instalacoesDaQuinzena.reduce((total, instalacao) => total + instalacao.valor_total, 0);
  const totalM2Quinzena = instalacoesDaQuinzena.reduce((total, instalacao) => total + instalacao.valor_total / 20, 0);
  const receitaTotal = receitaMensalSites + receitaQuinzenaInstalacoes;

  // Estatísticas gerais
  const clientesAtivos = clientes.length;
  const mediaSites = clientesAtivos > 0 ? (sitesAtivos / clientesAtivos).toFixed(1) : 'N/A';

  // Próximos vencimentos (próximos 60 dias para melhor visualização)
  const proximosDois = new Date();
  proximosDois.setDate(proximosDois.getDate() + 60);
  const proximosVencimentos = sites.filter(site => {
    const vencimento = new Date(site.data_vencimento);
    return site.status === 'Ativo' && vencimento <= proximosDois && vencimento >= hoje;
  }).sort((a, b) => new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime()).slice(0, 5);

  // Próximas instalações (próximos 60 dias)
  const proximasInstalacoes = instalacoes.filter(instalacao => {
    const dataInstalacao = new Date(instalacao.data_instalacao);
    return instalacao.status === 'Agendado' && dataInstalacao >= hoje && dataInstalacao <= proximosDois;
  }).sort((a, b) => new Date(a.data_instalacao).getTime() - new Date(b.data_instalacao).getTime()).slice(0, 3);

  const instalacoesConcluidasMes = instalacoes.filter(instalacao => {
    const dataInstalacao = new Date(instalacao.data_instalacao);
    return instalacao.status === 'Concluído' && dataInstalacao >= inicioMesAtual && dataInstalacao <= fimMesAtual;
  }).sort((a, b) => new Date(b.data_instalacao).getTime() - new Date(a.data_instalacao).getTime()).slice(0, 3);

  const todasInstalacoes = [...proximasInstalacoes, ...instalacoesConcluidasMes];

  const despesasDoMes = despesas.filter(despesa => {
    const dataVencimento = new Date(despesa.data_vencimento);
    return dataVencimento.getMonth() === hoje.getMonth() && 
           dataVencimento.getFullYear() === hoje.getFullYear();
  });

  const totalDespesasMes = despesasDoMes.reduce((total, despesa) => total + Number(despesa.valor), 0);
  const despesasPagas = despesasDoMes.filter(despesa => despesa.paga);
  const despesasPendentes = despesasDoMes.filter(despesa => !despesa.paga);
  const totalDespesasPagas = despesasPagas.reduce((total, despesa) => total + Number(despesa.valor), 0);
  const totalDespesasPendentes = despesasPendentes.reduce((total, despesa) => total + Number(despesa.valor), 0);

  const proximasDespesas = new Date();
  proximasDespesas.setDate(proximasDespesas.getDate() + 15);
  const despesasProximasVencimento = despesas.filter(despesa => {
    const vencimento = new Date(despesa.data_vencimento);
    return !despesa.paga && vencimento <= proximasDespesas && vencimento >= hoje;
  }).sort((a, b) => new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime()).slice(0, 5);

  // Se ainda estiver carregando, mostrar loading
  if (sitesLoading || clientesLoading || instalacoesLoading || despesasLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando dados...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background with subtle pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-primary/5 to-primary/3">
          <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80"></div>
        </div>
        
        {/* Floating elements for modern touch */}
        <div className="absolute top-10 right-20 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 left-20 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
        
        <div className="relative p-6 md:p-12 pb-8 md:pb-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="space-y-6">
                {/* Welcome message with better typography */}
                <div className="space-y-3">
                  <p className="text-xl md:text-2xl font-medium text-foreground/90 leading-relaxed">
                    Bem-vindo de volta Adriano! 👋
                  </p>
                </div>
              </div>
              
              {/* Combined action card */}
              <div className="bg-white/80 backdrop-blur-sm border border-white/90 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <ProfileCard />
                  <QuickActions />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 -mt-4 md:-mt-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
          <DashboardCard 
            title="Receita Total" 
            value={`R$ ${receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
            subValue={`Sites: R$ ${receitaMensalSites.toFixed(2)} • Instalações: R$ ${receitaQuinzenaInstalacoes.toFixed(2)}`} 
            icon={DollarSign} 
            iconColor="bg-gradient-to-br from-green-500 to-green-600" 
            className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1" 
          />
          
          <DashboardCard 
            title="Sites Ativos" 
            value={sitesAtivos.toString()} 
            subValue={`${sitesAtivos} contratos ativos este mês`} 
            icon={Globe} 
            iconColor="bg-gradient-to-br from-blue-500 to-blue-600" 
            trendColor="text-blue-600" 
            className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1" 
          />
          
          <DashboardCard 
            title="Instalações" 
            value={instalacoesDaQuinzena.length.toString()} 
            subValue={`${totalM2Quinzena.toFixed(1)} m² esta quinzena`} 
            icon={Scissors} 
            iconColor="bg-gradient-to-br from-orange-500 to-orange-600" 
            className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1" 
          />
          
          <DashboardCard 
            title="Clientes" 
            value={clientesAtivos.toString()} 
            subValue={`${mediaSites} sites por cliente`} 
            icon={Users} 
            iconColor="bg-gradient-to-br from-purple-500 to-purple-600" 
            className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1" 
          />

          <DashboardCard 
            title="Despesas" 
            value={`R$ ${totalDespesasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
            subValue={`Pagas: R$ ${totalDespesasPagas.toFixed(2)} • Pendentes: R$ ${totalDespesasPendentes.toFixed(2)}`} 
            icon={CreditCard} 
            iconColor="bg-gradient-to-br from-red-500 to-red-600" 
            className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1" 
          />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground">Performance de Receita</h3>
              <p className="text-muted-foreground">Visão geral dos últimos meses</p>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">+8.2%</span>
            </div>
          </div>
          <RevenueChart sites={sites} instalacoes={instalacoes} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Próximos Vencimentos</h3>
                  <p className="text-sm text-muted-foreground">Contratos a vencer em 60 dias</p>
                </div>
              </div>
              {proximosVencimentos.length > 0 && (
                <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{proximosVencimentos.length}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {proximosVencimentos.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-muted-foreground">Nenhum contrato próximo ao vencimento</p>
                </div>
              ) : (
                proximosVencimentos.map(site => (
                  <div key={site.id} className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100 hover:bg-amber-100 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">{site.cliente_nome}</div>
                      <div className="text-sm text-muted-foreground truncate">{site.descricao_projeto}</div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-bold text-amber-700">R$ {site.valor_mensal.toFixed(2)}</div>
                      <div className="text-xs text-amber-600">
                        {new Date(site.data_vencimento).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Despesas Próximas</h3>
                  <p className="text-sm text-muted-foreground">Contas a vencer em 15 dias</p>
                </div>
              </div>
              {despesasProximasVencimento.length > 0 && (
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{despesasProximasVencimento.length}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {despesasProximasVencimento.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-muted-foreground">Nenhuma despesa próxima ao vencimento</p>
                </div>
              ) : (
                despesasProximasVencimento.map(despesa => (
                  <div key={despesa.id} className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100 hover:bg-red-100 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">{despesa.nome}</div>
                      {despesa.anotacao && (
                        <div className="text-sm text-muted-foreground truncate">{despesa.anotacao}</div>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-bold text-red-700">R$ {Number(despesa.valor).toFixed(2)}</div>
                      <div className="text-xs text-red-600">
                        {new Date(despesa.data_vencimento).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Scissors className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Instalações</h3>
                  <p className="text-sm text-muted-foreground">Agendadas e concluídas este mês</p>
                </div>
              </div>
              {todasInstalacoes.length > 0 && (
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{todasInstalacoes.length}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {todasInstalacoes.length === 0 ? (
                <div className="text-center py-8">
                  <Scissors className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-muted-foreground">Nenhuma instalação encontrada</p>
                </div>
              ) : (
                todasInstalacoes.map(instalacao => (
                  <div key={instalacao.id} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                    instalacao.status === 'Concluído' 
                      ? 'bg-green-50 border-green-100 hover:bg-green-100' 
                      : 'bg-blue-50 border-blue-100 hover:bg-blue-100'
                  }`}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {instalacao.status === 'Concluído' && (
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-foreground truncate">{instalacao.arquiteto_nome}</div>
                        <div className="text-sm text-muted-foreground truncate">{instalacao.ambiente}</div>
                        <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                          instalacao.status === 'Concluído' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {instalacao.status}
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className={`font-bold ${
                        instalacao.status === 'Concluído' ? 'text-green-700' : 'text-blue-700'
                      }`}>
                        R$ {instalacao.valor_total.toFixed(2)}
                      </div>
                      <div className={`text-xs ${
                        instalacao.status === 'Concluído' ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {new Date(instalacao.data_instalacao).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
