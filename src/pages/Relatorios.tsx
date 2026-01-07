import React, { useState } from 'react';
import { FileText, Download, TrendingUp, Scissors, Calendar, DollarSign, Users, Globe, CreditCard, AlertTriangle, Banknote } from 'lucide-react';
import { useIsMobile } from '../hooks/use-mobile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useSites, useClientes, useInstalacoes, useDespesas, useEmprestimos, usePagamentosEmprestimo, useDividasNegativadas } from '../hooks/useSupabaseData';
import { RelatorioFilter } from '../components/RelatorioFilter';

export const Relatorios = () => {
  const { data: sites = [], isLoading: sitesLoading } = useSites();
  const { data: clientes = [], isLoading: clientesLoading } = useClientes();
  const { data: instalacoes = [], isLoading: instalacoesLoading } = useInstalacoes();
  const { data: despesas = [], isLoading: despesasLoading } = useDespesas();
  const { data: emprestimos = [], isLoading: emprestimosLoading } = useEmprestimos();
  const { data: pagamentosEmprestimo = [], isLoading: pagamentosLoading } = usePagamentosEmprestimo();
  const { data: dividasNegativadas = [], isLoading: dividasLoading } = useDividasNegativadas();
  
  const [mesEscolhido, setMesEscolhido] = useState(new Date().getMonth());
  const [anoEscolhido, setAnoEscolhido] = useState(new Date().getFullYear());
  const [tipoRelatorio, setTipoRelatorio] = useState('todos');
  const isMobile = useIsMobile();

  const isLoading = sitesLoading || clientesLoading || instalacoesLoading || despesasLoading || emprestimosLoading || pagamentosLoading || dividasLoading;

  // Função para resetar filtros
  const resetarFiltros = () => {
    setMesEscolhido(new Date().getMonth());
    setAnoEscolhido(new Date().getFullYear());
    setTipoRelatorio('todos');
  };

  // Função para filtrar dados por período e tipo
  const filtrarDadosPorPeriodo = (mes: number, ano: number, tipo: string) => {
    let dadosFiltrados = {
      sites: sites,
      clientes: clientes,
      instalacoes: instalacoes,
      despesas: despesas,
      emprestimos: emprestimos,
      dividasNegativadas: dividasNegativadas
    };

    // Filtrar instalações por período
    if (tipo === 'instalacoes' || tipo === 'todos') {
      dadosFiltrados.instalacoes = instalacoes.filter(instalacao => {
        const dataInstalacao = new Date(instalacao.data_instalacao);
        return dataInstalacao.getMonth() === mes && dataInstalacao.getFullYear() === ano;
      });
    }

    // Filtrar sites ativos com vencimento no período
    if (tipo === 'sites' || tipo === 'todos') {
      dadosFiltrados.sites = sites.filter(site => {
        if (site.status !== 'Ativo') return false;
        const dataVencimento = new Date(site.data_vencimento);
        return dataVencimento.getMonth() === mes && dataVencimento.getFullYear() === ano;
      });
    }

    // Filtrar despesas por período
    if (tipo === 'despesas' || tipo === 'todos') {
      dadosFiltrados.despesas = despesas.filter(despesa => {
        const dataDespesa = new Date(despesa.data_vencimento);
        return dataDespesa.getMonth() === mes && dataDespesa.getFullYear() === ano;
      });
    }

    // Para clientes, empréstimos e dívidas, mantém todos se não for filtro específico
    if (tipo === 'clientes' || tipo === 'todos') {
      dadosFiltrados.clientes = clientes;
    }
    if (tipo === 'emprestimos' || tipo === 'todos') {
      dadosFiltrados.emprestimos = emprestimos;
    }
    if (tipo === 'dividas' || tipo === 'todos') {
      dadosFiltrados.dividasNegativadas = dividasNegativadas;
    }

    return dadosFiltrados;
  };

  // Dados filtrados
  const dadosFiltrados = filtrarDadosPorPeriodo(mesEscolhido, anoEscolhido, tipoRelatorio);
  
  // Cálculos gerais
  const hoje = new Date();
  const inicioMesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fimMesAtual = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

  // Receitas de Sites (só planos com assinatura + hospedagem)
  const receitaMensalSites = dadosFiltrados.sites
    .filter(site => site.status === 'Ativo')
    .reduce((total, site) => {
      let valorSite = 0;
      // Adiciona valor mensal se for plano com assinatura
      if (site.tipo_plano.toLowerCase().includes('assinatura')) {
        valorSite += Number(site.valor_mensal);
      }
      // Adiciona R$ 40 se tiver hospedagem
      if (site.hospedagem) {
        valorSite += 40;
      }
      return total + valorSite;
    }, 0);

  const receitaInstalacoes = dadosFiltrados.instalacoes
    .filter(inst => inst.status === 'Concluído')
    .reduce((total, instalacao) => total + instalacao.valor_total, 0);

  // Despesas
  const totalDespesas = dadosFiltrados.despesas
    .reduce((total, despesa) => total + despesa.valor, 0);

  const despesasPagas = dadosFiltrados.despesas
    .filter(despesa => despesa.paga)
    .reduce((total, despesa) => total + despesa.valor, 0);

  const despesasPendentes = totalDespesas - despesasPagas;

  // Empréstimos - calcular valor restante (valor_atual - pagamentos)
  const totalEmprestimos = dadosFiltrados.emprestimos
    .reduce((total, emprestimo) => {
      const pagamentosDoEmprestimo = pagamentosEmprestimo
        .filter(p => p.emprestimo_id === emprestimo.id)
        .reduce((sum, p) => sum + Number(p.valor_pago), 0);
      const valorRestante = Number(emprestimo.valor_atual) - pagamentosDoEmprestimo;
      return total + Math.max(0, valorRestante);
    }, 0);

  // Dívidas
  const totalDividas = dadosFiltrados.dividasNegativadas
    .filter(divida => !divida.pago)
    .reduce((total, divida) => total + divida.valor_atual, 0);

  // Sites por status
  const sitesPorStatus = dadosFiltrados.sites.reduce((acc, site) => {
    acc[site.status] = (acc[site.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const exportarRelatorio = (categoria: string) => {
    let dados = '';
    let nomeArquivo = '';
    const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    const dataAtual = hoje.toLocaleDateString('pt-BR');
    const periodoSelecionado = `${nomesMeses[mesEscolhido]} ${anoEscolhido}`;

    switch (categoria) {
      case 'geral':
        dados = `Relatório Geral - ${dataAtual}\n`;
        dados += `Período: ${periodoSelecionado}\n\n`;
        dados += `=== RECEITAS ===\n`;
        dados += `Sites Ativos: R$ ${receitaMensalSites.toFixed(2)}\n`;
        dados += `Instalações: R$ ${receitaInstalacoes.toFixed(2)}\n`;
        dados += `Total Receitas: R$ ${(receitaMensalSites + receitaInstalacoes).toFixed(2)}\n\n`;
        dados += `=== DESPESAS ===\n`;
        dados += `Total Despesas: R$ ${totalDespesas.toFixed(2)}\n`;
        dados += `Pagas: R$ ${despesasPagas.toFixed(2)}\n`;
        dados += `Pendentes: R$ ${despesasPendentes.toFixed(2)}\n\n`;
        dados += `=== RESUMO ===\n`;
        dados += `Clientes: ${dadosFiltrados.clientes.length}\n`;
        dados += `Sites Ativos: ${sitesPorStatus['Ativo'] || 0}\n`;
        dados += `Instalações: ${dadosFiltrados.instalacoes.length}\n`;
        dados += `Empréstimos Restantes: R$ ${totalEmprestimos.toFixed(2)}\n`;
        dados += `Dívidas Pendentes: R$ ${totalDividas.toFixed(2)}\n`;
        nomeArquivo = `relatorio-geral-${periodoSelecionado.replace(' ', '-')}.txt`;
        break;
        
      case 'receita':
        dados = `Relatório de Receitas - ${periodoSelecionado}\n\n`;
        dados += `Sites Ativos: R$ ${receitaMensalSites.toFixed(2)}\n`;
        dados += `Instalações Concluídas: R$ ${receitaInstalacoes.toFixed(2)}\n`;
        dados += `Total: R$ ${(receitaMensalSites + receitaInstalacoes).toFixed(2)}\n`;
        nomeArquivo = `relatorio-receitas-${periodoSelecionado.replace(' ', '-')}.txt`;
        break;
        
      case 'despesas':
        dados = `Relatório de Despesas - ${periodoSelecionado}\n\n`;
        dados += `Total: R$ ${totalDespesas.toFixed(2)}\n`;
        dados += `Pagas: R$ ${despesasPagas.toFixed(2)}\n`;
        dados += `Pendentes: R$ ${despesasPendentes.toFixed(2)}\n\n`;
        dados += `Detalhamento:\n`;
        dadosFiltrados.despesas.forEach(despesa => {
          dados += `- ${despesa.nome}: R$ ${despesa.valor.toFixed(2)} ${despesa.paga ? '(PAGA)' : '(PENDENTE)'}\n`;
        });
        nomeArquivo = `relatorio-despesas-${periodoSelecionado.replace(' ', '-')}.txt`;
        break;

      case 'sites':
        dados = `Relatório de Sites - ${periodoSelecionado}\n\n`;
        dados += `Total de Sites Ativos: ${dadosFiltrados.sites.filter(s => s.status === 'Ativo').length}\n\n`;
        dadosFiltrados.sites.forEach(site => {
          dados += `Cliente: ${site.cliente_nome}\n`;
          dados += `Status: ${site.status}\n`;
          dados += `Plano: ${site.tipo_plano}\n`;
          dados += `Valor Mensal: R$ ${site.valor_mensal.toFixed(2)}\n`;
          dados += `Vencimento: ${new Date(site.data_vencimento).toLocaleDateString('pt-BR')}\n`;
          dados += `---\n`;
        });
        nomeArquivo = `relatorio-sites-${periodoSelecionado.replace(' ', '-')}.txt`;
        break;

      case 'instalacoes':
        dados = `Relatório de Instalações - ${periodoSelecionado}\n\n`;
        dados += `Total de Instalações: ${dadosFiltrados.instalacoes.length}\n`;
        dados += `Receita Total: R$ ${receitaInstalacoes.toFixed(2)}\n\n`;
        dadosFiltrados.instalacoes.forEach(inst => {
          dados += `Pedido: ${inst.numero_pedido}\n`;
          dados += `Arquiteto: ${inst.arquiteto_nome}\n`;
          dados += `Data: ${new Date(inst.data_instalacao).toLocaleDateString('pt-BR')}\n`;
          dados += `Status: ${inst.status}\n`;
          dados += `Valor: R$ ${inst.valor_total.toFixed(2)}\n`;
          dados += `---\n`;
        });
        nomeArquivo = `relatorio-instalacoes-${periodoSelecionado.replace(' ', '-')}.txt`;
        break;

      case 'clientes':
        dados = `Relatório de Clientes - ${dataAtual}\n\n`;
        dados += `Total de Clientes: ${dadosFiltrados.clientes.length}\n\n`;
        dadosFiltrados.clientes.forEach(cliente => {
          dados += `Nome: ${cliente.nome}\n`;
          dados += `Email: ${cliente.email}\n`;
          dados += `Telefone: ${cliente.telefone}\n`;
          dados += `Cidade: ${cliente.cidade} - ${cliente.estado}\n`;
          dados += `---\n`;
        });
        nomeArquivo = `relatorio-clientes-${dataAtual.replace(/\//g, '-')}.txt`;
        break;

      case 'emprestimos':
        dados = `Relatório de Empréstimos - ${dataAtual}\n\n`;
        dados += `Total Restante: R$ ${totalEmprestimos.toFixed(2)}\n\n`;
        dadosFiltrados.emprestimos.forEach(emp => {
          const pagamentos = pagamentosEmprestimo
            .filter(p => p.emprestimo_id === emp.id)
            .reduce((sum, p) => sum + Number(p.valor_pago), 0);
          const restante = Number(emp.valor_atual) - pagamentos;
          dados += `Nome: ${emp.nome}\n`;
          dados += `Valor Original: R$ ${Number(emp.valor_original).toFixed(2)}\n`;
          dados += `Valor Atual: R$ ${Number(emp.valor_atual).toFixed(2)}\n`;
          dados += `Pago: R$ ${pagamentos.toFixed(2)}\n`;
          dados += `Restante: R$ ${restante.toFixed(2)}\n`;
          dados += `---\n`;
        });
        nomeArquivo = `relatorio-emprestimos-${dataAtual.replace(/\//g, '-')}.txt`;
        break;

      case 'dividas':
        dados = `Relatório de Dívidas Negativadas - ${dataAtual}\n\n`;
        dados += `Total Pendente: R$ ${totalDividas.toFixed(2)}\n\n`;
        dadosFiltrados.dividasNegativadas.forEach(divida => {
          dados += `Nome: ${divida.nome}\n`;
          dados += `Valor Original: R$ ${Number(divida.valor_original).toFixed(2)}\n`;
          dados += `Valor Atual: R$ ${Number(divida.valor_atual).toFixed(2)}\n`;
          dados += `Status: ${divida.pago ? 'PAGA' : 'PENDENTE'}\n`;
          dados += `---\n`;
        });
        nomeArquivo = `relatorio-dividas-${dataAtual.replace(/\//g, '-')}.txt`;
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

  const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  if (isLoading) {
    return (
      <div className="p-3 md:p-6 pb-20 md:pb-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando relatórios...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 pb-20 md:pb-6">
      <div className="flex flex-col gap-3 md:gap-4 md:flex-row md:items-center justify-between mb-4 md:mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Relatórios</h1>
          <p className="text-sm md:text-base text-muted-foreground">Análises completas de todos os dados do sistema</p>
        </div>
        <button 
          onClick={() => exportarRelatorio('geral')}
          className="btn-tech px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors w-full md:w-auto"
        >
          <Download className="w-4 h-4" />
          Exportar Geral
        </button>
      </div>

      {/* Componente de Filtros */}
      <RelatorioFilter
        mesEscolhido={mesEscolhido}
        anoEscolhido={anoEscolhido}
        tipoRelatorio={tipoRelatorio}
        onMesChange={setMesEscolhido}
        onAnoChange={setAnoEscolhido}
        onTipoChange={setTipoRelatorio}
        onResetFilter={resetarFiltros}
      />

      <Tabs defaultValue="visao-geral" className="space-y-4 md:space-y-6">
        <TabsList className={`grid w-full ${isMobile ? 'grid-cols-1 h-auto' : 'grid-cols-4'}`}>
          <TabsTrigger value="visao-geral" className={isMobile ? 'mb-1' : ''}>Visão Geral</TabsTrigger>
          <TabsTrigger value="financeiro" className={isMobile ? 'mb-1' : ''}>Financeiro</TabsTrigger>
          <TabsTrigger value="operacional" className={isMobile ? 'mb-1' : ''}>Operacional</TabsTrigger>
          <TabsTrigger value="detalhado">Detalhado</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral" className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            <Card className="card-tech">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Total Clientes</CardTitle>
                <Users className="h-3 w-3 md:h-4 md:w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-2xl font-bold text-orange-500">{dadosFiltrados.clientes.length}</div>
              </CardContent>
            </Card>

            <Card className="card-tech">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Sites Ativos</CardTitle>
                <Globe className="h-3 w-3 md:h-4 md:w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-2xl font-bold text-orange-500">{sitesPorStatus['Ativo'] || 0}</div>
              </CardContent>
            </Card>

            <Card className="card-tech">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Receita Total</CardTitle>
                <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-sm md:text-2xl font-bold text-green-500">R$ {(receitaMensalSites + receitaInstalacoes).toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card className="card-tech">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Instalações</CardTitle>
                <Scissors className="h-3 w-3 md:h-4 md:w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-2xl font-bold text-orange-500">{dadosFiltrados.instalacoes.length}</div>
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
                <div className="text-sm md:text-2xl font-bold text-red-500">R$ {totalDespesas.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {despesasPendentes > 0 ? `R$ ${despesasPendentes.toFixed(2)} pendente` : 'Tudo pago'}
                </p>
              </CardContent>
            </Card>

            <Card className="card-tech">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Empréstimos</CardTitle>
                <Banknote className="h-3 w-3 md:h-4 md:w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-sm md:text-2xl font-bold text-yellow-500">R$ {totalEmprestimos.toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card className="card-tech">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Dívidas</CardTitle>
                <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-sm md:text-2xl font-bold text-red-500">R$ {totalDividas.toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card className="card-tech">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Saldo Líquido</CardTitle>
                <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className={`text-sm md:text-2xl font-bold ${(receitaMensalSites + receitaInstalacoes - despesasPendentes - totalEmprestimos - totalDividas) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  R$ {(receitaMensalSites + receitaInstalacoes - despesasPendentes - totalEmprestimos - totalDividas).toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financeiro" className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                  <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                  Receitas ({nomesMeses[mesEscolhido]} {anoEscolhido})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                <div className="flex justify-between items-center p-2 md:p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium text-xs md:text-sm">Sites Recorrentes</span>
                  <span className="text-sm md:text-lg font-bold text-blue-600">R$ {receitaMensalSites.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-2 md:p-3 bg-orange-50 rounded-lg">
                  <span className="font-medium text-xs md:text-sm">Instalações</span>
                  <span className="text-sm md:text-lg font-bold text-orange-600">R$ {receitaInstalacoes.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-2 md:p-3 bg-green-50 rounded-lg border-2 border-green-200">
                  <span className="font-bold text-xs md:text-sm">Total</span>
                  <span className="text-lg md:text-xl font-bold text-green-600">R$ {(receitaMensalSites + receitaInstalacoes).toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => exportarRelatorio('receita')}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
                >
                  <Download className="w-4 h-4" />
                  Exportar Receitas
                </button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                  <CreditCard className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
                  Despesas ({nomesMeses[mesEscolhido]} {anoEscolhido})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-2 border rounded text-xs md:text-sm bg-red-50">
                  <span>Total do Período</span>
                  <span className="font-semibold text-red-600">R$ {totalDespesas.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-2 border rounded text-xs md:text-sm bg-green-50">
                  <span>Pagas</span>
                  <span className="font-semibold text-green-600">R$ {despesasPagas.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-2 border rounded text-xs md:text-sm bg-yellow-50">
                  <span>Pendentes</span>
                  <span className="font-semibold text-yellow-600">R$ {despesasPendentes.toFixed(2)}</span>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                <Scissors className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                Instalações por Quinzena - {nomesMeses[mesEscolhido]} {anoEscolhido}
                {tipoRelatorio !== 'todos' && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2">
                    Filtrado: {tipoRelatorio}
                  </span>
                )}
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Controle de instalações do período selecionado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                // Calcular instalações por quinzena
                const primeiraQuinzena = dadosFiltrados.instalacoes.filter(inst => {
                  const dia = new Date(inst.data_instalacao).getDate();
                  return dia >= 1 && dia <= 15 && inst.status === 'Concluído';
                });
                
                const segundaQuinzena = dadosFiltrados.instalacoes.filter(inst => {
                  const dia = new Date(inst.data_instalacao).getDate();
                  return dia >= 16 && inst.status === 'Concluído';
                });

                const receitaPrimeiraQuinzena = primeiraQuinzena.reduce((sum, inst) => sum + Number(inst.valor_total), 0);
                const receitaSegundaQuinzena = segundaQuinzena.reduce((sum, inst) => sum + Number(inst.valor_total), 0);
                const totalInstalacoesConcluidas = dadosFiltrados.instalacoes.filter(i => i.status === 'Concluído').length;
                const receitaTotalMes = receitaPrimeiraQuinzena + receitaSegundaQuinzena;

                return (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 md:p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2 text-sm">Primeira Quinzena (1-15)</h4>
                        <div className="text-xl md:text-2xl font-bold text-blue-600">{primeiraQuinzena.length}</div>
                        <p className="text-xs md:text-sm text-blue-700">instalações</p>
                        <div className="mt-2 text-xs md:text-sm">
                          Receita: R$ {receitaPrimeiraQuinzena.toFixed(2)}
                        </div>
                      </div>
                      
                      <div className="p-3 md:p-4 bg-orange-50 rounded-lg">
                        <h4 className="font-medium text-orange-900 mb-2 text-sm">Segunda Quinzena (16-31)</h4>
                        <div className="text-xl md:text-2xl font-bold text-orange-600">{segundaQuinzena.length}</div>
                        <p className="text-xs md:text-sm text-orange-700">instalações</p>
                        <div className="mt-2 text-xs md:text-sm">
                          Receita: R$ {receitaSegundaQuinzena.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 md:p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2 text-sm">Total do Mês</h4>
                      <div className="text-xl md:text-2xl font-bold text-green-600">{totalInstalacoesConcluidas}</div>
                      <p className="text-xs md:text-sm text-green-700">instalações concluídas</p>
                      <div className="mt-2 text-xs md:text-sm">
                        Receita Total: R$ {receitaTotalMes.toFixed(2)}
                      </div>
                    </div>
                  </>
                );
              })()}
              
              <button 
                onClick={() => exportarRelatorio('instalacoes')}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                Exportar Relatório de Instalações
              </button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm md:text-base">Próximos Vencimentos</CardTitle>
                <CardDescription className="text-xs md:text-sm">Contratos que vencem nos próximos 30 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sites
                    .filter(site => {
                      const vencimento = new Date(site.data_vencimento);
                      const em30Dias = new Date();
                      em30Dias.setDate(hoje.getDate() + 30);
                      return site.status === 'Ativo' && vencimento <= em30Dias && vencimento >= hoje;
                    })
                    .slice(0, 5)
                    .map((site) => (
                      <div key={site.id} className="flex justify-between items-center p-2 border rounded">
                        <div>
                          <div className="font-medium text-xs md:text-sm">{site.cliente_nome}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(site.data_vencimento).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                        <div className="text-xs md:text-sm font-medium">R$ {site.valor_mensal.toFixed(2)}</div>
                      </div>
                    ))}
                  {0 === 0 && (
                    <p className="text-xs md:text-sm text-muted-foreground">Nenhum vencimento próximo</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm md:text-base">Instalações Agendadas</CardTitle>
                <CardDescription className="text-xs md:text-sm">Próximas instalações a serem realizadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {instalacoes
                    .filter(inst => inst.status === 'Agendado')
                    .slice(0, 5)
                    .map((instalacao) => (
                      <div key={instalacao.id} className="flex justify-between items-center p-2 border rounded">
                        <div>
                          <div className="font-medium text-xs md:text-sm">{instalacao.arquiteto_nome}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(instalacao.data_instalacao).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                        <div className="text-xs md:text-sm font-medium">R$ {instalacao.valor_total.toFixed(2)}</div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm md:text-base">Status dos Sites</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(sitesPorStatus).map(([status, quantidade]) => (
                    <div key={status} className="flex justify-between items-center p-2 border rounded text-xs md:text-sm">
                      <span>{status}</span>
                      <span className="font-semibold">{quantidade}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm md:text-base">Resumo Geral</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs md:text-sm">
                  <div className="flex justify-between">
                    <span>Clientes cadastrados:</span>
                    <span className="font-semibold">{dadosFiltrados.clientes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sites totais:</span>
                    <span className="font-semibold">{dadosFiltrados.sites.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Instalações período:</span>
                    <span className="font-semibold">{dadosFiltrados.instalacoes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Despesas período:</span>
                    <span className="font-semibold">{dadosFiltrados.despesas.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Empréstimos ativos:</span>
                    <span className="font-semibold">{dadosFiltrados.emprestimos.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dívidas ativas:</span>
                    <span className="font-semibold">{dadosFiltrados.dividasNegativadas.filter(d => !d.pago).length}</span>
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
