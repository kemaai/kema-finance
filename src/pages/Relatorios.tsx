import React, { useState, useMemo } from 'react';
import { FileText, Download, TrendingUp, Scissors, Calendar, DollarSign, Users, Globe, CreditCard, AlertTriangle, Banknote, Ruler, BarChart3 } from 'lucide-react';
import { useIsMobile } from '../hooks/use-mobile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useServicos, useClientes, useInstalacoes, useDespesas, useEmprestimos, usePagamentosEmprestimo, useDividasNegativadas } from '../hooks/useSupabaseData';
import { RelatorioFilter } from '../components/RelatorioFilter';
import { RelatorioChart } from '../components/RelatorioChart';
import { getWeekNumber, getPeriodoDatas, formatPeriodo, isDateInPeriod, getHistoricoPeriodos } from '@/lib/dateUtils';
import { exportReportCSV, exportReportPDF, type ReportSection } from '@/lib/reportExport';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { useM2Price } from '@/hooks/useM2Price';

export const Relatorios = () => {
  const { price: m2Price } = useM2Price();
  const { data: servicos = [], isLoading: sitesLoading } = useServicos();
  const { data: clientes = [], isLoading: clientesLoading } = useClientes();
  const { data: instalacoes = [], isLoading: instalacoesLoading } = useInstalacoes();
  const { data: despesas = [], isLoading: despesasLoading } = useDespesas();
  const { data: emprestimos = [], isLoading: emprestimosLoading } = useEmprestimos();
  const { data: pagamentosEmprestimo = [], isLoading: pagamentosLoading } = usePagamentosEmprestimo();
  const { data: dividasNegativadas = [], isLoading: dividasLoading } = useDividasNegativadas();
  
  // Estados do filtro
  const [periodoRelatorio, setPeriodoRelatorio] = useState<'semanal' | 'mensal' | 'anual'>('mensal');
  const [semanaEscolhida, setSemanaEscolhida] = useState(getWeekNumber(new Date()));
  const [mesEscolhido, setMesEscolhido] = useState(new Date().getMonth());
  const [anoEscolhido, setAnoEscolhido] = useState(new Date().getFullYear());
  const [tipoRelatorio, setTipoRelatorio] = useState('todos');
  const isMobile = useIsMobile();

  const isLoading = sitesLoading || clientesLoading || instalacoesLoading || despesasLoading || emprestimosLoading || pagamentosLoading || dividasLoading;

  // Função para resetar filtros
  const resetarFiltros = () => {
    setPeriodoRelatorio('mensal');
    setSemanaEscolhida(getWeekNumber(new Date()));
    setMesEscolhido(new Date().getMonth());
    setAnoEscolhido(new Date().getFullYear());
    setTipoRelatorio('todos');
  };

  // Função para filtrar dados por período e tipo
  const dadosFiltrados = useMemo(() => {
    const { dataInicio, dataFim } = getPeriodoDatas(periodoRelatorio, semanaEscolhida, mesEscolhido, anoEscolhido);

    let resultado = {
      servicos: servicos,
      clientes: clientes,
      instalacoes: instalacoes,
      despesas: despesas,
      emprestimos: emprestimos,
      dividasNegativadas: dividasNegativadas
    };

    // Filtrar instalações por período
    if (tipoRelatorio === 'instalacoes' || tipoRelatorio === 'todos') {
      resultado.instalacoes = instalacoes.filter(instalacao => {
        const dataInstalacao = new Date(instalacao.data_instalacao);
        return isDateInPeriod(dataInstalacao, dataInicio, dataFim);
      });
    }

    // Filtrar serviços com data no período
    if (tipoRelatorio === 'sites' || tipoRelatorio === 'servicos' || tipoRelatorio === 'todos') {
      resultado.servicos = servicos.filter(s => {
        const dataServico = new Date(s.data_servico);
        return isDateInPeriod(dataServico, dataInicio, dataFim);
      });
    }

    // Filtrar despesas por período
    if (tipoRelatorio === 'despesas' || tipoRelatorio === 'todos') {
      resultado.despesas = despesas.filter(despesa => {
        const dataDespesa = new Date(despesa.data_vencimento);
        return isDateInPeriod(dataDespesa, dataInicio, dataFim);
      });
    }

    // Filtrar clientes criados no período
    if (tipoRelatorio === 'clientes' || tipoRelatorio === 'todos') {
      resultado.clientes = clientes.filter(cliente => {
        const dataCriacao = new Date(cliente.created_at);
        return isDateInPeriod(dataCriacao, dataInicio, dataFim);
      });
    }

    // Filtrar pagamentos de empréstimos no período
    if (tipoRelatorio === 'emprestimos' || tipoRelatorio === 'todos') {
      resultado.emprestimos = emprestimos;
    }

    // Filtrar dívidas pagas no período
    if (tipoRelatorio === 'dividas' || tipoRelatorio === 'todos') {
      resultado.dividasNegativadas = dividasNegativadas;
    }

    return resultado;
  }, [servicos, clientes, instalacoes, despesas, emprestimos, dividasNegativadas, periodoRelatorio, semanaEscolhida, mesEscolhido, anoEscolhido, tipoRelatorio]);

  // Cálculos de métricas
  const metricas = useMemo(() => {
    const { dataInicio, dataFim } = getPeriodoDatas(periodoRelatorio, semanaEscolhida, mesEscolhido, anoEscolhido);

    // Receitas de Serviços (soma dos valores dos serviços do período)
    const receitaServicos = dadosFiltrados.servicos
      .reduce((total, s) => total + Number(s.valor), 0);

    // Instalações concluídas
    const instalacoesConcluidas = dadosFiltrados.instalacoes.filter(inst => inst.status === 'Concluído');
    const receitaInstalacoes = instalacoesConcluidas.reduce((total, instalacao) => total + instalacao.valor_total, 0);
    
    // Metragem total (valor / m²Price = M²)
    const metragemTotal = instalacoesConcluidas.reduce((total, instalacao) => total + (instalacao.valor_total / m2Price), 0);

    // Despesas
    const totalDespesas = dadosFiltrados.despesas.reduce((total, despesa) => total + despesa.valor, 0);
    const despesasPagas = dadosFiltrados.despesas.filter(despesa => despesa.paga).reduce((total, despesa) => total + despesa.valor, 0);
    const despesasPendentes = totalDespesas - despesasPagas;

    // Empréstimos - calcular valor restante
    const totalEmprestimos = dadosFiltrados.emprestimos.reduce((total, emprestimo) => {
      const pagamentosDoEmprestimo = pagamentosEmprestimo
        .filter(p => p.emprestimo_id === emprestimo.id)
        .reduce((sum, p) => sum + Number(p.valor_pago), 0);
      const valorRestante = Number(emprestimo.valor_atual) - pagamentosDoEmprestimo;
      return total + Math.max(0, valorRestante);
    }, 0);

    // Pagamentos no período
    const pagamentosNoPeriodo = pagamentosEmprestimo.filter(p => {
      const dataPagamento = new Date(p.data_pagamento);
      return isDateInPeriod(dataPagamento, dataInicio, dataFim);
    });
    const totalPagoNoPeriodo = pagamentosNoPeriodo.reduce((sum, p) => sum + Number(p.valor_pago), 0);

    // Dívidas
    const totalDividas = dadosFiltrados.dividasNegativadas
      .filter(divida => !divida.pago)
      .reduce((total, divida) => total + divida.valor_atual, 0);

    const dividasPagasNoPeriodo = dadosFiltrados.dividasNegativadas.filter(divida => {
      if (!divida.pago || !divida.data_pagamento) return false;
      const dataPagamento = new Date(divida.data_pagamento);
      return isDateInPeriod(dataPagamento, dataInicio, dataFim);
    });
    const valorDividasPagasNoPeriodo = dividasPagasNoPeriodo.reduce((sum, d) => sum + d.valor_atual, 0);

    // Serviços por status (Pago / Pendente)
    const servicosPorStatus = dadosFiltrados.servicos.reduce((acc, s) => {
      const k = s.pago ? 'Pago' : 'Pendente';
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Clientes novos no período
    const clientesNovos = dadosFiltrados.clientes.length;
    const totalClientesGeral = clientes.length;

    return {
      receitaServicos,
      receitaInstalacoes,
      metragemTotal,
      instalacoesConcluidas: instalacoesConcluidas.length,
      totalInstalacoes: dadosFiltrados.instalacoes.length,
      totalDespesas,
      despesasPagas,
      despesasPendentes,
      totalEmprestimos,
      totalPagoNoPeriodo,
      totalDividas,
      valorDividasPagasNoPeriodo,
      servicosPorStatus,
      clientesNovos,
      totalClientesGeral,
      receitaTotal: receitaServicos + receitaInstalacoes,
      saldoLiquido: receitaServicos + receitaInstalacoes - despesasPendentes - totalEmprestimos - totalDividas
    };
  }, [dadosFiltrados, pagamentosEmprestimo, clientes, periodoRelatorio, semanaEscolhida, mesEscolhido, anoEscolhido]);

  // Dados para os gráficos de evolução
  const dadosGrafico = useMemo(() => {
    const quantidadePeriodos = periodoRelatorio === 'semanal' ? 8 : periodoRelatorio === 'mensal' ? 6 : 5;
    const periodos = getHistoricoPeriodos(periodoRelatorio, quantidadePeriodos);
    
    return periodos.map(periodo => {
      // Filtrar instalações concluídas no período
      const instPeriodo = instalacoes.filter(inst => {
        const dataInst = new Date(inst.data_instalacao);
        return inst.status === 'Concluído' && isDateInPeriod(dataInst, periodo.inicio, periodo.fim);
      });
      
      const receitaInstalacoes = instPeriodo.reduce((sum, inst) => sum + Number(inst.valor_total), 0);
      const metragem = receitaInstalacoes / m2Price;
      
      // Filtrar serviços do período
      const servicosPeriodo = servicos.filter(s => {
        const dataServ = new Date(s.data_servico);
        return isDateInPeriod(dataServ, periodo.inicio, periodo.fim);
      });

      const receitaServicos = servicosPeriodo.reduce((total, s) => total + Number(s.valor), 0);
      
      // Filtrar despesas do período
      const despesasPeriodo = despesas.filter(desp => {
        const dataDesp = new Date(desp.data_vencimento);
        return isDateInPeriod(dataDesp, periodo.inicio, periodo.fim);
      });
      const totalDespesasPeriodo = despesasPeriodo.reduce((sum, d) => sum + Number(d.valor), 0);
      
      return {
        periodo: periodo.label,
        receita: receitaServicos + receitaInstalacoes,
        receitaServicos,
        receitaInstalacoes,
        instalacoes: instPeriodo.length,
        metragem,
        despesas: totalDespesasPeriodo
      };
    });
  }, [instalacoes, servicos, despesas, periodoRelatorio]);

  const hoje = new Date();
  const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  // Função de exportação atualizada
  const exportarRelatorio = (categoria: string) => {
    let dados = '';
    let nomeArquivo = '';
    
    const dataAtual = hoje.toLocaleDateString('pt-BR');
    const periodoLabel = formatPeriodo(periodoRelatorio, semanaEscolhida, mesEscolhido, anoEscolhido);
    const periodoNomeArquivo = periodoRelatorio === 'semanal' 
      ? `semana${semanaEscolhida}-${anoEscolhido}`
      : periodoRelatorio === 'mensal'
        ? `${nomesMeses[mesEscolhido].toLowerCase()}-${anoEscolhido}`
        : `anual-${anoEscolhido}`;

    switch (categoria) {
      case 'geral':
        dados = `Relatório Geral - ${periodoLabel}\n`;
        dados += `Gerado em: ${dataAtual}\n`;
        dados += `Tipo de Período: ${periodoRelatorio.toUpperCase()}\n\n`;
        dados += `=== RECEITAS ===\n`;
        dados += `Serviços: R$ ${metricas.receitaServicos.toFixed(2)}\n`;
        dados += `Instalações: R$ ${metricas.receitaInstalacoes.toFixed(2)}\n`;
        dados += `Total Receitas: R$ ${metricas.receitaTotal.toFixed(2)}\n\n`;
        dados += `=== INSTALAÇÕES ===\n`;
        dados += `Total: ${metricas.totalInstalacoes}\n`;
        dados += `Concluídas: ${metricas.instalacoesConcluidas}\n`;
        dados += `Metragem Total: ${metricas.metragemTotal.toFixed(2)} M²\n\n`;
        dados += `=== DESPESAS ===\n`;
        dados += `Total Despesas: R$ ${metricas.totalDespesas.toFixed(2)}\n`;
        dados += `Pagas: R$ ${metricas.despesasPagas.toFixed(2)}\n`;
        dados += `Pendentes: R$ ${metricas.despesasPendentes.toFixed(2)}\n\n`;
        dados += `=== RESUMO ===\n`;
        dados += `Clientes Novos no Período: ${metricas.clientesNovos}\n`;
        dados += `Total de Clientes: ${metricas.totalClientesGeral}\n`;
        dados += `Serviços no Período: ${dadosFiltrados.servicos.length}\n`;
        dados += `Empréstimos Restantes: R$ ${metricas.totalEmprestimos.toFixed(2)}\n`;
        dados += `Pagamentos de Empréstimos no Período: R$ ${metricas.totalPagoNoPeriodo.toFixed(2)}\n`;
        dados += `Dívidas Pendentes: R$ ${metricas.totalDividas.toFixed(2)}\n`;
        dados += `Dívidas Quitadas no Período: R$ ${metricas.valorDividasPagasNoPeriodo.toFixed(2)}\n`;
        dados += `\n=== SALDO ===\n`;
        dados += `Saldo Líquido: R$ ${metricas.saldoLiquido.toFixed(2)}\n`;
        nomeArquivo = `relatorio-geral-${periodoNomeArquivo}.txt`;
        break;
        
      case 'receita':
        dados = `Relatório de Receitas - ${periodoLabel}\n\n`;
        dados += `Serviços: R$ ${metricas.receitaServicos.toFixed(2)}\n`;
        dados += `Instalações Concluídas: R$ ${metricas.receitaInstalacoes.toFixed(2)}\n`;
        dados += `Total: R$ ${metricas.receitaTotal.toFixed(2)}\n`;
        nomeArquivo = `relatorio-receitas-${periodoNomeArquivo}.txt`;
        break;
        
      case 'despesas':
        dados = `Relatório de Despesas - ${periodoLabel}\n\n`;
        dados += `Total: R$ ${metricas.totalDespesas.toFixed(2)}\n`;
        dados += `Pagas: R$ ${metricas.despesasPagas.toFixed(2)}\n`;
        dados += `Pendentes: R$ ${metricas.despesasPendentes.toFixed(2)}\n\n`;
        dados += `Detalhamento:\n`;
        dadosFiltrados.despesas.forEach(despesa => {
          dados += `- ${despesa.nome}: R$ ${despesa.valor.toFixed(2)} ${despesa.paga ? '(PAGA)' : '(PENDENTE)'}\n`;
        });
        nomeArquivo = `relatorio-despesas-${periodoNomeArquivo}.txt`;
        break;

      case 'sites':
      case 'servicos':
        dados = `Relatório de Serviços - ${periodoLabel}\n\n`;
        dados += `Total de Serviços no Período: ${dadosFiltrados.servicos.length}\n`;
        dados += `Receita Total: R$ ${metricas.receitaServicos.toFixed(2)}\n\n`;
        dados += `Detalhamento:\n`;
        dadosFiltrados.servicos.forEach(s => {
          dados += `\nCliente: ${s.cliente_nome}\n`;
          dados += `Serviço: ${s.nome_servico}\n`;
          dados += `Valor: R$ ${Number(s.valor).toFixed(2)}\n`;
          dados += `Data: ${new Date(s.data_servico).toLocaleDateString('pt-BR')}\n`;
          dados += `Status: ${s.pago ? 'PAGO' : 'PENDENTE'}\n`;
          dados += `Descrição: ${s.descricao}\n`;
          dados += `---\n`;
        });
        nomeArquivo = `relatorio-servicos-${periodoNomeArquivo}.txt`;
        break;

      case 'instalacoes':
        dados = `Relatório de Instalações - ${periodoLabel}\n\n`;
        dados += `=== RESUMO ===\n`;
        dados += `Total de Instalações: ${metricas.totalInstalacoes}\n`;
        dados += `Instalações Concluídas: ${metricas.instalacoesConcluidas}\n`;
        dados += `Receita Total: R$ ${metricas.receitaInstalacoes.toFixed(2)}\n`;
        dados += `Metragem Total: ${metricas.metragemTotal.toFixed(2)} M²\n`;
        dados += `Média por Instalação: R$ ${metricas.instalacoesConcluidas > 0 ? (metricas.receitaInstalacoes / metricas.instalacoesConcluidas).toFixed(2) : '0.00'}\n`;
        dados += `Média M² por Instalação: ${metricas.instalacoesConcluidas > 0 ? (metricas.metragemTotal / metricas.instalacoesConcluidas).toFixed(2) : '0.00'} M²\n\n`;
        dados += `=== DETALHAMENTO ===\n`;
        dadosFiltrados.instalacoes.forEach(inst => {
          const metragem = inst.valor_total / m2Price;
          dados += `\nPedido: ${inst.numero_pedido}\n`;
          dados += `Arquiteto: ${inst.arquiteto_nome}\n`;
          dados += `Data: ${new Date(inst.data_instalacao).toLocaleDateString('pt-BR')}\n`;
          dados += `Status: ${inst.status}\n`;
          dados += `Valor: R$ ${inst.valor_total.toFixed(2)}\n`;
          dados += `Metragem: ${metragem.toFixed(2)} M²\n`;
          dados += `Ambiente: ${inst.ambiente}\n`;
          dados += `---\n`;
        });
        nomeArquivo = `relatorio-instalacoes-${periodoNomeArquivo}.txt`;
        break;

      case 'clientes':
        dados = `Relatório de Clientes - ${periodoLabel}\n\n`;
        dados += `Novos Clientes no Período: ${metricas.clientesNovos}\n`;
        dados += `Total de Clientes: ${metricas.totalClientesGeral}\n\n`;
        dados += `=== CLIENTES DO PERÍODO ===\n`;
        dadosFiltrados.clientes.forEach(cliente => {
          dados += `\nNome: ${cliente.nome}\n`;
          dados += `Email: ${cliente.email}\n`;
          dados += `Telefone: ${cliente.telefone}\n`;
          dados += `Cidade: ${cliente.cidade} - ${cliente.estado}\n`;
          dados += `Cadastrado em: ${new Date(cliente.created_at).toLocaleDateString('pt-BR')}\n`;
          dados += `---\n`;
        });
        nomeArquivo = `relatorio-clientes-${periodoNomeArquivo}.txt`;
        break;

      case 'emprestimos':
        dados = `Relatório de Empréstimos - ${periodoLabel}\n\n`;
        dados += `=== RESUMO ===\n`;
        dados += `Total Restante: R$ ${metricas.totalEmprestimos.toFixed(2)}\n`;
        dados += `Pagamentos no Período: R$ ${metricas.totalPagoNoPeriodo.toFixed(2)}\n\n`;
        dados += `=== DETALHAMENTO ===\n`;
        dadosFiltrados.emprestimos.forEach(emp => {
          const pagamentos = pagamentosEmprestimo
            .filter(p => p.emprestimo_id === emp.id)
            .reduce((sum, p) => sum + Number(p.valor_pago), 0);
          const restante = Number(emp.valor_atual) - pagamentos;
          dados += `\nNome: ${emp.nome}\n`;
          dados += `Valor Original: R$ ${Number(emp.valor_original).toFixed(2)}\n`;
          dados += `Valor Atual: R$ ${Number(emp.valor_atual).toFixed(2)}\n`;
          dados += `Total Pago: R$ ${pagamentos.toFixed(2)}\n`;
          dados += `Restante: R$ ${restante.toFixed(2)}\n`;
          dados += `---\n`;
        });
        nomeArquivo = `relatorio-emprestimos-${periodoNomeArquivo}.txt`;
        break;

      case 'dividas':
        dados = `Relatório de Dívidas Negativadas - ${periodoLabel}\n\n`;
        dados += `=== RESUMO ===\n`;
        dados += `Total Pendente: R$ ${metricas.totalDividas.toFixed(2)}\n`;
        dados += `Quitadas no Período: R$ ${metricas.valorDividasPagasNoPeriodo.toFixed(2)}\n\n`;
        dados += `=== DETALHAMENTO ===\n`;
        dadosFiltrados.dividasNegativadas.forEach(divida => {
          dados += `\nNome: ${divida.nome}\n`;
          dados += `Valor Original: R$ ${Number(divida.valor_original).toFixed(2)}\n`;
          dados += `Valor Atual: R$ ${Number(divida.valor_atual).toFixed(2)}\n`;
          dados += `Status: ${divida.pago ? 'PAGA' : 'PENDENTE'}\n`;
          if (divida.data_pagamento) {
            dados += `Data Pagamento: ${new Date(divida.data_pagamento).toLocaleDateString('pt-BR')}\n`;
          }
          dados += `---\n`;
        });
        nomeArquivo = `relatorio-dividas-${periodoNomeArquivo}.txt`;
        break;
    }

    const blob = new Blob([dados], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeArquivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ===== Export estruturado (CSV / PDF) — somente "Geral" =====
  const buildGeralSections = (): ReportSection[] => {
    const fmt = (n: number) => `R$ ${n.toFixed(2)}`;
    return [
      {
        title: 'Receitas',
        rows: [
          ['Serviços', fmt(metricas.receitaServicos)],
          ['Instalações', fmt(metricas.receitaInstalacoes)],
          ['Total Receitas', fmt(metricas.receitaTotal)],
        ],
      },
      {
        title: 'Instalações',
        rows: [
          ['Total', metricas.totalInstalacoes],
          ['Concluídas', metricas.instalacoesConcluidas],
          ['Metragem Total (M²)', metricas.metragemTotal.toFixed(2)],
        ],
      },
      {
        title: 'Despesas',
        rows: [
          ['Total', fmt(metricas.totalDespesas)],
          ['Pagas', fmt(metricas.despesasPagas)],
          ['Pendentes', fmt(metricas.despesasPendentes)],
        ],
      },
      {
        title: 'Dívidas & Empréstimos',
        rows: [
          ['Empréstimos restantes', fmt(metricas.totalEmprestimos)],
          ['Pagamentos no período', fmt(metricas.totalPagoNoPeriodo)],
          ['Dívidas pendentes', fmt(metricas.totalDividas)],
          ['Dívidas quitadas no período', fmt(metricas.valorDividasPagasNoPeriodo)],
        ],
      },
      {
        title: 'Resumo',
        rows: [
          ['Clientes novos no período', metricas.clientesNovos],
          ['Total de clientes', metricas.totalClientesGeral],
          ['Saldo Líquido', fmt(metricas.saldoLiquido)],
        ],
      },
    ];
  };

  const exportarGeralEstruturado = (format: 'csv' | 'pdf') => {
    const periodoLabel = formatPeriodo(periodoRelatorio, semanaEscolhida, mesEscolhido, anoEscolhido);
    const periodoNomeArquivo = periodoRelatorio === 'semanal'
      ? `semana${semanaEscolhida}-${anoEscolhido}`
      : periodoRelatorio === 'mensal'
        ? `${nomesMeses[mesEscolhido].toLowerCase()}-${anoEscolhido}`
        : `anual-${anoEscolhido}`;
    const filename = `relatorio-geral-${periodoNomeArquivo}`;
    const sections = buildGeralSections();
    if (format === 'csv') {
      exportReportCSV(filename, sections);
    } else {
      exportReportPDF(
        filename,
        'Relatório Geral KemaFinance',
        `${periodoLabel} • Gerado em ${hoje.toLocaleDateString('pt-BR')}`,
        sections,
      );
    }
  };

  if (isLoading) {
    return (
      <div className="p-3 md:p-6 pb-20 md:pb-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
          <div className="text-lg text-foreground">Carregando relatórios...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 pb-20 md:pb-6">
      <div className="flex flex-col gap-3 md:gap-4 md:flex-row md:items-center justify-between mb-4 md:mb-6">
        <div>
          <h1 className="page-title">Relatórios</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Análises {periodoRelatorio === 'semanal' ? 'semanais' : periodoRelatorio === 'mensal' ? 'mensais' : 'anuais'} de todos os dados
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="btn-tech px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors w-full md:w-auto">
              <Download className="w-4 h-4" />
              Exportar Geral
              <ChevronDown className="w-4 h-4 opacity-70" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => exportarRelatorio('geral')}>
              TXT (texto)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportarGeralEstruturado('csv')}>
              CSV (Excel)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportarGeralEstruturado('pdf')}>
              PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Componente de Filtros */}
      <RelatorioFilter
        periodoRelatorio={periodoRelatorio}
        semanaEscolhida={semanaEscolhida}
        mesEscolhido={mesEscolhido}
        anoEscolhido={anoEscolhido}
        tipoRelatorio={tipoRelatorio}
        onPeriodoChange={setPeriodoRelatorio}
        onSemanaChange={setSemanaEscolhida}
        onMesChange={setMesEscolhido}
        onAnoChange={setAnoEscolhido}
        onTipoChange={setTipoRelatorio}
        onResetFilter={resetarFiltros}
      />

      {/* Card de Resumo do Período */}
      <Card className="card-tech mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm md:text-base">
            <FileText className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
            Resumo: {formatPeriodo(periodoRelatorio, semanaEscolhida, mesEscolhido, anoEscolhido)}
          </CardTitle>
          <CardDescription className="text-xs md:text-sm text-muted-foreground">
            Métricas consolidadas do período selecionado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="p-3 bg-orange-500/10 border border-border rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Scissors className="w-4 h-4 text-orange-500" />
                <span className="text-xs text-muted-foreground">Instalações</span>
              </div>
              <div className="text-lg md:text-xl font-bold text-orange-500">{metricas.instalacoesConcluidas}</div>
              <div className="text-xs text-muted-foreground">de {metricas.totalInstalacoes} total</div>
            </div>
            
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className="text-xs text-muted-foreground">Receita</span>
              </div>
              <div className="text-lg md:text-xl font-bold text-green-500">R$ {metricas.receitaTotal.toFixed(0)}</div>
              <div className="text-xs text-muted-foreground">total do período</div>
            </div>
            
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Ruler className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-muted-foreground">Metragem</span>
              </div>
              <div className="text-lg md:text-xl font-bold text-blue-500">{metricas.metragemTotal.toFixed(0)} M²</div>
              <div className="text-xs text-muted-foreground">instalado</div>
            </div>
            
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="w-4 h-4 text-red-500" />
                <span className="text-xs text-muted-foreground">Despesas</span>
              </div>
              <div className="text-lg md:text-xl font-bold text-red-500">R$ {metricas.totalDespesas.toFixed(0)}</div>
              <div className="text-xs text-muted-foreground">{metricas.despesasPendentes > 0 ? `R$ ${metricas.despesasPendentes.toFixed(0)} pendente` : 'Tudo pago'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="visao-geral" className="space-y-4 md:space-y-6">
        <TabsList className={`grid w-full ${isMobile ? 'grid-cols-3 h-auto gap-1' : 'grid-cols-5'} bg-background/50 border border-border`}>
          <TabsTrigger value="visao-geral" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs md:text-sm">Visão Geral</TabsTrigger>
          <TabsTrigger value="graficos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs md:text-sm">Gráficos</TabsTrigger>
          <TabsTrigger value="financeiro" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs md:text-sm">Financeiro</TabsTrigger>
          <TabsTrigger value="operacional" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs md:text-sm">Operacional</TabsTrigger>
          <TabsTrigger value="detalhado" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs md:text-sm">Detalhado</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral" className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            <Card className="card-tech">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Total Clientes</CardTitle>
                <Users className="h-3 w-3 md:h-4 md:w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-2xl font-bold text-orange-500">{metricas.totalClientesGeral}</div>
                <p className="text-xs text-muted-foreground">+{metricas.clientesNovos} no período</p>
              </CardContent>
            </Card>

            <Card className="card-tech">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Serviços</CardTitle>
                <Globe className="h-3 w-3 md:h-4 md:w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-2xl font-bold text-orange-500">{dadosFiltrados.servicos.length}</div>
                <p className="text-xs text-muted-foreground">no período</p>
              </CardContent>
            </Card>

            <Card className="card-tech">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Receita Total</CardTitle>
                <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-sm md:text-2xl font-bold text-green-500">R$ {metricas.receitaTotal.toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card className="card-tech">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Instalações</CardTitle>
                <Scissors className="h-3 w-3 md:h-4 md:w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-2xl font-bold text-orange-500">{metricas.instalacoesConcluidas}</div>
                <p className="text-xs text-muted-foreground">{metricas.metragemTotal.toFixed(0)} M²</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            <Card className="card-tech">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Despesas</CardTitle>
                <CreditCard className="h-3 w-3 md:h-4 md:w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-sm md:text-2xl font-bold text-red-500">R$ {metricas.totalDespesas.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {metricas.despesasPendentes > 0 ? `R$ ${metricas.despesasPendentes.toFixed(2)} pendente` : 'Tudo pago'}
                </p>
              </CardContent>
            </Card>

            <Card className="card-tech">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Empréstimos</CardTitle>
                <Banknote className="h-3 w-3 md:h-4 md:w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-sm md:text-2xl font-bold text-yellow-500">R$ {metricas.totalEmprestimos.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">R$ {metricas.totalPagoNoPeriodo.toFixed(0)} pago</p>
              </CardContent>
            </Card>

            <Card className="card-tech">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Dívidas</CardTitle>
                <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-sm md:text-2xl font-bold text-red-500">R$ {metricas.totalDividas.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">R$ {metricas.valorDividasPagasNoPeriodo.toFixed(0)} quitado</p>
              </CardContent>
            </Card>

            <Card className="card-tech">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Saldo Líquido</CardTitle>
                <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className={`text-sm md:text-2xl font-bold ${metricas.saldoLiquido >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  R$ {metricas.saldoLiquido.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Gráficos */}
        <TabsContent value="graficos" className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Gráfico de Evolução de Receitas */}
            <Card className="card-tech">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                  <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
                  Evolução de Receitas
                </CardTitle>
                <CardDescription className="text-xs md:text-sm text-muted-foreground">
                  Comparativo de receitas por período ({periodoRelatorio})
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <RelatorioChart 
                  data={dadosGrafico}
                  tipo="area"
                  metricas={['receitaServicos', 'receitaInstalacoes']}
                  showTabs={true}
                />
              </CardContent>
            </Card>

            {/* Gráfico de Instalações e Metragem */}
            <Card className="card-tech">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                  <Scissors className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
                  Instalações e Metragem
                </CardTitle>
                <CardDescription className="text-xs md:text-sm text-muted-foreground">
                  Receita vs Metragem instalada (M² = valor / R$ {m2Price.toFixed(2)})
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <RelatorioChart 
                  data={dadosGrafico}
                  tipo="combinado"
                  metricas={['receitaInstalacoes', 'metragem']}
                />
              </CardContent>
            </Card>
          </div>

          {/* Linha completa - Balanço Geral */}
          <Card className="card-tech">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
                Balanço Geral: Receitas vs Despesas
              </CardTitle>
              <CardDescription className="text-xs md:text-sm text-muted-foreground">
                Evolução comparativa do período ({periodoRelatorio})
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <RelatorioChart 
                data={dadosGrafico}
                tipo="barra"
                metricas={['receita', 'despesas']}
              />
            </CardContent>
          </Card>

          {/* Cards com resumo dos dados do gráfico */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="p-3 bg-orange-500/10 border border-border rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Total Instalações</div>
              <div className="text-lg md:text-xl font-bold text-orange-500">
                {dadosGrafico.reduce((sum, d) => sum + (d.instalacoes || 0), 0)}
              </div>
              <div className="text-xs text-muted-foreground">nos últimos períodos</div>
            </div>
            
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Receita Total</div>
              <div className="text-lg md:text-xl font-bold text-green-500">
                R$ {dadosGrafico.reduce((sum, d) => sum + (d.receita || 0), 0).toFixed(0)}
              </div>
              <div className="text-xs text-muted-foreground">acumulado</div>
            </div>
            
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Metragem Total</div>
              <div className="text-lg md:text-xl font-bold text-blue-500">
                {dadosGrafico.reduce((sum, d) => sum + (d.metragem || 0), 0).toFixed(0)} M²
              </div>
              <div className="text-xs text-muted-foreground">instalados</div>
            </div>
            
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Despesas Total</div>
              <div className="text-lg md:text-xl font-bold text-red-500">
                R$ {dadosGrafico.reduce((sum, d) => sum + (d.despesas || 0), 0).toFixed(0)}
              </div>
              <div className="text-xs text-muted-foreground">acumulado</div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="financeiro" className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Card className="card-tech">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                  <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
                  Receitas - {formatPeriodo(periodoRelatorio, semanaEscolhida, mesEscolhido, anoEscolhido)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                <div className="flex justify-between items-center p-2 md:p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <span className="font-medium text-xs md:text-sm text-foreground">Serviços</span>
                  <span className="text-sm md:text-lg font-bold text-blue-500">R$ {metricas.receitaServicos.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-2 md:p-3 bg-orange-500/10 border border-border rounded-lg">
                  <span className="font-medium text-xs md:text-sm text-foreground">Instalações</span>
                  <span className="text-sm md:text-lg font-bold text-orange-500">R$ {metricas.receitaInstalacoes.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-2 md:p-3 bg-green-500/10 border-2 border-green-500/50 rounded-lg">
                  <span className="font-bold text-xs md:text-sm text-foreground">Total</span>
                  <span className="text-lg md:text-xl font-bold text-green-500">R$ {metricas.receitaTotal.toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => exportarRelatorio('receita')}
                  className="w-full mt-4 btn-tech px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
                >
                  <Download className="w-4 h-4" />
                  Exportar Receitas
                </button>
              </CardContent>
            </Card>

            <Card className="card-tech">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                  <CreditCard className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
                  Despesas - {formatPeriodo(periodoRelatorio, semanaEscolhida, mesEscolhido, anoEscolhido)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-2 border border-red-500/30 rounded text-xs md:text-sm bg-red-500/10">
                  <span className="text-foreground">Total do Período</span>
                  <span className="font-semibold text-red-500">R$ {metricas.totalDespesas.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-2 border border-green-500/30 rounded text-xs md:text-sm bg-green-500/10">
                  <span className="text-foreground">Pagas</span>
                  <span className="font-semibold text-green-500">R$ {metricas.despesasPagas.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-2 border border-yellow-500/30 rounded text-xs md:text-sm bg-yellow-500/10">
                  <span className="text-foreground">Pendentes</span>
                  <span className="font-semibold text-yellow-500">R$ {metricas.despesasPendentes.toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => exportarRelatorio('despesas')}
                  className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
                >
                  <Download className="w-4 h-4" />
                  Exportar Despesas
                </button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operacional" className="space-y-4 md:space-y-6">
          <Card className="card-tech">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                <Scissors className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
                Instalações - {formatPeriodo(periodoRelatorio, semanaEscolhida, mesEscolhido, anoEscolhido)}
              </CardTitle>
              <CardDescription className="text-xs md:text-sm text-muted-foreground">
                Controle de instalações do período selecionado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                const instalacoesConcluidas = dadosFiltrados.instalacoes.filter(inst => inst.status === 'Concluído');
                const instalacoesAgendadas = dadosFiltrados.instalacoes.filter(inst => inst.status === 'Agendado');
                const instalacoesCanceladas = dadosFiltrados.instalacoes.filter(inst => inst.status === 'Cancelado');
                
                const receitaConcluidas = instalacoesConcluidas.reduce((sum, inst) => sum + Number(inst.valor_total), 0);
                const metragemConcluidas = receitaConcluidas / m2Price;

                return (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 md:p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <h4 className="font-medium text-green-400 mb-2 text-sm">Concluídas</h4>
                        <div className="text-xl md:text-2xl font-bold text-green-500">{instalacoesConcluidas.length}</div>
                        <p className="text-xs md:text-sm text-muted-foreground">instalações</p>
                        <div className="mt-2 text-xs md:text-sm text-green-400">
                          R$ {receitaConcluidas.toFixed(2)} | {metragemConcluidas.toFixed(0)} M²
                        </div>
                      </div>
                      
                      <div className="p-3 md:p-4 bg-orange-500/10 border border-border rounded-lg">
                        <h4 className="font-medium text-orange-400 mb-2 text-sm">Agendadas</h4>
                        <div className="text-xl md:text-2xl font-bold text-orange-500">{instalacoesAgendadas.length}</div>
                        <p className="text-xs md:text-sm text-muted-foreground">instalações</p>
                      </div>

                      <div className="p-3 md:p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <h4 className="font-medium text-red-400 mb-2 text-sm">Canceladas</h4>
                        <div className="text-xl md:text-2xl font-bold text-red-500">{instalacoesCanceladas.length}</div>
                        <p className="text-xs md:text-sm text-muted-foreground">instalações</p>
                      </div>
                    </div>

                    <div className="p-3 md:p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <h4 className="font-medium text-blue-400 mb-2 text-sm">Total do Período</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-xl md:text-2xl font-bold text-blue-500">{dadosFiltrados.instalacoes.length}</div>
                          <p className="text-xs text-muted-foreground">instalações</p>
                        </div>
                        <div>
                          <div className="text-xl md:text-2xl font-bold text-green-500">R$ {metricas.receitaInstalacoes.toFixed(0)}</div>
                          <p className="text-xs text-muted-foreground">receita</p>
                        </div>
                        <div>
                          <div className="text-xl md:text-2xl font-bold text-orange-500">{metricas.metragemTotal.toFixed(0)} M²</div>
                          <p className="text-xs text-muted-foreground">metragem</p>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
              
              <button 
                onClick={() => exportarRelatorio('instalacoes')}
                className="w-full btn-tech px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                Exportar Relatório de Instalações
              </button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Card className="card-tech">
              <CardHeader>
                <CardTitle className="text-sm md:text-base text-foreground">Próximos Serviços</CardTitle>
                <CardDescription className="text-xs md:text-sm text-muted-foreground">Serviços agendados nos próximos 30 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(() => {
                    const proximos = servicos
                      .filter(s => {
                        if (s.pago) return false;
                        const dataServ = new Date(s.data_servico);
                        const em30Dias = new Date();
                        em30Dias.setDate(hoje.getDate() + 30);
                        return dataServ <= em30Dias && dataServ >= hoje;
                      })
                      .slice(0, 5);
                    if (proximos.length === 0) {
                      return <p className="text-xs md:text-sm text-muted-foreground">Nenhum serviço próximo</p>;
                    }
                    return proximos.map(s => (
                      <div key={s.id} className="flex justify-between items-center p-2 border border-border rounded bg-background/50">
                        <div>
                          <div className="font-medium text-xs md:text-sm text-foreground">{s.cliente_nome}</div>
                          <div className="text-xs text-muted-foreground">
                            {s.nome_servico} — {new Date(s.data_servico).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                        <div className="text-xs md:text-sm font-medium text-orange-500">R$ {Number(s.valor).toFixed(2)}</div>
                      </div>
                    ));
                  })()}
                </div>
              </CardContent>
            </Card>

            <Card className="card-tech">
              <CardHeader>
                <CardTitle className="text-sm md:text-base text-foreground">Instalações Agendadas</CardTitle>
                <CardDescription className="text-xs md:text-sm text-muted-foreground">Próximas instalações a serem realizadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {instalacoes
                    .filter(inst => inst.status === 'Agendado')
                    .slice(0, 5)
                    .map((instalacao) => (
                      <div key={instalacao.id} className="flex justify-between items-center p-2 border border-border rounded bg-background/50">
                        <div>
                          <div className="font-medium text-xs md:text-sm text-foreground">{instalacao.arquiteto_nome}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(instalacao.data_instalacao).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                        <div className="text-xs md:text-sm font-medium text-orange-500">R$ {instalacao.valor_total.toFixed(2)}</div>
                      </div>
                    ))}
                  {instalacoes.filter(inst => inst.status === 'Agendado').length === 0 && (
                    <p className="text-xs md:text-sm text-muted-foreground">Nenhuma instalação agendada</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="detalhado" className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <Card className="card-tech">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm md:text-base text-foreground">
                  <Globe className="w-4 h-4 text-orange-500" />
                  Serviços
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(metricas.servicosPorStatus).map(([status, quantidade]) => (
                  <div key={status} className="flex justify-between items-center p-2 border border-orange-500/20 rounded text-xs md:text-sm bg-background/50">
                    <span className="text-foreground">{status}</span>
                    <span className="font-semibold text-orange-500">{quantidade}</span>
                  </div>
                ))}
                <button 
                  onClick={() => exportarRelatorio('sites')}
                  className="w-full mt-3 btn-tech px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-xs"
                >
                  <Download className="w-3 h-3" />
                  Exportar
                </button>
              </CardContent>
            </Card>

            <Card className="card-tech">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm md:text-base text-foreground">
                  <Users className="w-4 h-4 text-orange-500" />
                  Clientes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center p-2 border border-orange-500/20 rounded text-xs md:text-sm bg-background/50">
                  <span className="text-foreground">Total</span>
                  <span className="font-semibold text-orange-500">{metricas.totalClientesGeral}</span>
                </div>
                <div className="flex justify-between items-center p-2 border border-green-500/20 rounded text-xs md:text-sm bg-green-500/5">
                  <span className="text-foreground">Novos no período</span>
                  <span className="font-semibold text-green-500">+{metricas.clientesNovos}</span>
                </div>
                <button 
                  onClick={() => exportarRelatorio('clientes')}
                  className="w-full mt-3 btn-tech px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-xs"
                >
                  <Download className="w-3 h-3" />
                  Exportar
                </button>
              </CardContent>
            </Card>

            <Card className="card-tech">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm md:text-base text-foreground">
                  <Banknote className="w-4 h-4 text-yellow-500" />
                  Empréstimos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center p-2 border border-yellow-500/20 rounded text-xs md:text-sm bg-yellow-500/5">
                  <span className="text-foreground">Saldo Devedor</span>
                  <span className="font-semibold text-yellow-500">R$ {metricas.totalEmprestimos.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-2 border border-green-500/20 rounded text-xs md:text-sm bg-green-500/5">
                  <span className="text-foreground">Pago no período</span>
                  <span className="font-semibold text-green-500">R$ {metricas.totalPagoNoPeriodo.toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => exportarRelatorio('emprestimos')}
                  className="w-full mt-3 btn-tech px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-xs"
                >
                  <Download className="w-3 h-3" />
                  Exportar
                </button>
              </CardContent>
            </Card>

            <Card className="card-tech">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm md:text-base text-foreground">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Dívidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center p-2 border border-red-500/20 rounded text-xs md:text-sm bg-red-500/5">
                  <span className="text-foreground">Pendente</span>
                  <span className="font-semibold text-red-500">R$ {metricas.totalDividas.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-2 border border-green-500/20 rounded text-xs md:text-sm bg-green-500/5">
                  <span className="text-foreground">Quitado no período</span>
                  <span className="font-semibold text-green-500">R$ {metricas.valorDividasPagasNoPeriodo.toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => exportarRelatorio('dividas')}
                  className="w-full mt-3 btn-tech px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-xs"
                >
                  <Download className="w-3 h-3" />
                  Exportar
                </button>
              </CardContent>
            </Card>

            <Card className="card-tech md:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm md:text-base text-foreground">Resumo Consolidado</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  {formatPeriodo(periodoRelatorio, semanaEscolhida, mesEscolhido, anoEscolhido)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs md:text-sm">
                  <div className="flex justify-between p-2 bg-background/50 rounded border border-orange-500/20">
                    <span className="text-muted-foreground">Clientes:</span>
                    <span className="font-semibold text-foreground">{metricas.totalClientesGeral}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-background/50 rounded border border-orange-500/20">
                    <span className="text-muted-foreground">Serviços período:</span>
                    <span className="font-semibold text-foreground">{dadosFiltrados.servicos.length}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-background/50 rounded border border-orange-500/20">
                    <span className="text-muted-foreground">Instalações:</span>
                    <span className="font-semibold text-foreground">{metricas.totalInstalacoes}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-background/50 rounded border border-orange-500/20">
                    <span className="text-muted-foreground">Metragem:</span>
                    <span className="font-semibold text-foreground">{metricas.metragemTotal.toFixed(0)} M²</span>
                  </div>
                  <div className="flex justify-between p-2 bg-background/50 rounded border border-orange-500/20">
                    <span className="text-muted-foreground">Despesas:</span>
                    <span className="font-semibold text-foreground">{dadosFiltrados.despesas.length}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-background/50 rounded border border-orange-500/20">
                    <span className="text-muted-foreground">Empréstimos:</span>
                    <span className="font-semibold text-foreground">{dadosFiltrados.emprestimos.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
