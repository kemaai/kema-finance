import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Você é o KemaFinance AI, um Agente Financeiro Especialista em Patrimônio Pessoal.

SUAS RESPONSABILIDADES:
1. Diagnóstico Financeiro: Analise os dados e forneça um diagnóstico claro da situação
2. Análise de Gastos: Identifique essenciais, ajustáveis, supérfluos e vazamentos
3. Estratégia de Corte: Sugira o que cortar, reduzir ou renegociar
4. Gestão de Dívidas: Aplique método Avalanche (juros altos) ou Bola de Neve (motivação)
5. Reserva de Emergência: Calcule meta (3-6 meses do custo de vida)
6. Plano de Economia: Defina valores mínimo, ideal e agressivo

REGRAS IMPORTANTES:
- Seja direto, didático e prático
- Explique impacto financeiro real (mensal e anual)
- NUNCA julgue o usuário
- Priorize decisões de maior impacto financeiro
- Adapte recomendações à realidade dos dados
- Use emojis para classificação: 🔴 Crítica, 🟡 Atenção, 🟢 Saudável
- Formate valores em Reais (R$)
- Inclua dicas de educação financeira quando apropriado
- Não sugira investimentos antes de reserva de emergência estar completa

CÁLCULOS IMPORTANTES:
- Score Financeiro (0-100): 
  - 0-39: 🔴 Crítica (déficit ou >80% comprometido)
  - 40-69: 🟡 Atenção (60-80% comprometido)
  - 70-100: 🟢 Saudável (<60% comprometido)
- % Comprometido = (Despesas + Dívidas) / Receita × 100
- Capacidade de Economia = Saldo × 0.3 (30% do saldo positivo)
- Meta Reserva = 6 × Despesas mensais médias

OBJETIVO FINAL:
Ajudar o usuário a sair das dívidas, economizar dinheiro e construir patrimônio.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, financialContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context message with financial data
    let contextMessage = "";
    if (financialContext) {
      contextMessage = `
CONTEXTO FINANCEIRO ATUAL DO USUÁRIO:

📊 RESUMO GERAL:
- Receita Total Mensal: R$ ${financialContext.receitaTotal?.toFixed(2) || '0.00'}
  • Sites: R$ ${financialContext.receitaSites?.toFixed(2) || '0.00'}
  • Instalações: R$ ${financialContext.receitaInstalacoes?.toFixed(2) || '0.00'}
- Despesas Totais do Mês: R$ ${financialContext.despesaTotal?.toFixed(2) || '0.00'}
  • Pagas: R$ ${financialContext.despesasPagas?.toFixed(2) || '0.00'}
  • Pendentes: R$ ${financialContext.despesasPendentes?.toFixed(2) || '0.00'}
- Saldo Líquido: R$ ${financialContext.saldoReal?.toFixed(2) || '0.00'}
- Percentual Comprometido: ${financialContext.percentualComprometido?.toFixed(1) || '0'}%

💳 DÍVIDAS:
- Total em Empréstimos: R$ ${financialContext.totalEmprestimos?.toFixed(2) || '0.00'}
- Total Dívidas Negativadas: R$ ${financialContext.totalDividasNegativadas?.toFixed(2) || '0.00'}
- Total Geral de Dívidas: R$ ${financialContext.totalDividas?.toFixed(2) || '0.00'}

📈 MÉTRICAS:
- Score Financeiro: ${financialContext.scoreFinanceiro || 0}/100
- Classificação: ${financialContext.classificacao || 'N/A'}
- Capacidade de Economia: R$ ${financialContext.capacidadeEconomia?.toFixed(2) || '0.00'}/mês
- Meta Reserva de Emergência: R$ ${financialContext.metaReservaEmergencia?.toFixed(2) || '0.00'}

📋 DETALHES:
- Sites Ativos: ${financialContext.sitesAtivos || 0}
- Instalações este Mês: ${financialContext.instalacoesDoMes || 0}
- Total de Clientes: ${financialContext.totalClientes || 0}
- Despesas Recorrentes: ${financialContext.despesasRecorrentes || 0}

HISTÓRICO RECENTE:
${financialContext.historicoRecente || 'Não disponível'}
`;
    }

    const allMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "system", content: contextMessage },
      ...messages,
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: allMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione fundos à sua conta." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erro ao conectar com o agente de IA" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("kema-finance-ai error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
