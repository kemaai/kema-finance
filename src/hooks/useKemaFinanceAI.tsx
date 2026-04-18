import { useState, useMemo, useCallback } from 'react';
import { useServicos, useClientes, useInstalacoes, useDespesas, useEmprestimos, useDividasNegativadas } from './useSupabaseData';

export interface DiagnosticoFinanceiro {
  receitaTotal: number;
  receitaSites: number;
  receitaInstalacoes: number;
  despesaTotal: number;
  despesasPagas: number;
  despesasPendentes: number;
  saldoReal: number;
  percentualComprometido: number;
  scoreFinanceiro: number;
  classificacao: 'critica' | 'atencao' | 'saudavel';
  classificacaoLabel: string;
  classificacaoEmoji: string;
  totalDividas: number;
  totalEmprestimos: number;
  totalDividasNegativadas: number;
  capacidadeEconomia: number;
  metaReservaEmergencia: number;
  prazoReserva: number;
  sitesAtivos: number;
  instalacoesDoMes: number;
  totalClientes: number;
  despesasRecorrentes: number;
}

export interface Alerta {
  id: string;
  tipo: 'critico' | 'atencao' | 'info' | 'sucesso';
  titulo: string;
  mensagem: string;
  impacto?: string;
  acao?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function useKemaFinanceAI() {
  const { data: servicos = [] } = useServicos();
  const { data: clientes = [] } = useClientes();
  const { data: instalacoes = [] } = useInstalacoes();
  const { data: despesas = [] } = useDespesas();
  const { data: emprestimos = [] } = useEmprestimos();
  const { data: dividasNegativadas = [] } = useDividasNegativadas();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const hoje = new Date();
  const inicioMesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fimMesAtual = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

  // Calculate diagnostic
  const diagnostico = useMemo<DiagnosticoFinanceiro>(() => {
    // Serviços do mês (data_servico no mês atual)
    const servicosDoMes = servicos.filter(s => {
      const dataServ = new Date(s.data_servico);
      return dataServ >= inicioMesAtual && dataServ <= fimMesAtual;
    });

    const receitaSites = servicosDoMes.reduce((total, s) => total + Number(s.valor), 0);

    // Instalações do mês
    const instalacoesDoMes = instalacoes.filter(inst => {
      const dataInst = new Date(inst.data_instalacao);
      return dataInst >= inicioMesAtual && dataInst <= fimMesAtual && inst.status === 'Concluído';
    });

    const receitaInstalacoes = instalacoesDoMes.reduce((total, inst) => total + inst.valor_total, 0);
    const receitaTotal = receitaSites + receitaInstalacoes;

    // Despesas do mês
    const despesasDoMes = despesas.filter(despesa => {
      const dataVencimento = new Date(despesa.data_vencimento);
      return dataVencimento >= inicioMesAtual && dataVencimento <= fimMesAtual;
    });

    const despesaTotal = despesasDoMes.reduce((total, d) => total + Number(d.valor), 0);
    const despesasPagasTotal = despesasDoMes.filter(d => d.paga).reduce((total, d) => total + Number(d.valor), 0);
    const despesasPendentesTotal = despesasDoMes.filter(d => !d.paga).reduce((total, d) => total + Number(d.valor), 0);

    // Dívidas
    const totalEmprestimos = emprestimos.reduce((total, e) => total + e.valor_atual, 0);
    const totalDividasNegativadas = dividasNegativadas
      .filter(d => !d.pago)
      .reduce((total, d) => total + d.valor_atual, 0);
    const totalDividas = totalEmprestimos + totalDividasNegativadas;

    // Cálculos
    const saldoReal = receitaTotal - despesaTotal;
    const percentualComprometido = receitaTotal > 0 ? ((despesaTotal + (totalDividas * 0.1)) / receitaTotal) * 100 : 100;

    // Score financeiro (0-100)
    let scoreFinanceiro = 100;
    
    if (saldoReal < 0) {
      scoreFinanceiro = Math.max(0, 20 + (saldoReal / 100));
    } else if (percentualComprometido >= 80) {
      scoreFinanceiro = Math.max(0, 40 - ((percentualComprometido - 80) * 2));
    } else if (percentualComprometido >= 60) {
      scoreFinanceiro = 40 + ((80 - percentualComprometido) * 1.5);
    } else {
      scoreFinanceiro = 70 + ((60 - percentualComprometido) * 0.5);
    }

    // Penalizar por dívidas
    if (totalDividas > receitaTotal * 3) {
      scoreFinanceiro = Math.max(0, scoreFinanceiro - 20);
    } else if (totalDividas > receitaTotal) {
      scoreFinanceiro = Math.max(0, scoreFinanceiro - 10);
    }

    scoreFinanceiro = Math.min(100, Math.max(0, Math.round(scoreFinanceiro)));

    // Classificação
    let classificacao: 'critica' | 'atencao' | 'saudavel';
    let classificacaoLabel: string;
    let classificacaoEmoji: string;

    if (scoreFinanceiro <= 39) {
      classificacao = 'critica';
      classificacaoLabel = 'Crítica';
      classificacaoEmoji = '🔴';
    } else if (scoreFinanceiro <= 69) {
      classificacao = 'atencao';
      classificacaoLabel = 'Atenção';
      classificacaoEmoji = '🟡';
    } else {
      classificacao = 'saudavel';
      classificacaoLabel = 'Saudável';
      classificacaoEmoji = '🟢';
    }

    // Capacidade de economia
    const capacidadeEconomia = saldoReal > 0 ? saldoReal * 0.3 : 0;

    // Reserva de emergência
    const despesaMediaMensal = despesaTotal || 3000;
    const metaReservaEmergencia = despesaMediaMensal * 6;
    const prazoReserva = capacidadeEconomia > 0 ? Math.ceil(metaReservaEmergencia / capacidadeEconomia) : 0;

    return {
      receitaTotal,
      receitaSites,
      receitaInstalacoes,
      despesaTotal,
      despesasPagas: despesasPagasTotal,
      despesasPendentes: despesasPendentesTotal,
      saldoReal,
      percentualComprometido,
      scoreFinanceiro,
      classificacao,
      classificacaoLabel,
      classificacaoEmoji,
      totalDividas,
      totalEmprestimos,
      totalDividasNegativadas,
      capacidadeEconomia,
      metaReservaEmergencia,
      prazoReserva,
      sitesAtivos: servicosDoMes.length,
      instalacoesDoMes: instalacoesDoMes.length,
      totalClientes: clientes.length,
      despesasRecorrentes: despesasDoMes.length,
    };
  }, [servicos, clientes, instalacoes, despesas, emprestimos, dividasNegativadas, inicioMesAtual, fimMesAtual]);

  // Generate smart alerts
  const alertas = useMemo<Alerta[]>(() => {
    const alerts: Alerta[] = [];

    // Alerta de situação crítica
    if (diagnostico.classificacao === 'critica') {
      alerts.push({
        id: 'critico-score',
        tipo: 'critico',
        titulo: 'Situação Financeira Crítica',
        mensagem: `Seu score financeiro está em ${diagnostico.scoreFinanceiro}/100. É necessário tomar ações imediatas.`,
        impacto: 'Risco de endividamento crescente',
        acao: 'Revise suas despesas e considere renegociar dívidas',
      });
    }

    // Alerta de saldo negativo
    if (diagnostico.saldoReal < 0) {
      alerts.push({
        id: 'saldo-negativo',
        tipo: 'critico',
        titulo: 'Déficit Mensal',
        mensagem: `Suas despesas excedem sua receita em R$ ${Math.abs(diagnostico.saldoReal).toFixed(2)}`,
        impacto: `Prejuízo anual estimado: R$ ${(Math.abs(diagnostico.saldoReal) * 12).toFixed(2)}`,
        acao: 'Corte gastos supérfluos imediatamente',
      });
    }

    // Alerta de dívidas altas
    if (diagnostico.totalDividas > diagnostico.receitaTotal * 2) {
      alerts.push({
        id: 'dividas-altas',
        tipo: 'critico',
        titulo: 'Dívidas Elevadas',
        mensagem: `Suas dívidas (R$ ${diagnostico.totalDividas.toFixed(2)}) representam mais de 2x sua receita mensal`,
        impacto: 'Comprometimento de longo prazo',
        acao: 'Priorize a quitação de dívidas com juros mais altos',
      });
    }

    // Alerta de comprometimento alto
    if (diagnostico.percentualComprometido > 70 && diagnostico.percentualComprometido <= 100) {
      alerts.push({
        id: 'comprometimento-alto',
        tipo: 'atencao',
        titulo: 'Alto Comprometimento de Renda',
        mensagem: `${diagnostico.percentualComprometido.toFixed(1)}% da sua renda está comprometida`,
        impacto: 'Pouca margem para imprevistos',
        acao: 'Busque aumentar receitas ou reduzir despesas',
      });
    }

    // Alerta de despesas pendentes
    if (diagnostico.despesasPendentes > 0) {
      alerts.push({
        id: 'despesas-pendentes',
        tipo: 'atencao',
        titulo: 'Despesas Pendentes',
        mensagem: `Você tem R$ ${diagnostico.despesasPendentes.toFixed(2)} em despesas pendentes este mês`,
        acao: 'Planeje o pagamento para evitar juros e multas',
      });
    }

    // Alerta positivo de economia
    if (diagnostico.capacidadeEconomia > 0 && diagnostico.classificacao === 'saudavel') {
      alerts.push({
        id: 'economia-positiva',
        tipo: 'sucesso',
        titulo: 'Capacidade de Economia',
        mensagem: `Você pode economizar até R$ ${diagnostico.capacidadeEconomia.toFixed(2)} por mês`,
        impacto: `Reserva de emergência em ${diagnostico.prazoReserva} meses`,
        acao: 'Considere automatizar transferências para poupança',
      });
    }

    // Alerta de meta de reserva
    if (diagnostico.capacidadeEconomia > 0) {
      alerts.push({
        id: 'reserva-meta',
        tipo: 'info',
        titulo: 'Meta de Reserva de Emergência',
        mensagem: `Sua meta é R$ ${diagnostico.metaReservaEmergencia.toFixed(2)} (6 meses de despesas)`,
        impacto: diagnostico.prazoReserva > 0 ? `Prazo estimado: ${diagnostico.prazoReserva} meses` : 'Economize para alcançar',
      });
    }

    return alerts;
  }, [diagnostico]);

  // Financial context for AI
  const financialContext = useMemo(() => ({
    ...diagnostico,
    historicoRecente: `Últimas instalações: ${instalacoes.slice(0, 5).map(i => `${i.arquiteto_nome} - R$${i.valor_total}`).join(', ')}`,
  }), [diagnostico, instalacoes]);

  // Send message to AI
  const sendMessage = useCallback(async (userMessage: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const { data: { session } } = await (await import('@/integrations/supabase/client')).supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) {
        throw new Error('Você precisa estar logado para usar o agente de IA.');
      }

      const response = await fetch(
        `https://asxxotyratempbuxetma.supabase.co/functions/v1/kema-finance-ai`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            messages: [...messages.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: userMessage }],
            financialContext,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao comunicar com o agente');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      const assistantMsgId = (Date.now() + 1).toString();

      // Add initial empty assistant message
      setMessages(prev => [...prev, {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      }]);

      let textBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => 
                prev.map(m => 
                  m.id === assistantMsgId 
                    ? { ...m, content: assistantContent }
                    : m
                )
              );
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Desculpe, ocorreu um erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}. Por favor, tente novamente.`,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, financialContext]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const suggestedQuestions = [
    "Qual minha situação financeira atual?",
    "Como posso eliminar minhas dívidas mais rápido?",
    "Quanto devo economizar por mês?",
    "Quais gastos devo cortar primeiro?",
    "Como criar uma reserva de emergência?",
    "Qual a melhor estratégia para sair do vermelho?",
  ];

  return {
    diagnostico,
    alertas,
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    suggestedQuestions,
  };
}
