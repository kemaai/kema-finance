import React, { useState } from 'react';
import { FileText, Download, TrendingUp, Scissors, Calendar, DollarSign, Users, Globe } from 'lucide-react';
import { useIsMobile } from '../hooks/use-mobile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useSites, useClientes, useInstalacoes } from '../hooks/useSupabaseData';
import { RelatorioFilter } from '../components/RelatorioFilter';

export const Relatorios = () => {
  const { data: sites = [], isLoading: sitesLoading } = useSites();
  const { data: clientes = [], isLoading: clientesLoading } = useClientes();
  const { data: instalacoes = [], isLoading: instalacoesLoading } = useInstalacoes();
  
  const [mesEscolhido, setMesEscolhido] = useState(new Date().getMonth());
  const [anoEscolhido, setAnoEscolhido] = useState(new Date().getFullYear());
  const [tipoRelatorio, setTipoRelatorio] = useState('todos');
  const isMobile = useIsMobile();

  const isLoading = sitesLoading || clientesLoading || instalacoesLoading;

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
      instalacoes: instalacoes
    };

    // Filtrar instalações por período
    dadosFiltrados.instalacoes = instalacoes.filter(instalacao => {
      const dataInstalacao = new Date(instalacao.data_instalacao);
      return dataInstalacao.getMonth() === mes && dataInstalacao.getFullYear() === ano;
    });

    // Filtrar sites por período de vencimento (removendo created_at que não existe)
    if (tipo === 'sites' || tipo === 'todos') {
      dadosFiltrados.sites = sites.filter(site => {
        const dataVencimento = new Date(site.data_vencimento);
        return dataVencimento.getMonth() === mes && dataVencimento.getFullYear() === ano;
      });
    }

    // Para clientes, vamos manter todos os dados (não há created_at disponível)
    if (tipo === 'clientes' || tipo === 'todos') {
      dadosFiltrados.clientes = clientes; // Mantém todos os clientes
    }

    return dadosFiltrados;
  };

  // Função para dividir o mês em quinzenas
  const dividirEmQuinzenas = (instalacoesMes: any[]) => {
    const primeiraQuinzena = instalacoesMes.filter(inst => {
      const dia = new Date(inst.data_instalacao).getDate();
      return dia <= 15;
    });

    const segundaQuinzena = instalacoesMes.filter(inst => {
      const dia = new Date(inst.data_instalacao).getDate();
      return dia > 15;
    });

    return { primeiraQuinzena, segundaQuinzena };
  };

  // Dados filtrados
  const dadosFiltrados = filtrarDadosPorPeriodo(mesEscolhido, anoEscolhido, tipoRelatorio);
  
  // Instalações do mês escolhido
  const instalacoesMesEscolhido = dadosFiltrados.instalacoes;
  const { primeiraQuinzena, segundaQuinzena } = dividirEmQuinzenas(instalacoesMesEscolhido);

  // Cálculos para relatórios
  const hoje = new Date();
  const inicioMesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fimMesAtual = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

  // Receita mensal de sites (filtrada ou não baseada no tipo)
  const sitesParaReceita = tipoRelatorio === 'sites' || tipoRelatorio === 'todos' ? dadosFiltrados.sites : sites;
  const receitaMensalSites = sitesParaReceita
    .filter(site => site.status === 'Ativo')
    .reduce((total, site) => total + site.valor_mensal, 0);

  // Receita de instalações no mês atual
  const instalacoesMesAtual = instalacoes.filter(instalacao => {
    const dataInstalacao = new Date(instalacao.data_instalacao);
    return dataInstalacao >= inicioMesAtual && dataInstalacao <= fimMesAtual && instalacao.status === 'Concluído';
  });

  const receitaInstalacoesMesAtual = instalacoesMesAtual.reduce((total, instalacao) => total + instalacao.valor_total, 0);

  // Receita de instalações do mês escolhido
  const receitaInstalacoesMesEscolhido = instalacoesMesEscolhido
    .filter(inst => inst.status === 'Concluído')
    .reduce((total, instalacao) => total + instalacao.valor_total, 0);

  // Sites por status (filtrados ou não)
  const sitesParaStatus = tipoRelatorio === 'sites' || tipoRelatorio === 'todos' ? dadosFiltrados.sites : sites;
  const sitesPorStatus = sitesParaStatus.reduce((acc, site) => {
    acc[site.status] = (acc[site.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Vencimentos próximos (próximos 30 dias)
  const proximosVencimentos = sites.filter(site => {
    const vencimento = new Date(site.data_vencimento);
    const em30Dias = new Date();
    em30Dias.setDate(hoje.getDate() + 30);
    return site.status === 'Ativo' && vencimento <= em30Dias && vencimento >= hoje;
  }).length;

  const exportarRelatorio = (tipo: string) => {
    let dados = '';
    let nomeArquivo = '';
    const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    switch (tipo) {
      case 'receita':
        dados = `Relatório de Receita - ${hoje.toLocaleDateString('pt-BR')}\n\n`;
        dados += `Receita Mensal de Sites: R$ ${receitaMensalSites.toFixed(2)}\n`;
        dados += `Receita de Instalações (Mês Atual): R$ ${receitaInstalacoesMesAtual.toFixed(2)}\n`;
        dados += `Total: R$ ${(receitaMensalSites + receitaInstalacoesMesAtual).toFixed(2)}\n`;
        nomeArquivo = `relatorio-receita-${hoje.toISOString().split('T')[0]}.txt`;
        break;
      
      case 'sites':
        dados = `Relatório de Sites - ${hoje.toLocaleDateString('pt-BR')}\n\n`;
        Object.entries(sitesPorStatus).forEach(([status, quantidade]) => {
          dados += `${status}: ${quantidade} sites\n`;
        });
        nomeArquivo = `relatorio-sites-${hoje.toISOString().split('T')[0]}.txt`;
        break;
      
      case 'instalacoes':
        dados = `Relatório de Instalações - ${nomesMeses[mesEscolhido]} ${anoEscolhido}\n\n`;
        dados += `Total do Mês: ${instalacoesMesEscolhido.length} instalações\n`;
        dados += `Primeira Quinzena (1-15): ${primeiraQuinzena.length} instalações\n`;
        dados += `Segunda Quinzena (16-30): ${segundaQuinzena.length} instalações\n\n`;
        dados += `Receita Total do Mês: R$ ${receitaInstalacoesMesEscolhido.toFixed(2)}\n`;
        dados += `Receita 1ª Quinzena: R$ ${primeiraQuinzena.filter(i => i.status === 'Concluído').reduce((acc, inst) => acc + inst.valor_total, 0).toFixed(2)}\n`;
        dados += `Receita 2ª Quinzena: R$ ${segundaQuinzena.filter(i => i.status === 'Concluído').reduce((acc, inst) => acc + inst.valor_total, 0).toFixed(2)}\n`;
        nomeArquivo = `relatorio-instalacoes-${mesEscolhido + 1}-${anoEscolhido}.txt`;
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
          <p className="text-sm md:text-base text-muted-foreground">Análises e relatórios gerenciais</p>
        </div>
        <button 
          onClick={() => exportarRelatorio('receita')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors w-full md:w-auto"
        >
          <Download className="w-4 h-4" />
          Exportar
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
        <TabsList className={`grid w-full ${isMobile ? 'grid-cols-1 h-auto' : 'grid-cols-3'}`}>
          <TabsTrigger value="visao-geral" className={isMobile ? 'mb-1' : ''}>Visão Geral</TabsTrigger>
          <TabsTrigger value="receita" className={isMobile ? 'mb-1' : ''}>Receita</TabsTrigger>
          <TabsTrigger value="operacional">Operacional</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral" className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Total Clientes</CardTitle>
                <Users className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-2xl font-bold">
                  {tipoRelatorio === 'clientes' || tipoRelatorio === 'todos' ? dadosFiltrados.clientes.length : clientes.length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Sites Ativos</CardTitle>
                <Globe className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-2xl font-bold">
                  {tipoRelatorio === 'sites' || tipoRelatorio === 'todos' ? (dadosFiltrados.sites.filter(s => s.status === 'Ativo').length) : (sitesPorStatus['Ativo'] || 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Receita Mensal</CardTitle>
                <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm md:text-2xl font-bold">R$ {(receitaMensalSites + receitaInstalacoesMesAtual).toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Vencimentos Próximos</CardTitle>
                <Calendar className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-2xl font-bold">{proximosVencimentos}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="receita" className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                  <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                  Receita Mensal Detalhada
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                <div className="flex justify-between items-center p-2 md:p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium text-xs md:text-sm">Sites (Recorrente)</span>
                  <span className="text-sm md:text-lg font-bold text-blue-600">R$ {receitaMensalSites.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-2 md:p-3 bg-orange-50 rounded-lg">
                  <span className="font-medium text-xs md:text-sm">Instalações (Mês Atual)</span>
                  <span className="text-sm md:text-lg font-bold text-orange-600">R$ {receitaInstalacoesMesAtual.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-2 md:p-3 bg-green-50 rounded-lg border-2 border-green-200">
                  <span className="font-bold text-xs md:text-sm">Total</span>
                  <span className="text-lg md:text-xl font-bold text-green-600">R$ {(receitaMensalSites + receitaInstalacoesMesAtual).toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => exportarRelatorio('receita')}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
                >
                  <Download className="w-4 h-4" />
                  Exportar Relatório de Receita
                </button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                  <Globe className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                  Performance de Sites
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(sitesPorStatus).map(([status, quantidade]) => (
                  <div key={status} className="flex justify-between items-center p-2 border rounded text-xs md:text-sm">
                    <span>{status}</span>
                    <span className="font-semibold">{quantidade}</span>
                  </div>
                ))}
                <button 
                  onClick={() => exportarRelatorio('sites')}
                  className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
                >
                  <Download className="w-4 h-4" />
                  Exportar Relatório de Sites
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 md:p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2 text-sm">Primeira Quinzena (1-15)</h4>
                  <div className="text-xl md:text-2xl font-bold text-blue-600">{primeiraQuinzena.length}</div>
                  <p className="text-xs md:text-sm text-blue-700">instalações</p>
                  <div className="mt-2 text-xs md:text-sm">
                    Receita: R$ {primeiraQuinzena.filter(i => i.status === 'Concluído').reduce((acc, inst) => acc + inst.valor_total, 0).toFixed(2)}
                  </div>
                </div>
                
                <div className="p-3 md:p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-medium text-orange-900 mb-2 text-sm">Segunda Quinzena (16-30)</h4>
                  <div className="text-xl md:text-2xl font-bold text-orange-600">{segundaQuinzena.length}</div>
                  <p className="text-xs md:text-sm text-orange-700">instalações</p>
                  <div className="mt-2 text-xs md:text-sm">
                    Receita: R$ {segundaQuinzena.filter(i => i.status === 'Concluído').reduce((acc, inst) => acc + inst.valor_total, 0).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="p-3 md:p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2 text-sm">Total do Mês</h4>
                <div className="text-xl md:text-2xl font-bold text-green-600">{instalacoesMesEscolhido.length}</div>
                <p className="text-xs md:text-sm text-green-700">instalações</p>
                <div className="mt-2 text-xs md:text-sm">
                  Receita Total: R$ {receitaInstalacoesMesEscolhido.toFixed(2)}
                </div>
              </div>
              
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
                  {proximosVencimentos === 0 && (
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
      </Tabs>
    </div>
  );
};