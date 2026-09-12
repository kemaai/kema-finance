import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_MESSAGES = 50;
const MAX_MESSAGE_LENGTH = 4000;

const SYSTEM_PROMPT = `Você é o KEMA AI, o copiloto operacional e financeiro do KemaFinance — um app de gestão para um profissional que vende serviços (sites/serviços recorrentes) e instalações (medidas em m²), com clientes, despesas, empréstimos e dívidas negativadas.

QUEM VOCÊ É:
Um consultor sênior de negócios + finanças pessoais que enxerga TODOS os dados do usuário em tempo real (serviços, instalações, clientes, despesas, dívidas, metas) e responde SEMPRE com base nesses números reais, nunca em suposições genéricas.

O QUE VOCÊ FAZ:
1. Diagnóstico: leia o contexto e diga em 1 frase onde o usuário está.
2. Orientação operacional: agenda de instalações, cobranças pendentes, recebimentos não confirmados, cadastros incompletos, clientes inativos.
3. Orientação financeira: fluxo de caixa, corte de gastos, quitação de dívidas (Avalanche/Bola de Neve), reserva de emergência, precificação e ticket médio.
3b. Economia no dia a dia: analise os GASTOS DIÁRIOS por categoria e o flag essencial/supérfluo. Aponte com nome e valor os gastos supérfluos que devem ser cortados ou reduzidos, quanto isso representa por mês e por ano, e transforme a economia em meta de reserva.
4. Organização: ajude a priorizar o dia/semana/mês com listas curtas e acionáveis.
5. Crescimento: aponte oportunidades (recorrência, reativação de clientes, diversificação de carteira).

COMO RESPONDER:
- Português do Brasil, direto, prático, sem enrolação. Máximo ~250 palavras salvo pedido explícito.
- Comece pela resposta, não por preâmbulo.
- Use SEMPRE números reais do contexto (valores em R$, quantidades, prazos).
- Estruture com títulos curtos (##), listas e negrito nos valores.
- Termine com **Próximos passos**: no máximo 3 ações objetivas.
- Considere a PÁGINA ATUAL do usuário: priorize o que é relevante para aquela tela.
- Emojis de status: 🔴 crítico, 🟡 atenção, 🟢 saudável, 💡 oportunidade.
- NUNCA julgue o usuário. Nunca invente dados que não estão no contexto — se faltar, diga o que ele precisa cadastrar.
- Não sugira investimentos antes da reserva de emergência estar formada.
- Você não executa ações no app; oriente o usuário sobre qual menu usar (Serviços, Instalações, Clientes, Despesas, Gastos Diários, Dívidas, Relatórios).
- Ao falar de corte de gastos, priorize SEMPRE os supérfluos (não essenciais) antes de tocar em essenciais ou contas fixas, e seja específico (categoria + valor + quanto cortar).

REGRAS DE CÁLCULO:
- Custo total do mês = Despesas fixas + Gastos diários
- % Comprometido = (Custo total + Dívidas) / Receita × 100
- Economia potencial imediata = total de gastos supérfluos do mês
- Projeção de gastos do mês = média diária × dias do mês
- Score: 0-39 🔴 Crítica | 40-69 🟡 Atenção | 70-100 🟢 Saudável
- Capacidade de Economia = 30% do saldo positivo
- Meta de Reserva = 6 × despesa mensal média
- Impacto sempre em valor mensal E anual quando fizer sentido.

METAS DE RECEITA E CUSTO (regra obrigatória):
- Se o bloco METAS do contexto indicar "definidas: NÃO", a PRIMEIRA coisa da sua resposta é perguntar, de forma curta e objetiva: (1) qual a meta de receita mensal em R$ e (2) qual o teto de custo mensal em R$. Sugira valores de referência calculados a partir dos números reais dele (ex.: receita atual + 20%, custo atual − economia potencial) e diga que ele pode informar na conversa ou no campo de metas do painel. Depois disso responda o que foi perguntado com os dados que já existem.
- Se as metas estiverem definidas, SEMPRE mostre:
  ## Metas x Realidade — meta de receita, receita real e o gap em R$; teto de custo, custo real e o excedente em R$.
  ## Cortes sugeridos — tabela/lista de cortes REAIS por categoria de gasto, cada linha com: categoria/gasto, valor atual no mês, valor sugerido, corte em R$ e justificativa curta. Priorize supérfluos, depois recorrências pouco usadas, depois renegociação de fixas. Nunca corte abaixo do essencial.
  Some os cortes e mostre **Total do corte: R$ X/mês (R$ 12X/ano)** e se isso fecha ou não o excedente de custo; se não fechar, diga quanto ainda falta.
  Se faltar receita, calcule quantas instalações/serviços (usando o ticket médio real) são necessários para cobrir o gap.
- Só use valores que existam no contexto. Se uma categoria não tem valor registrado, diga que precisa ser lançada em Gastos Diários ou Despesas.

OBJETIVO: manter a operação organizada, o caixa positivo, as dívidas caindo e o patrimônio crescendo.`;

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
    const safeNum = (val: unknown) => {
      const n = Number(val);
      return isNaN(n) ? 0 : n;
    };
    const brl = (val: unknown) => `R$ ${safeNum(val).toFixed(2)}`;
    const safeStr = (val: unknown, max = 200) => String(val ?? "N/A").slice(0, max);

    let contextMessage = "";
    if (financialContext) {
      const op = financialContext.operacional ?? {};
      const insights: string[] = Array.isArray(financialContext.insightsAtivos)
        ? financialContext.insightsAtivos.slice(0, 10).map((i: unknown) => safeStr(i, 220))
        : [];
      const maiores: string[] = Array.isArray(op.maioresDespesas)
        ? op.maioresDespesas.slice(0, 5).map((d: { nome?: string; valor?: number }) => `${safeStr(d?.nome, 40)} (${brl(d?.valor)})`)
        : [];

      contextMessage = `
CONTEXTO EM TEMPO REAL DO USUÁRIO (dados reais do app)

🧭 ONDE ELE ESTÁ AGORA:
- Tela atual: ${safeStr(financialContext.paginaAtual, 40)} (${safeStr(financialContext.rotaAtual, 40)})

📊 FINANCEIRO DO MÊS:
- Receita total: ${brl(financialContext.receitaTotal)} (Serviços ${brl(financialContext.receitaServicos)} | Instalações ${brl(financialContext.receitaInstalacoes)})
- Despesas: ${brl(financialContext.despesaTotal)} (Pagas ${brl(financialContext.despesasPagas)} | Pendentes ${brl(financialContext.despesasPendentes)})
- Gastos diários (dia a dia): ${brl(financialContext.gastosDiariosTotal)} (Essenciais ${brl(financialContext.gastosDiariosEssenciais)} | Supérfluos ${brl(financialContext.gastosDiariosSuperfluos)} | Média ${brl(financialContext.mediaGastoDiario)}/dia)
- Projeção de gastos diários no mês: ${brl(op.projecaoGastosMes)} (mês anterior: ${brl(op.gastosDiariosMesAnterior)})
- Gastos por categoria: ${Array.isArray(op.gastosPorCategoria) && op.gastosPorCategoria.length ? op.gastosPorCategoria.map((c: { categoria?: unknown; valor?: unknown }) => `${safeStr(c?.categoria, 30)} ${brl(c?.valor)}`).join(' | ') : 'sem registros'}
- Custo total do mês (fixas + dia a dia): ${brl(financialContext.custoTotalMes)}
- Economia potencial cortando supérfluos: ${brl(financialContext.economiaPotencialCortes)}/mês
- Saldo líquido: ${brl(financialContext.saldoReal)}
- Comprometimento da renda: ${safeNum(financialContext.percentualComprometido).toFixed(1)}%
- Score financeiro: ${safeNum(financialContext.scoreFinanceiro)}/100 (${safeStr(financialContext.classificacaoLabel ?? financialContext.classificacao, 30)})
- Capacidade de economia: ${brl(financialContext.capacidadeEconomia)}/mês
- Meta de reserva de emergência: ${brl(financialContext.metaReservaEmergencia)}

💳 DÍVIDAS:
- Empréstimos: ${brl(financialContext.totalEmprestimos)} (${safeNum(op.emprestimosAbertos?.qtd)} ativos)
- Negativadas em aberto: ${brl(financialContext.totalDividasNegativadas)} (${safeNum(op.dividasNegativadasAbertas?.qtd)})
- Total: ${brl(financialContext.totalDividas)}

🗓️ OPERAÇÃO — DESPESAS:
- Vencidas: ${safeNum(op.despesasVencidas?.qtd)} (${brl(op.despesasVencidas?.valor)})
- Vencem em 7 dias: ${safeNum(op.despesasProximos7Dias?.qtd)} (${brl(op.despesasProximos7Dias?.valor)})
- Pendentes no mês: ${safeNum(op.despesasPendentesMes?.qtd)} (${brl(op.despesasPendentesMes?.valor)})
- Maiores despesas do mês: ${maiores.join(", ") || "Nenhuma"}

🔧 OPERAÇÃO — INSTALAÇÕES:
- Pendentes (não concluídas): ${safeNum(op.instalacoesPendentes)}
- Com data já vencida: ${safeNum(op.instalacoesAtrasadas)}
- Concluídas SEM recebimento confirmado: ${safeNum(op.instalacoesNaoRecebidas?.qtd)} (${brl(op.instalacoesNaoRecebidas?.valor)})
- Agendadas nos próximos 7 dias: ${safeNum(op.instalacoesProximas?.qtd)} (${brl(op.instalacoesProximas?.valor)})
- Ticket médio por instalação: ${brl(op.ticketMedioInstalacao)}
- Instalações concluídas no mês: ${safeNum(financialContext.instalacoesDoMes)}

🧾 OPERAÇÃO — SERVIÇOS E CLIENTES:
- Serviços não pagos: ${safeNum(op.servicosNaoPagos?.qtd)} (${brl(op.servicosNaoPagos?.valor)})
- Serviços recorrentes cadastrados: ${safeNum(op.servicosRecorrentes)}
- Serviços no mês: ${safeNum(financialContext.sitesAtivos)}
- Total de clientes: ${safeNum(financialContext.totalClientes)}
- Clientes sem movimento: ${safeNum(op.clientesSemMovimento)}
- Clientes com cadastro incompleto: ${safeNum(op.clientesComDadosIncompletos)}
- Maior concentração de receita: ${op.concentracaoMaiorCliente ? `${safeStr(op.concentracaoMaiorCliente.nome, 40)} com ${safeNum(op.concentracaoMaiorCliente.percentual).toFixed(0)}%` : "N/A"}

🚨 INSIGHTS JÁ DETECTADOS PELO APP:
${insights.length ? insights.map((i) => `- ${i}`).join("\n") : "- Nenhum alerta ativo"}

📌 ALERTAS RECENTES:
${safeStr(financialContext.historicoRecente, 1200)}
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
