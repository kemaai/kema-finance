
import React, { useState, useEffect, useCallback } from 'react';
import { DashboardCard } from '../components/DashboardCard';
import { RevenueChart } from '../components/RevenueChart';
import { KemaAIWidget } from '../components/KemaAIWidget';
import { useServicos, useClientes, useInstalacoes, useDespesas } from '../hooks/useSupabaseData';
import { useAuth } from '../hooks/useAuth';
import { useM2Price } from '../hooks/useM2Price';
import { parseLocalDate } from '../lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { DollarSign, Briefcase, Scissors, Users, TrendingUp, Calendar, Bell, CheckCircle, Sparkles, CreditCard, AlertTriangle, RefreshCw, Clock, CalendarDays } from 'lucide-react';

type PeriodoFiltro = 'semanal' | 'quinzenal' | 'mensal';

export const Dashboard = () => {
  const { profile, user } = useAuth();
  const { price: m2Price } = useM2Price();
  const queryClient = useQueryClient();
  const { data: servicos = [], isLoading: servicosLoading, dataUpdatedAt: servicosUpdatedAt } = useServicos();
  const { data: clientes = [], isLoading: clientesLoading, dataUpdatedAt: clientesUpdatedAt } = useClientes();
  const { data: instalacoes = [], isLoading: instalacoesLoading, dataUpdatedAt: instalacoesUpdatedAt } = useInstalacoes();
  const { data: despesas = [], isLoading: despesasLoading, dataUpdatedAt: despesasUpdatedAt } = useDespesas();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [, setTick] = useState(0);
  const [periodoInstalacoes, setPeriodoInstalacoes] = useState<PeriodoFiltro>('quinzenal');

  const lastSyncTimestamp = Math.max(servicosUpdatedAt || 0, clientesUpdatedAt || 0, instalacoesUpdatedAt || 0, despesasUpdatedAt || 0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['servicos'] });
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

  // Serviços do mês atual
  const servicosDoMes = servicos.filter(s => {
    const dataServico = parseLocalDate(s.data_servico);
    return dataServico >= inicioMesAtual && dataServico <= fimMesAtual;
  });

  const servicosCount = servicosDoMes.length;
  const receitaMensalServicos = servicosDoMes.reduce((total, s) => total + Number(s.valor), 0);
  const receitaServicosPagos = servicosDoMes.filter(s => s.pago).reduce((total, s) => total + Number(s.valor), 0);

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
  const totalM2Periodo = instalacoesDoPeriodo.reduce((total, instalacao) => total + Number(instalacao.valor_total) / m2Price, 0);
  const receitaTotal = receitaMensalServicos + receitaPeriodoInstalacoes;

  const clientesAtivos = clientes.length;
  const mediaServicos = clientesAtivos > 0 ? (servicosCount / clientesAtivos).toFixed(1) : 'N/A';

  // Serviços do mês atual, agrupados por status
  const hojeMid = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const servicosPagosMes = servicosDoMes
    .filter(s => s.pago)
    .sort((a, b) => parseLocalDate(b.data_servico).getTime() - parseLocalDate(a.data_servico).getTime());
  const servicosPendentesMes = servicosDoMes
    .filter(s => !s.pago && parseLocalDate(s.data_servico) >= hojeMid)
    .sort((a, b) => parseLocalDate(a.data_servico).getTime() - parseLocalDate(b.data_servico).getTime());
  const servicosVencidosMes = servicosDoMes
    .filter(s => !s.pago && parseLocalDate(s.data_servico) < hojeMid)
    .sort((a, b) => parseLocalDate(a.data_servico).getTime() - parseLocalDate(b.data_servico).getTime());
  const totalServicosMes = servicosDoMes.length;
  const totalPagoServicosMes = servicosPagosMes.reduce((t, s) => t + Number(s.valor), 0);
  const totalPendenteServicosMes = servicosPendentesMes.reduce((t, s) => t + Number(s.valor), 0);
  const totalVencidoServicosMes = servicosVencidosMes.reduce((t, s) => t + Number(s.valor), 0);

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

  if (servicosLoading || clientesLoading || instalacoesLoading || despesasLoading) {
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
              aria-label="Atualizar dados do painel"
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
            subValue={`Serviços: R$ ${receitaMensalServicos.toFixed(0)} • Inst: R$ ${receitaPeriodoInstalacoes.toFixed(0)}`} 
            icon={DollarSign} 
            variant="green"
          />
          <DashboardCard 
            title="Serviços do Mês" 
            value={servicosCount.toString()} 
            subValue={`Pago: R$ ${receitaServicosPagos.toFixed(0)}`} 
            icon={Briefcase} 
            variant="orange"
          />
          <DashboardCard 
            title="Instalações" 
            value={instalacoesDoPeriodo.length.toString()} 
            subValue={`${totalM2Periodo.toFixed(1)} m² ${labelPeriodo}`} 
            icon={Scissors} 
            variant="orange"
          />
          <DashboardCard 
            title="Clientes" 
            value={clientesAtivos.toString()} 
            subValue={`${mediaServicos} serv./cliente`} 
            icon={Users} 
            variant="blue"
          />
          <DashboardCard 
            title="Despesas" 
            value={`R$ ${totalDespesasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
            subValue={`Pend: R$ ${totalDespesasPendentes.toFixed(0)}`} 
            icon={CreditCard} 
            variant="red"
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
          <RevenueChart servicos={servicos} instalacoes={instalacoes} despesas={despesas} />
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
                  <h3 className="text-sm font-semibold text-foreground">Serviços do Mês</h3>
                  <p className="text-xs text-muted-foreground">Mês atual</p>
                </div>
              </div>
              {totalServicosMes > 0 && (
                <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                  <span className="text-[10px] font-bold text-primary-foreground">{totalServicosMes}</span>
                </div>
              )}
            </div>
            {totalServicosMes > 0 && (
              <div className="grid grid-cols-3 gap-1.5 mb-3">
                <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
                  <div className="text-[9px] uppercase tracking-wider text-green-500 font-semibold">Pago</div>
                  <div className="text-xs font-bold text-green-500 truncate">R$ {totalPagoServicosMes.toFixed(0)}</div>
                </div>
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                  <div className="text-[9px] uppercase tracking-wider text-amber-500 font-semibold">Pendente</div>
                  <div className="text-xs font-bold text-amber-500 truncate">R$ {totalPendenteServicosMes.toFixed(0)}</div>
                </div>
                <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
                  <div className="text-[9px] uppercase tracking-wider text-red-500 font-semibold">Vencido</div>
                  <div className="text-xs font-bold text-red-500 truncate">R$ {totalVencidoServicosMes.toFixed(0)}</div>
                </div>
              </div>
            )}
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {totalServicosMes === 0 ? (
                <div className="text-center py-6">
                  <Calendar className="w-10 h-10 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">Nenhum serviço neste mês</p>
                </div>
              ) : (
                <>
                  {servicosPagosMes.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 px-1">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-green-500">Pagas ({servicosPagosMes.length})</span>
                      </div>
                      {servicosPagosMes.map(servico => (
                        <div key={servico.id} className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">{servico.cliente_nome}</div>
                            <div className="text-xs text-muted-foreground truncate">{servico.nome_servico}</div>
                          </div>
                          <div className="text-right ml-3">
                            <div className="text-sm font-bold text-green-500">R$ {Number(servico.valor).toFixed(2)}</div>
                            <div className="text-[10px] text-muted-foreground">{parseLocalDate(servico.data_servico).toLocaleDateString('pt-BR')}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {servicosPendentesMes.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 px-1">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Pendentes ({servicosPendentesMes.length})</span>
                      </div>
                      {servicosPendentesMes.map(servico => (
                        <div key={servico.id} className="flex items-center justify-between p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">{servico.cliente_nome}</div>
                            <div className="text-xs text-muted-foreground truncate">{servico.nome_servico}</div>
                          </div>
                          <div className="text-right ml-3">
                            <div className="text-sm font-bold text-amber-500">R$ {Number(servico.valor).toFixed(2)}</div>
                            <div className="text-[10px] text-muted-foreground">{parseLocalDate(servico.data_servico).toLocaleDateString('pt-BR')}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {servicosVencidosMes.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 px-1">
                        <AlertTriangle className="w-3 h-3 text-red-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">Não Pagas ({servicosVencidosMes.length})</span>
                      </div>
                      {servicosVencidosMes.map(servico => (
                        <div key={servico.id} className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">{servico.cliente_nome}</div>
                            <div className="text-xs text-muted-foreground truncate">{servico.nome_servico}</div>
                          </div>
                          <div className="text-right ml-3">
                            <div className="text-sm font-bold text-red-500">R$ {Number(servico.valor).toFixed(2)}</div>
                            <div className="text-[10px] text-muted-foreground">{parseLocalDate(servico.data_servico).toLocaleDateString('pt-BR')}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
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
        </div>
      </div>
    </div>
  );
};
