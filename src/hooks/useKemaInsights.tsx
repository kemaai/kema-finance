import { useMemo } from 'react';
import {
  useServicos,
  useClientes,
  useInstalacoes,
  useDespesas,
  useEmprestimos,
  useDividasNegativadas,
  useGastosDiarios,
} from './useSupabaseData';
import { parseLocalDate } from '@/lib/utils';

export type InsightSeverity = 'critico' | 'atencao' | 'oportunidade' | 'info';
export type InsightModule =
  | 'dashboard'
  | 'despesas'
  | 'gastos'
  | 'instalacoes'
  | 'servicos'
  | 'clientes'
  | 'dividas'
  | 'relatorios';


export interface KemaInsight {
  id: string;
  modulo: InsightModule;
  severidade: InsightSeverity;
  titulo: string;
  descricao: string;
  acao: string;
  rota: string;
  pergunta: string;
  valor?: number;
}

const brl = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

const diasEntre = (a: Date, b: Date) => Math.round((a.getTime() - b.getTime()) / 86400000);

export interface OperationalSnapshot {
  despesasVencidas: { qtd: number; valor: number };
  despesasProximos7Dias: { qtd: number; valor: number };
  despesasPendentesMes: { qtd: number; valor: number };
  maioresDespesas: { nome: string; valor: number }[];
  instalacoesPendentes: number;
  instalacoesAtrasadas: number;
  instalacoesNaoRecebidas: { qtd: number; valor: number };
  instalacoesProximas: { qtd: number; valor: number };
  servicosNaoPagos: { qtd: number; valor: number };
  servicosRecorrentes: number;
  clientesSemMovimento: number;
  clientesComDadosIncompletos: number;
  ticketMedioInstalacao: number;
  emprestimosAbertos: { qtd: number; valor: number };
  dividasNegativadasAbertas: { qtd: number; valor: number };
  concentracaoMaiorCliente: { nome: string; percentual: number } | null;
  gastosDiariosMes: { qtd: number; valor: number };
  gastosDiariosMesAnterior: number;
  gastosSuperfluosMes: { qtd: number; valor: number };
  gastosEssenciaisMes: number;
  mediaGastoDiario: number;
  projecaoGastosMes: number;
  gastosPorCategoria: { categoria: string; valor: number }[];
  categoriaMaisCara: { categoria: string; valor: number; percentual: number } | null;
  custoTotalMes: number;
}

