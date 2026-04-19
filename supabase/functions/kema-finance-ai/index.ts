import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_MESSAGES = 50;
const MAX_MESSAGE_LENGTH = 4000;

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
    // Authentication check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages, financialContext } = await req.json();

    // Input validation
    if (!Array.isArray(messages) || messages.length > MAX_MESSAGES) {
      return new Response(
        JSON.stringify({ error: "Número de mensagens excede o limite permitido." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sanitizedMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: String(m.content || "").slice(0, MAX_MESSAGE_LENGTH),
    }));

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Erro interno do servidor. Tente novamente." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build context message with financial data
    let contextMessage = "";
    if (financialContext) {
      const safeNum = (val: unknown) => {
        const n = Number(val);
        return isNaN(n) ? 0 : n;
      };
      contextMessage = `
CONTEXTO FINANCEIRO ATUAL DO USUÁRIO:

📊 RESUMO GERAL:
- Receita Total Mensal: R$ ${safeNum(financialContext.receitaTotal).toFixed(2)}
  • Sites: R$ ${safeNum(financialContext.receitaServicos).toFixed(2)}
  • Instalações: R$ ${safeNum(financialContext.receitaInstalacoes).toFixed(2)}
- Despesas Totais do Mês: R$ ${safeNum(financialContext.despesaTotal).toFixed(2)}
  • Pagas: R$ ${safeNum(financialContext.despesasPagas).toFixed(2)}
  • Pendentes: R$ ${safeNum(financialContext.despesasPendentes).toFixed(2)}
- Saldo Líquido: R$ ${safeNum(financialContext.saldoReal).toFixed(2)}
- Percentual Comprometido: ${safeNum(financialContext.percentualComprometido).toFixed(1)}%

💳 DÍVIDAS:
- Total em Empréstimos: R$ ${safeNum(financialContext.totalEmprestimos).toFixed(2)}
- Total Dívidas Negativadas: R$ ${safeNum(financialContext.totalDividasNegativadas).toFixed(2)}
- Total Geral de Dívidas: R$ ${safeNum(financialContext.totalDividas).toFixed(2)}

📈 MÉTRICAS:
- Score Financeiro: ${safeNum(financialContext.scoreFinanceiro)}/100
- Classificação: ${String(financialContext.classificacao || 'N/A').slice(0, 50)}
- Capacidade de Economia: R$ ${safeNum(financialContext.capacidadeEconomia).toFixed(2)}/mês
- Meta Reserva de Emergência: R$ ${safeNum(financialContext.metaReservaEmergencia).toFixed(2)}

📋 DETALHES:
- Sites Ativos: ${safeNum(financialContext.sitesAtivos)}
- Instalações este Mês: ${safeNum(financialContext.instalacoesDoMes)}
- Total de Clientes: ${safeNum(financialContext.totalClientes)}
- Despesas Recorrentes: ${safeNum(financialContext.despesasRecorrentes)}

HISTÓRICO RECENTE:
${String(financialContext.historicoRecente || 'Não disponível').slice(0, 2000)}
`;
    }

    const allMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "system", content: contextMessage },
      ...sanitizedMessages,
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
      JSON.stringify({ error: "Erro interno do servidor. Tente novamente." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
