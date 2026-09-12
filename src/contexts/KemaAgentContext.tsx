import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useKemaFinanceAI, ChatMessage } from '@/hooks/useKemaFinanceAI';
import { useKemaInsights, KemaInsight, InsightModule } from '@/hooks/useKemaInsights';
import { useMetasOperacionais, MetasOperacionais } from '@/hooks/useMetasOperacionais';

const FUNCTION_URL = 'https://asxxotyratempbuxetma.supabase.co/functions/v1/kema-finance-ai';

const ROUTE_MODULE: Record<string, InsightModule> = {
  '/': 'dashboard',
  '/dashboard': 'dashboard',
  '/clientes': 'clientes',
  '/servicos': 'servicos',
  '/instalacoes': 'instalacoes',
  '/despesas': 'despesas',
  '/gastos-diarios': 'gastos',
  '/dividas': 'dividas',
  '/relatorios': 'relatorios',
};

const MODULE_LABEL: Record<InsightModule, string> = {
  dashboard: 'Visão geral',
  clientes: 'Clientes',
  servicos: 'Serviços',
  instalacoes: 'Instalações',
  despesas: 'Despesas',
  gastos: 'Gastos diários',
  dividas: 'Dívidas',
  relatorios: 'Relatórios',
};

const MODULE_SUGGESTIONS: Record<InsightModule, string[]> = {
  dashboard: [
    'Faça um diagnóstico completo da minha situação atual',
    'Quais são as 3 ações mais urgentes desta semana?',
    'Como está minha projeção de caixa para o mês?',
  ],
  clientes: [
    'Quais clientes devo priorizar para gerar mais receita?',
    'Como organizar minha carteira de clientes?',
    'Minha receita está concentrada demais em poucos clientes?',
  ],
  servicos: [
    'Como aumentar minha receita recorrente com serviços?',
    'Quais serviços estão sem pagamento e como cobrar?',
    'Como precificar melhor meus serviços?',
  ],
  instalacoes: [
    'Como organizar a agenda de instalações da semana?',
    'Quais instalações concluídas ainda não foram recebidas?',
    'Como aumentar meu ticket médio por instalação?',
  ],
  despesas: [
    'Quais despesas devo cortar primeiro?',
    'Organize meu calendário de pagamentos do mês',
    'Quanto sobra depois de pagar todas as contas?',
  ],
  gastos: [
    'Analise meus gastos diários e diga onde estou desperdiçando dinheiro',
    'Quanto eu economizaria por ano cortando meus gastos supérfluos?',
    'Monte um orçamento diário realista para eu conseguir guardar dinheiro',
    'Qual categoria de gasto está fugindo do controle?',
  ],
  dividas: [
    'Monte um plano de quitação das minhas dívidas',
    'Devo usar Avalanche ou Bola de Neve no meu caso?',
    'Vale a pena renegociar minhas dívidas agora?',
  ],
  relatorios: [
    'Analise a evolução do meu faturamento',
    'Quais tendências você identifica nos meus números?',
    'Como melhorar minha margem nos próximos meses?',
  ],
};


interface KemaAgentContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
  ask: (prompt?: string) => void;
  messages: ChatMessage[];
  isLoading: boolean;
  sendMessage: (message: string) => void;
  clearMessages: () => void;
  suggestedQuestions: string[];
  insights: KemaInsight[];
  pageInsights: KemaInsight[];
  modulo: InsightModule;
  moduloLabel: string;
  diagnostico: ReturnType<typeof useKemaFinanceAI>['diagnostico'];
  alertas: ReturnType<typeof useKemaFinanceAI>['alertas'];
  metas: MetasOperacionais;
  metasDefinidas: boolean;
  salvarMetas: (receita: number | null, custo: number | null) => void;
  pedirPlanoDeCortes: () => void;
}

const KemaAgentContext = createContext<KemaAgentContextValue | null>(null);

export const KemaAgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { diagnostico, alertas } = useKemaFinanceAI();
  const { insights, snapshot } = useKemaInsights();
  const { metas, definidas: metasDefinidas, salvarMetas } = useMetasOperacionais();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const modulo = ROUTE_MODULE[location.pathname] ?? 'dashboard';
  const pageInsights = useMemo(
    () => insights.filter(i => i.modulo === modulo),
    [insights, modulo]
  );

  const financialContext = useMemo(
    () => ({
      ...diagnostico,
      paginaAtual: MODULE_LABEL[modulo],
      rotaAtual: location.pathname,
      operacional: snapshot,
      insightsAtivos: insights.slice(0, 8).map(i => `[${i.severidade}] ${i.titulo} — ${i.descricao}`),
      historicoRecente: alertas.slice(0, 5).map(a => `${a.titulo}: ${a.mensagem}`).join(' | '),
    }),
    [diagnostico, snapshot, insights, alertas, modulo, location.pathname]
  );

  const sendMessage = useCallback(
    async (userMessage: string) => {
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMsg]);
      setIsLoading(true);

      const assistantMsgId = (Date.now() + 1).toString();

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const accessToken = session?.access_token;
        if (!accessToken) throw new Error('Você precisa estar logado para usar o KEMA AI.');

        const history = [...messages, userMsg].slice(-20).map(m => ({
          role: m.role,
          content: m.content,
        }));

        const response = await fetch(FUNCTION_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ messages: history, financialContext }),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.error || 'Erro ao comunicar com o agente');
        }
        if (!response.body) throw new Error('Resposta vazia do agente');

        setMessages(prev => [
          ...prev,
          { id: assistantMsgId, role: 'assistant', content: '', timestamp: new Date() },
        ]);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantContent = '';
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
                  prev.map(m => (m.id === assistantMsgId ? { ...m, content: assistantContent } : m))
                );
              }
            } catch {
              textBuffer = line + '\n' + textBuffer;
              break;
            }
          }
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Erro desconhecido';
        setMessages(prev => {
          const withoutEmpty = prev.filter(m => !(m.id === assistantMsgId && m.content === ''));
          return [
            ...withoutEmpty,
            {
              id: `${assistantMsgId}-err`,
              role: 'assistant' as const,
              content: `Não consegui responder agora: ${msg}. Tente novamente em instantes.`,
              timestamp: new Date(),
            },
          ];
        });
      } finally {
        setIsLoading(false);
      }
    },
    [messages, financialContext]
  );

  const ask = useCallback(
    (prompt?: string) => {
      setOpen(true);
      if (prompt) sendMessage(prompt);
    },
    [sendMessage]
  );

  const clearMessages = useCallback(() => setMessages([]), []);

  const suggestedQuestions = useMemo(() => {
    const fromInsights = pageInsights.slice(0, 2).map(i => i.pergunta);
    return Array.from(new Set([...fromInsights, ...MODULE_SUGGESTIONS[modulo]])).slice(0, 4);
  }, [pageInsights, modulo]);

  const value: KemaAgentContextValue = {
    open,
    setOpen,
    ask,
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    suggestedQuestions,
    insights,
    pageInsights,
    modulo,
    moduloLabel: MODULE_LABEL[modulo],
    diagnostico,
    alertas,
  };

  return <KemaAgentContext.Provider value={value}>{children}</KemaAgentContext.Provider>;
};

export function useKemaAgent() {
  const ctx = useContext(KemaAgentContext);
  if (!ctx) throw new Error('useKemaAgent deve ser usado dentro de KemaAgentProvider');
  return ctx;
}