export function useKemaInsights() {
  const { data: servicos = [] } = useServicos();
  const { data: clientes = [] } = useClientes();
  const { data: instalacoes = [] } = useInstalacoes();
  const { data: despesas = [] } = useDespesas();
  const { data: emprestimos = [] } = useEmprestimos();
  const { data: dividasNegativadas = [] } = useDividasNegativadas();
  const { data: gastosDiarios = [] } = useGastosDiarios();


  const snapshot = useMemo<OperationalSnapshot>(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    const em7Dias = new Date(hoje.getTime() + 7 * 86400000);

    // ---- Despesas
    const pendentes = despesas.filter(d => !d.paga);
    const vencidas = pendentes.filter(d => parseLocalDate(d.data_vencimento) < hoje);
    const proximas = pendentes.filter(d => {
      const dt = parseLocalDate(d.data_vencimento);
      return dt >= hoje && dt <= em7Dias;
    });
    const pendentesMes = pendentes.filter(d => {
      const dt = parseLocalDate(d.data_vencimento);
      return dt >= inicioMes && dt <= fimMes;
    });
    const maioresDespesas = [...despesas]
      .filter(d => {
        const dt = parseLocalDate(d.data_vencimento);
        return dt >= inicioMes && dt <= fimMes;
      })
      .sort((a, b) => Number(b.valor) - Number(a.valor))
      .slice(0, 5)
      .map(d => ({ nome: d.nome, valor: Number(d.valor) }));

    // ---- Instalações
    const pendentesInst = instalacoes.filter(i => i.status !== 'Concluído');
    const atrasadas = pendentesInst.filter(i => parseLocalDate(i.data_instalacao) < hoje);
    const proximasInst = instalacoes.filter(i => {
      const dt = parseLocalDate(i.data_instalacao);
      return dt >= hoje && dt <= em7Dias;
    });
    const naoRecebidas = instalacoes.filter(
      i => i.status === 'Concluído' && !i.pedido_recebido
    );
    const concluidas = instalacoes.filter(i => i.status === 'Concluído');
    const ticketMedio = concluidas.length
      ? concluidas.reduce((t, i) => t + Number(i.valor_total), 0) / concluidas.length
      : 0;

    // ---- Serviços
    const servicosNaoPagos = servicos.filter(s => !s.pago);

    // ---- Clientes
    const nomesAtivos = new Set<string>([
      ...servicos.map(s => s.cliente_nome),
      ...instalacoes.map(i => i.arquiteto_nome),
    ]);
    const clientesSemMovimento = clientes.filter(c => !nomesAtivos.has(c.nome)).length;
    const clientesComDadosIncompletos = clientes.filter(
      c => !c.email || !c.telefone || !c.cpf_cnpj
    ).length;

    // ---- Concentração de receita
    const receitaPorCliente = new Map<string, number>();
    servicos.forEach(s =>
      receitaPorCliente.set(s.cliente_nome, (receitaPorCliente.get(s.cliente_nome) || 0) + Number(s.valor))
    );
    instalacoes.forEach(i =>
      receitaPorCliente.set(
        i.arquiteto_nome,
        (receitaPorCliente.get(i.arquiteto_nome) || 0) + Number(i.valor_total)
      )
    );
    const receitaTotalHistorica = [...receitaPorCliente.values()].reduce((a, b) => a + b, 0);
    const topCliente = [...receitaPorCliente.entries()].sort((a, b) => b[1] - a[1])[0];
    const concentracao =
      topCliente && receitaTotalHistorica > 0
        ? { nome: topCliente[0], percentual: (topCliente[1] / receitaTotalHistorica) * 100 }
        : null;

    const soma = <T,>(arr: T[], f: (x: T) => number) => arr.reduce((t, x) => t + f(x), 0);

    // ---- Gastos diários
    const inicioMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
    const fimMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
    const gastosMes = gastosDiarios.filter(g => {
      const dt = parseLocalDate(g.data_gasto);
      return dt >= inicioMes && dt <= fimMes;
    });
    const gastosAnterior = gastosDiarios.filter(g => {
      const dt = parseLocalDate(g.data_gasto);
      return dt >= inicioMesAnterior && dt <= fimMesAnterior;
    });
    const superfluos = gastosMes.filter(g => !g.essencial);
    const totalGastosMes = soma(gastosMes, g => Number(g.valor));
    const essenciaisValor = totalGastosMes - soma(superfluos, g => Number(g.valor));
    const diasDecorridos = hoje.getDate();
    const diasNoMes = fimMes.getDate();
    const mediaDiaria = diasDecorridos > 0 ? totalGastosMes / diasDecorridos : 0;

    const mapCategoria = new Map<string, number>();
    gastosMes.forEach(g =>
      mapCategoria.set(g.categoria, (mapCategoria.get(g.categoria) || 0) + Number(g.valor))
    );
    const gastosPorCategoria = [...mapCategoria.entries()]
      .map(([categoria, valor]) => ({ categoria, valor }))
      .sort((a, b) => b.valor - a.valor);
    const topCategoria = gastosPorCategoria[0];

    const despesasMesTotal = soma(
      despesas.filter(d => {
        const dt = parseLocalDate(d.data_vencimento);
        return dt >= inicioMes && dt <= fimMes;
      }),
      d => Number(d.valor)
    );

    return {
      despesasVencidas: { qtd: vencidas.length, valor: soma(vencidas, d => Number(d.valor)) },
      despesasProximos7Dias: { qtd: proximas.length, valor: soma(proximas, d => Number(d.valor)) },
      despesasPendentesMes: { qtd: pendentesMes.length, valor: soma(pendentesMes, d => Number(d.valor)) },
      maioresDespesas,
      instalacoesPendentes: pendentesInst.length,
      instalacoesAtrasadas: atrasadas.length,
      instalacoesNaoRecebidas: {
        qtd: naoRecebidas.length,
        valor: soma(naoRecebidas, i => Number(i.valor_total)),
      },
      instalacoesProximas: {
        qtd: proximasInst.length,
        valor: soma(proximasInst, i => Number(i.valor_total)),
      },
      servicosNaoPagos: { qtd: servicosNaoPagos.length, valor: soma(servicosNaoPagos, s => Number(s.valor)) },
      servicosRecorrentes: servicos.filter(s => s.recorrente).length,
      clientesSemMovimento,
      clientesComDadosIncompletos,
      ticketMedioInstalacao: ticketMedio,
      emprestimosAbertos: {
        qtd: emprestimos.length,
        valor: soma(emprestimos, e => Number(e.valor_atual)),
      },
      dividasNegativadasAbertas: {
        qtd: dividasNegativadas.filter(d => !d.pago).length,
        valor: soma(dividasNegativadas.filter(d => !d.pago), d => Number(d.valor_atual)),
      },
      concentracaoMaiorCliente: concentracao,
      gastosDiariosMes: { qtd: gastosMes.length, valor: totalGastosMes },
      gastosDiariosMesAnterior: soma(gastosAnterior, g => Number(g.valor)),
      gastosSuperfluosMes: { qtd: superfluos.length, valor: soma(superfluos, g => Number(g.valor)) },
      gastosEssenciaisMes: essenciaisValor,
      mediaGastoDiario: mediaDiaria,
      projecaoGastosMes: mediaDiaria * diasNoMes,
      gastosPorCategoria: gastosPorCategoria.slice(0, 6),
      categoriaMaisCara: topCategoria && totalGastosMes > 0
        ? {
            categoria: topCategoria.categoria,
            valor: topCategoria.valor,
            percentual: (topCategoria.valor / totalGastosMes) * 100,
          }
        : null,
      custoTotalMes: despesasMesTotal + totalGastosMes,
    };
  }, [servicos, clientes, instalacoes, despesas, emprestimos, dividasNegativadas, gastosDiarios]);


  const insights = useMemo<KemaInsight[]>(() => {
    const list: KemaInsight[] = [];
    const s = snapshot;

    // ---- Gastos diários
    if (s.gastosSuperfluosMes.valor > 0) {
      const anual = s.gastosSuperfluosMes.valor * 12;
      list.push({
        id: 'gastos-superfluos',
        modulo: 'gastos',
        severidade: s.gastosDiariosMes.valor > 0 && s.gastosSuperfluosMes.valor / s.gastosDiariosMes.valor > 0.3
          ? 'critico'
          : 'atencao',
        titulo: `${brl(s.gastosSuperfluosMes.valor)} em gastos supérfluos no mês`,
        descricao: `${s.gastosSuperfluosMes.qtd} lançamento(s) não essenciais. Cortando isso você guardaria ~${brl(anual)} por ano.`,
        acao: 'Revisar supérfluos',
        rota: '/gastos-diarios',
        pergunta: 'Analise meus gastos diários supérfluos e monte um plano de corte para eu economizar por mês.',
        valor: s.gastosSuperfluosMes.valor,
      });
    }

    if (s.categoriaMaisCara && s.categoriaMaisCara.percentual > 30) {
      list.push({
        id: 'gastos-categoria-concentrada',
        modulo: 'gastos',
        severidade: 'atencao',
        titulo: `${s.categoriaMaisCara.categoria} consome ${s.categoriaMaisCara.percentual.toFixed(0)}% dos gastos diários`,
        descricao: `${brl(s.categoriaMaisCara.valor)} concentrados nessa categoria no mês.`,
        acao: 'Ver detalhamento',
        rota: '/gastos-diarios',
        pergunta: `Meus gastos com ${s.categoriaMaisCara.categoria} estão altos. Como reduzir sem perder qualidade de vida?`,
        valor: s.categoriaMaisCara.valor,
      });
    }

    if (
      s.gastosDiariosMesAnterior > 0 &&
      s.projecaoGastosMes > s.gastosDiariosMesAnterior * 1.15
    ) {
      list.push({
        id: 'gastos-em-alta',
        modulo: 'gastos',
        severidade: 'critico',
        titulo: 'Ritmo de gastos acima do mês passado',
        descricao: `Projeção de ${brl(s.projecaoGastosMes)} contra ${brl(s.gastosDiariosMesAnterior)} no mês anterior (média de ${brl(s.mediaGastoDiario)}/dia).`,
        acao: 'Frear os gastos',
        rota: '/gastos-diarios',
        pergunta: 'Meus gastos diários estão subindo em relação ao mês passado. O que devo cortar primeiro?',
        valor: s.projecaoGastosMes,
      });
    }

    if (s.gastosDiariosMes.qtd === 0) {
      list.push({
        id: 'gastos-sem-registro',
        modulo: 'gastos',
        severidade: 'oportunidade',
        titulo: 'Nenhum gasto diário registrado neste mês',
        descricao: 'Sem registrar o dia a dia é impossível saber para onde o dinheiro está indo.',
        acao: 'Registrar gastos',
        rota: '/gastos-diarios',
        pergunta: 'Como criar o hábito de registrar meus gastos diários e usar isso para economizar?',
      });
    }


    if (s.despesasVencidas.qtd > 0) {
      list.push({
        id: 'despesas-vencidas',
        modulo: 'despesas',
        severidade: 'critico',
        titulo: `${s.despesasVencidas.qtd} despesa(s) vencida(s)`,
        descricao: `Total de ${brl(s.despesasVencidas.valor)} em atraso — juros e multas corroem a margem do mês.`,
        acao: 'Regularizar agora',
        rota: '/despesas',
        pergunta: 'Tenho despesas vencidas. Qual a melhor ordem para quitar e como evitar novos atrasos?',
        valor: s.despesasVencidas.valor,
      });
    }

    if (s.despesasProximos7Dias.qtd > 0) {
      list.push({
        id: 'despesas-7-dias',
        modulo: 'despesas',
        severidade: 'atencao',
        titulo: `${s.despesasProximos7Dias.qtd} conta(s) vencem em 7 dias`,
        descricao: `Reserve ${brl(s.despesasProximos7Dias.valor)} de caixa para a próxima semana.`,
        acao: 'Planejar pagamentos',
        rota: '/despesas',
        pergunta: 'Quais contas vencem nos próximos 7 dias e como organizo o caixa para pagá-las?',
        valor: s.despesasProximos7Dias.valor,
      });
    }

    if (s.instalacoesNaoRecebidas.qtd > 0) {
      list.push({
        id: 'instalacoes-nao-recebidas',
        modulo: 'instalacoes',
        severidade: 'critico',
        titulo: `${s.instalacoesNaoRecebidas.qtd} instalação(ões) concluída(s) sem recebimento`,
        descricao: `${brl(s.instalacoesNaoRecebidas.valor)} entregues e ainda não marcados como recebidos.`,
        acao: 'Cobrar recebimento',
        rota: '/instalacoes',
        pergunta: 'Tenho instalações concluídas ainda não recebidas. Como estruturar a cobrança desses valores?',
        valor: s.instalacoesNaoRecebidas.valor,
      });
    }

    if (s.instalacoesAtrasadas > 0) {
      list.push({
        id: 'instalacoes-atrasadas',
        modulo: 'instalacoes',
        severidade: 'atencao',
        titulo: `${s.instalacoesAtrasadas} instalação(ões) com data vencida`,
        descricao: 'Pedidos com data passada e status diferente de Concluído travam o faturamento.',
        acao: 'Atualizar status',
        rota: '/instalacoes',
        pergunta: 'Como priorizar e destravar as instalações atrasadas na agenda?',
      });
    }

    if (s.instalacoesProximas.qtd > 0) {
      list.push({
        id: 'instalacoes-proximas',
        modulo: 'instalacoes',
        severidade: 'info',
        titulo: `${s.instalacoesProximas.qtd} instalação(ões) nos próximos 7 dias`,
        descricao: `Previsão de ${brl(s.instalacoesProximas.valor)} entrando na agenda desta semana.`,
        acao: 'Ver agenda',
        rota: '/instalacoes',
        pergunta: 'Como me organizar para as instalações desta semana?',
        valor: s.instalacoesProximas.valor,
      });
    }

    if (s.servicosNaoPagos.qtd > 0) {
      list.push({
        id: 'servicos-nao-pagos',
        modulo: 'servicos',
        severidade: 'atencao',
        titulo: `${s.servicosNaoPagos.qtd} serviço(s) não pago(s)`,
        descricao: `${brl(s.servicosNaoPagos.valor)} pendentes de recebimento de clientes.`,
        acao: 'Revisar cobranças',
        rota: '/servicos',
        pergunta: 'Como reduzir a inadimplência dos serviços não pagos?',
        valor: s.servicosNaoPagos.valor,
      });
    }

    if (s.dividasNegativadasAbertas.qtd > 0 || s.emprestimosAbertos.qtd > 0) {
      const total = s.dividasNegativadasAbertas.valor + s.emprestimosAbertos.valor;
      list.push({
        id: 'dividas-abertas',
        modulo: 'dividas',
        severidade: s.dividasNegativadasAbertas.qtd > 0 ? 'critico' : 'atencao',
        titulo: `${brl(total)} em dívidas em aberto`,
        descricao: `${s.emprestimosAbertos.qtd} empréstimo(s) e ${s.dividasNegativadasAbertas.qtd} negativação(ões) ativas.`,
        acao: 'Montar plano de quitação',
        rota: '/dividas',
        pergunta: 'Monte um plano de quitação das minhas dívidas usando os métodos Avalanche e Bola de Neve.',
        valor: total,
      });
    }

    if (s.concentracaoMaiorCliente && s.concentracaoMaiorCliente.percentual > 40) {
      list.push({
        id: 'concentracao-cliente',
        modulo: 'clientes',
        severidade: 'atencao',
        titulo: 'Receita concentrada em um cliente',
        descricao: `${s.concentracaoMaiorCliente.nome} representa ${s.concentracaoMaiorCliente.percentual.toFixed(0)}% da sua receita histórica.`,
        acao: 'Diversificar carteira',
        rota: '/clientes',
        pergunta: 'Minha receita está concentrada em um cliente. Como diversificar a carteira com segurança?',
      });
    }

    if (s.clientesComDadosIncompletos > 0) {
      list.push({
        id: 'clientes-incompletos',
        modulo: 'clientes',
        severidade: 'info',
        titulo: `${s.clientesComDadosIncompletos} cliente(s) com cadastro incompleto`,
        descricao: 'Faltam e-mail, telefone ou documento — isso dificulta cobrança e emissão.',
        acao: 'Completar cadastros',
        rota: '/clientes',
        pergunta: 'Como organizar meus cadastros de clientes para facilitar cobrança e emissão?',
      });
    }

    if (s.clientesSemMovimento > 0) {
      list.push({
        id: 'clientes-inativos',
        modulo: 'clientes',
        severidade: 'oportunidade',
        titulo: `${s.clientesSemMovimento} cliente(s) sem movimento`,
        descricao: 'Base inativa é a forma mais barata de gerar novas vendas.',
        acao: 'Criar reativação',
        rota: '/clientes',
        pergunta: 'Como reativar clientes que estão sem movimento na minha base?',
      });
    }

    if (s.servicosRecorrentes === 0) {
      list.push({
        id: 'sem-recorrencia',
        modulo: 'servicos',
        severidade: 'oportunidade',
        titulo: 'Nenhuma receita recorrente cadastrada',
        descricao: 'Receita recorrente estabiliza o caixa e reduz a dependência de novos pedidos.',
        acao: 'Criar plano recorrente',
        rota: '/servicos',
        pergunta: 'Como transformar meus serviços pontuais em receita recorrente?',
      });
    }

    if (s.ticketMedioInstalacao > 0) {
      list.push({
        id: 'ticket-medio',
        modulo: 'relatorios',
        severidade: 'info',
        titulo: `Ticket médio de ${brl(s.ticketMedioInstalacao)} por instalação`,
        descricao: 'Use esse número para precificar e projetar o faturamento do mês.',
        acao: 'Analisar relatórios',
        rota: '/relatorios',
        pergunta: 'Analise meu ticket médio por instalação e sugira como aumentá-lo.',
        valor: s.ticketMedioInstalacao,
      });
    }

    const ordem: Record<InsightSeverity, number> = {
      critico: 0,
      atencao: 1,
      oportunidade: 2,
      info: 3,
    };
    return list.sort((a, b) => ordem[a.severidade] - ordem[b.severidade]);
  }, [snapshot]);

  return { snapshot, insights, diasEntre };
}
