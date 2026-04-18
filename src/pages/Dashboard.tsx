
import React, { useState, useEffect, useCallback } from 'react';
import { DashboardCard } from '../components/DashboardCard';
import { RevenueChart } from '../components/RevenueChart';
import { KemaAIWidget } from '../components/KemaAIWidget';
import { useSites, useClientes, useInstalacoes, useDespesas } from '../hooks/useSupabaseData';
import { useAuth } from '../hooks/useAuth';
import { parseLocalDate } from '../lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { DollarSign, Globe, Scissors, Users, TrendingUp, Calendar, Bell, CheckCircle, Sparkles, CreditCard, AlertTriangle, RefreshCw, Clock, CalendarDays } from 'lucide-react';

type PeriodoFiltro = 'semanal' | 'quinzenal' | 'mensal';

export const Dashboard = () => {
  const { profile, user } = useAuth();
  const queryClient = useQueryClient();
  const { data: sites = [], isLoading: sitesLoading, dataUpdatedAt: sitesUpdatedAt } = useSites();
  const { data: clientes = [], isLoading: clientesLoading, dataUpdatedAt: clientesUpdatedAt } = useClientes();
  const { data: instalacoes = [], isLoading: instalacoesLoading, dataUpdatedAt: instalacoesUpdatedAt } = useInstalacoes();
  const { data: despesas = [], isLoading: despesasLoading, dataUpdatedAt: despesasUpdatedAt } = useDespesas();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [, setTick] = useState(0);
  const [periodoInstalacoes, setPeriodoInstalacoes] = useState<PeriodoFiltro>('quinzenal');

  const lastSyncTimestamp = Math.max(sitesUpdatedAt || 0, clientesUpdatedAt || 0, instalacoesUpdatedAt || 0, despesasUpdatedAt || 0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['sites'] });
    await queryClient.invalidateQueries({ queryKey: ['clientes'] });
    await queryClient.invalidateQueries({ queryKey: ['instalacoes'] });
    await queryClient.invalidateQueries({ queryKey: ['despesas'] });
    setTimeout(() => setIsRefreshing(false), 800);
  }, [queryClient]);

  const formatRelativeTime = (timestamp: number) => {
    if (!timestamp) return 'Nunca';
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 10) return 'Agora mesmo';
    if (diff < 60) return `${diff}s atrás`;
    if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
    return new Date(timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const hoje = new Date();
  const inicioMesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fimMesAtual = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

  const sitesAtivosMes = sites.filter(site => {
    const dataVencimento = new Date(site.data_vencimento);
    return site.status === 'Ativo' && dataVencimento >= inicioMesAtual && dataVencimento <= fimMesAtual;
  });

  const sitesAtivos = sitesAtivosMes.length;

  const receitaMensalSites = sitesAtivosMes
    .filter(site => site.tipo_plano.includes('assinatura') || site.hospedagem)
    .reduce((total, site) => {
      if (site.tipo_plano.includes('assinatura')) return total + site.valor_mensal;
      if (site.hospedagem) return total + 40;
      return total;
    }, 0);

  const getInstalacoesPeriodo = () => {
    const now = new Date();
    let inicio: Date, fim: Date, label: string;
    if (periodoInstalacoes === 'semanal') {
      const dayOfWeek = now.getDay();
      const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      inicio = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday);
      fim = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + 6);
      label = 'esta semana';
    } else if (periodoInstalacoes === 'quinzenal') {
      const inicioQ = now.getDate() <= 15 ? 1 : 16;
      const fimQ = now.getDate() <= 15 ? 15 : new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      inicio = new Date(now.getFullYear(), now.getMonth(), inicioQ);
      fim = new Date(now.getFullYear(), now.getMonth(), fimQ);
      label = 'esta quinzena';
    } else {
      inicio = new Date(now.getFullYear(), now.getMonth(), 1);
      fim = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      label = 'este mês';
    }
    return { inicio, fim, label };
  };

  const { inicio: inicioPeriodo, fim: fimPeriodo, label: labelPeriodo } = getInstalacoesPeriodo();

  const instalacoesDoPeriodo = instalacoes.filter(instalacao => {
    const dataInstalacao = parseLocalDate(instalacao.data_instalacao);
    return dataInstalacao >= inicioPeriodo && dataInstalacao <= fimPeriodo && instalacao.status === 'Concluído';
  });

  const receitaPeriodoInstalacoes = instalacoesDoPeriodo.reduce((total, instalacao) => total + Number(instalacao.valor_total), 0);
  const totalM2Periodo = instalacoesDoPeriodo.reduce((total, instalacao) => total + Number(instalacao.valor_total) / 24, 0);
  const receitaTotal = receitaMensalSites + receitaPeriodoInstalacoes;

  const clientesAtivos = clientes.length;
  const mediaSites = clientesAtivos > 0 ? (sitesAtivos / clientesAtivos).toFixed(1) : 'N/A';

  const proximosDois = new Date();
  proximosDois.setDate(proximosDois.getDate() + 60);
  const proximosVencimentos = sites.filter(site => {
    const vencimento = new Date(site.data_vencimento);
    return site.status === 'Ativo' && vencimento <= proximosDois && vencimento >= hoje;
  }).sort((a, b) => new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime()).slice(0, 5);

  // Instalações do mês atual (Concluído ou Agendado), separadas por pedido_recebido
  const instalacoesMesTodas = instalacoes.filter(instalacao => {
    const dataInstalacao = parseLocalDate(instalacao.data_instalacao);
    return (
      (instalacao.status === 'Concluído' || instalacao.status === 'Agendado') &&
      dataInstalacao >= inicioMesAtual &&
      dataInstalacao <= fimMesAtual
    );
  });
  const instalacoesPagasMes = instalacoesMesTodas
    .filter(i => i.pedido_recebido)
    .sort((a, b) => parseLocalDate(b.data_instalacao).getTime() - parseLocalDate(a.data_instalacao).getTime());
  const instalacoesNaoPagasMes = instalacoesMesTodas
    .filter(i => !i.pedido_recebido)
    .sort((a, b) => parseLocalDate(b.data_instalacao).getTime() - parseLocalDate(a.data_instalacao).getTime());
  const totalInstalacoesMes = instalacoesMesTodas.length;

  const despesasDoMes = despesas.filter(despesa => {
    const dataVencimento = new Date(despesa.data_vencimento);
    return dataVencimento.getMonth() === hoje.getMonth() && dataVencimento.getFullYear() === hoje.getFullYear();
  });

  const totalDespesasMes = despesasDoMes.reduce((total, despesa) => total + Number(despesa.valor), 0);
  const despesasPagas = despesasDoMes.filter(despesa => despesa.paga);
  const despesasPendentes = despesasDoMes.filter(despesa => !despesa.paga);
  const totalDespesasPagas = despesasPagas.reduce((total, despesa) => total + Number(despesa.valor), 0);
  const totalDespesasPendentes = despesasPendentes.reduce((total, despesa) => total + Number(despesa.valor), 0);

  // Despesas não pagas do mês atual, separadas em vencidas e a vencer
  const hojeMidnight = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const despesasVencidasMes = despesasPendentes
    .filter(d => parseLocalDate(d.data_vencimento) < hojeMidnight)
    .sort((a, b) => parseLocalDate(a.data_vencimento).getTime() - parseLocalDate(b.data_vencimento).getTime());
  const despesasAVencerMes = despesasPendentes
    .filter(d => parseLocalDate(d.data_vencimento) >= hojeMidnight)
    .sort((a, b) => parseLocalDate(a.data_vencimento).getTime() - parseLocalDate(b.data_vencimento).getTime());
  const totalDespesasNaoPagasMes = despesasPendentes.length;

  if (sitesLoading || clientesLoading || instalacoesLoading || despesasLoading) {
    return (
      <div className="min-h-screen bg-background">
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
    <div className="min-h-screen bg-background">
      {/* Hero Section - Clean */}
      <div className="p-4 md:p-8 pb-2 md:pb-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-lg md:text-xl font-semibold text-foreground">
                Olá, {profile?.first_name || 'Usuário'}! 👋
              </p>
              <p className="text-sm text-muted-foreground">Aqui está o resumo do seu negócio</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/60 hover:bg-muted border border-border text-xs text-muted-foreground hover:text-foreground transition-all self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <Clock className="w-3 h-3" />
              <span>{isRefreshing ? 'Atualizando...' : formatRelativeTime(lastSyncTimestamp)}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-8 space-y-6">
        {/* Period filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <CalendarDays className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground mr-1">Período:</span>
          {(['semanal', 'quinzenal', 'mensal'] as PeriodoFiltro[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriodoInstalacoes(p)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                periodoInstalacoes === p
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground border border-border'
              }`}
            >
              {p === 'semanal' ? 'Semanal' : p === 'quinzenal' ? 'Quinzenal' : 'Mensal'}
            </button>
          ))}
        </div>

        {/* Cards grid - 2x2 on mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
          <DashboardCard 
            title="Receita Total" 
            value={`R$ ${receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
            subValue={`Sites: R$ ${receitaMensalSites.toFixed(0)} • Inst: R$ ${receitaPeriodoInstalacoes.toFixed(0)}`} 
            icon={DollarSign} 
            iconColor="bg-gradient-to-br from-green-500 to-green-600" 
          />
          <DashboardCard 
            title="Sites Ativos" 
            value={sitesAtivos.toString()} 
            subValue={`${sitesAtivos} contratos ativos`} 
            icon={Globe} 
            iconColor="bg-gradient-to-br from-blue-500 to-blue-600" 
          />
          <DashboardCard 
            title="Instalações" 
            value={instalacoesDoPeriodo.length.toString()} 
            subValue={`${totalM2Periodo.toFixed(1)} m² ${labelPeriodo}`} 
            icon={Scissors} 
            iconColor="bg-gradient-to-br from-primary to-accent" 
          />
          <DashboardCard 
            title="Clientes" 
            value={clientesAtivos.toString()} 
            subValue={`${mediaSites} sites/cliente`} 
            icon={Users} 
            iconColor="bg-gradient-to-br from-purple-500 to-purple-600" 
          />
          <DashboardCard 
            title="Despesas" 
            value={`R$ ${totalDespesasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
            subValue={`Pend: R$ ${totalDespesasPendentes.toFixed(0)}`} 
            icon={CreditCard} 
            iconColor="bg-gradient-to-br from-red-500 to-red-600" 
            className="col-span-2 lg:col-span-1"
          />
        </div>

        {/* KemaFinance AI Widget */}
        <KemaAIWidget />

        {/* Revenue Chart */}
        <div className="card-tech p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base md:text-lg font-semibold text-foreground">Performance de Receita</h3>
              <p className="text-sm text-muted-foreground">Últimos meses</p>
            </div>
            <div className="flex items-center gap-2 text-green-500">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">+8.2%</span>
            </div>
          </div>
          <RevenueChart sites={sites} instalacoes={instalacoes} />
        </div>

        {/* Three columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Vencimentos */}
          <div className="card-tech p-4 md:p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-amber-500/15 rounded-xl flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Vencimentos</h3>
                  <p className="text-xs text-muted-foreground">Próximos 60 dias</p>
                </div>
              </div>
              {proximosVencimentos.length > 0 && (
                <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                  <span className="text-[10px] font-bold text-primary-foreground">{proximosVencimentos.length}</span>
                </div>
              )}
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {proximosVencimentos.length === 0 ? (
                <div className="text-center py-6">
                  <Calendar className="w-10 h-10 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">Nenhum vencimento próximo</p>
                </div>
              ) : (
                proximosVencimentos.map(site => (
                  <div key={site.id} className="flex items-center justify-between p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">{site.cliente_nome}</div>
                      <div className="text-xs text-muted-foreground truncate">{site.descricao_projeto}</div>
                    </div>
                    <div className="text-right ml-3">
                      <div className="text-sm font-bold text-amber-500">R$ {site.valor_mensal.toFixed(2)}</div>
                      <div className="text-[10px] text-muted-foreground">{new Date(site.data_vencimento).toLocaleDateString('pt-BR')}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Despesas */}
          <div className="card-tech p-4 md:p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-red-500/15 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Despesas Próximas</h3>
                  <p className="text-xs text-muted-foreground">Mês atual</p>
                </div>
              </div>
              {totalDespesasNaoPagasMes > 0 && (
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-[10px] font-bold text-primary-foreground">{totalDespesasNaoPagasMes}</span>
                </div>
              )}
            </div>
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {totalDespesasNaoPagasMes === 0 ? (
                <div className="text-center py-6">
                  <CreditCard className="w-10 h-10 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">Nenhuma despesa pendente</p>
                </div>
              ) : (
                <>
                  {despesasVencidasMes.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-red-500">Vencidas ({despesasVencidasMes.length})</p>
                      {despesasVencidasMes.map(despesa => (
                        <div key={despesa.id} className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">{despesa.nome}</div>
                            {despesa.anotacao && <div className="text-xs text-muted-foreground truncate">{despesa.anotacao}</div>}
                          </div>
                          <div className="text-right ml-3">
                            <div className="text-sm font-bold text-red-500">R$ {Number(despesa.valor).toFixed(2)}</div>
                            <div className="text-[10px] text-muted-foreground">{parseLocalDate(despesa.data_vencimento).toLocaleDateString('pt-BR')}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {despesasAVencerMes.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">A vencer ({despesasAVencerMes.length})</p>
                      {despesasAVencerMes.map(despesa => (
                        <div key={despesa.id} className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/30">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">{despesa.nome}</div>
                            {despesa.anotacao && <div className="text-xs text-muted-foreground truncate">{despesa.anotacao}</div>}
                          </div>
                          <div className="text-right ml-3">
                            <div className="text-sm font-bold text-primary">R$ {Number(despesa.valor).toFixed(2)}</div>
                            <div className="text-[10px] text-muted-foreground">{parseLocalDate(despesa.data_vencimento).toLocaleDateString('pt-BR')}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Instalações */}
          <div className="card-tech p-4 md:p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-blue-500/15 rounded-xl flex items-center justify-center">
                  <Scissors className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Instalações</h3>
                  <p className="text-xs text-muted-foreground">Mês atual</p>
                </div>
              </div>
              {totalInstalacoesMes > 0 && (
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-[10px] font-bold text-primary-foreground">{totalInstalacoesMes}</span>
                </div>
              )}
            </div>
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {totalInstalacoesMes === 0 ? (
                <div className="text-center py-6">
                  <Scissors className="w-10 h-10 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">Nenhuma instalação no mês</p>
                </div>
              ) : (
                <>
                  {instalacoesPagasMes.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-green-500">Pagas ({instalacoesPagasMes.length})</p>
                      {instalacoesPagasMes.map(instalacao => (
                        <div key={instalacao.id} className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-foreground truncate">{instalacao.arquiteto_nome}</div>
                              <div className="text-xs text-muted-foreground truncate">{instalacao.ambiente}</div>
                            </div>
                          </div>
                          <div className="text-right ml-3">
                            <div className="text-sm font-bold text-green-500">R$ {Number(instalacao.valor_total).toFixed(2)}</div>
                            <div className="text-[10px] text-muted-foreground">{parseLocalDate(instalacao.data_instalacao).toLocaleDateString('pt-BR')}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {instalacoesNaoPagasMes.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">Não pagas ({instalacoesNaoPagasMes.length})</p>
                      {instalacoesNaoPagasMes.map(instalacao => (
                        <div key={instalacao.id} className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/30">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-foreground truncate">{instalacao.arquiteto_nome}</div>
                              <div className="text-xs text-muted-foreground truncate">{instalacao.ambiente}</div>
                            </div>
                          </div>
                          <div className="text-right ml-3">
                            <div className="text-sm font-bold text-primary">R$ {Number(instalacao.valor_total).toFixed(2)}</div>
                            <div className="text-[10px] text-muted-foreground">{parseLocalDate(instalacao.data_instalacao).toLocaleDateString('pt-BR')}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
