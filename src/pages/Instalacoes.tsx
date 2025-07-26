import React, { useState } from 'react';
import { Plus, Search, Calendar, Scissors, Edit, Trash2 } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useIsMobile } from '../hooks/use-mobile';
import { InstalacaoForm } from '../components/InstalacaoForm';
import { InstalacaoCard } from '../components/InstalacaoCard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Instalacao {
  id: string;
  numeroPedido: string;
  dataInstalacao: string;
  arquitetoNome: string;
  ambiente: string;
  endereco: string;
  valorTotal: number;
  status: 'Agendado' | 'Em Andamento' | 'Concluído' | 'Cancelado';
}

type FiltroTempo = 'quinzena-1' | 'quinzena-2' | 'mes-atual' | 'mes-anterior' | 'todos';

export const Instalacoes = () => {
  const [instalacoes, setInstalacoes] = useLocalStorage<Instalacao[]>('instalacoes', []);
  const [showForm, setShowForm] = useState(false);
  const [editingInstalacao, setEditingInstalacao] = useState<Instalacao | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTempo, setFiltroTempo] = useState<FiltroTempo>('todos');
  const isMobile = useIsMobile();

  const handleSaveInstalacao = (instalacao: Instalacao) => {
    if (editingInstalacao) {
      setInstalacoes(prev => prev.map(inst => 
        inst.id === instalacao.id ? instalacao : inst
      ));
    } else {
      setInstalacoes(prev => [...prev, instalacao]);
    }
    setShowForm(false);
    setEditingInstalacao(undefined);
  };

  const handleDeleteInstalacao = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta instalação?')) {
      setInstalacoes(prev => prev.filter(inst => inst.id !== id));
    }
  };

  const handleEditInstalacao = (instalacao: Instalacao) => {
    setEditingInstalacao(instalacao);
    setShowForm(true);
  };

  const filtrarPorPeriodo = (instalacoes: Instalacao[]) => {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    const inicioMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
    const fimMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 0);

    switch (filtroTempo) {
      case 'quinzena-1':
        return instalacoes.filter(inst => {
          const dataInstalacao = new Date(inst.dataInstalacao);
          const mesmoMes = dataInstalacao.getMonth() === hoje.getMonth() && 
                          dataInstalacao.getFullYear() === hoje.getFullYear();
          return mesmoMes && dataInstalacao.getDate() >= 1 && dataInstalacao.getDate() <= 15;
        });
      
      case 'quinzena-2':
        return instalacoes.filter(inst => {
          const dataInstalacao = new Date(inst.dataInstalacao);
          const mesmoMes = dataInstalacao.getMonth() === hoje.getMonth() && 
                          dataInstalacao.getFullYear() === hoje.getFullYear();
          return mesmoMes && dataInstalacao.getDate() >= 16 && dataInstalacao.getDate() <= 30;
        });
      
      case 'mes-atual':
        return instalacoes.filter(inst => {
          const dataInstalacao = new Date(inst.dataInstalacao);
          return dataInstalacao >= inicioMes && dataInstalacao <= fimMes;
        });
      
      case 'mes-anterior':
        return instalacoes.filter(inst => {
          const dataInstalacao = new Date(inst.dataInstalacao);
          return dataInstalacao >= inicioMesAnterior && dataInstalacao <= fimMesAnterior;
        });
      
      default:
        return instalacoes;
    }
  };

  const filteredInstalacoes = filtrarPorPeriodo(instalacoes).filter(instalacao =>
    instalacao.arquitetoNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instalacao.ambiente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instalacao.numeroPedido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instalacao.endereco.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Agendado': return 'text-blue-600 bg-blue-50';
      case 'Em Andamento': return 'text-orange-600 bg-orange-50';
      case 'Concluído': return 'text-green-600 bg-green-50';
      case 'Cancelado': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getFiltroLabel = () => {
    switch (filtroTempo) {
      case 'quinzena-1': return 'Quinzena 1 (Dia 1-15)';
      case 'quinzena-2': return 'Quinzena 2 (Dia 16-30)';
      case 'mes-atual': return 'Mês Atual';
      case 'mes-anterior': return 'Mês Anterior';
      default: return 'Todos os Períodos';
    }
  };

  const receitaTotal = filteredInstalacoes
    .filter(inst => inst.status === 'Concluído')
    .reduce((acc, inst) => acc + inst.valorTotal, 0);

  const totalM2 = filteredInstalacoes
    .filter(inst => inst.status === 'Concluído')
    .reduce((acc, inst) => acc + (inst.valorTotal / 20), 0);

  if (showForm) {
    return (
      <InstalacaoForm
        onSave={handleSaveInstalacao}
        onCancel={() => {
          setShowForm(false);
          setEditingInstalacao(undefined);
        }}
        instalacao={editingInstalacao}
      />
    );
  }

  return (
    <div className="p-3 md:p-6 pb-20 md:pb-6">
      <div className="flex flex-col gap-3 md:gap-4 md:flex-row md:items-center justify-between mb-4 md:mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Instalações</h1>
          <p className="text-sm md:text-base text-muted-foreground">Gerencie pedidos de instalação</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors w-full md:w-auto"
        >
          <Plus className="w-4 h-4" />
          Novo Pedido
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold">{filteredInstalacoes.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Concluídas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-green-600">
              {filteredInstalacoes.filter(inst => inst.status === 'Concluído').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Total m²</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-orange-600">
              {totalM2.toFixed(1)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Receita</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm md:text-xl font-bold text-blue-600">
              R$ {receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border">
        <div className="p-3 md:p-4 border-b border-border">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar instalações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            
            <select
              value={filtroTempo}
              onChange={(e) => setFiltroTempo(e.target.value as FiltroTempo)}
              className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            >
              <option value="todos">Todos os Períodos</option>
              <option value="quinzena-1">Quinzena 1 (Dia 1-15)</option>
              <option value="quinzena-2">Quinzena 2 (Dia 16-30)</option>
              <option value="mes-atual">Mês Atual</option>
              <option value="mes-anterior">Mês Anterior</option>
            </select>
          </div>
        </div>

        {filteredInstalacoes.length === 0 ? (
          <div className="p-6 md:p-8 text-center">
            <div className="text-muted-foreground">
              <Scissors className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">
                {searchTerm || filtroTempo !== 'todos' 
                  ? 'Nenhuma instalação encontrada' 
                  : 'Nenhum pedido cadastrado'}
              </h3>
              <p className="text-sm">
                {searchTerm || filtroTempo !== 'todos'
                  ? 'Tente ajustar os filtros de busca' 
                  : 'Comece adicionando seu primeiro pedido de instalação'}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 md:p-4">
            {isMobile ? (
              <div className="space-y-3">
                {filteredInstalacoes.map((instalacao) => (
                  <InstalacaoCard
                    key={instalacao.id}
                    instalacao={instalacao}
                    onEdit={handleEditInstalacao}
                    onDelete={handleDeleteInstalacao}
                  />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº Pedido</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Arquiteto</TableHead>
                      <TableHead>Ambiente</TableHead>
                      <TableHead>Endereço</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInstalacoes.map((instalacao) => (
                      <TableRow key={instalacao.id}>
                        <TableCell className="font-medium">{instalacao.numeroPedido}</TableCell>
                        <TableCell>
                          {new Date(instalacao.dataInstalacao).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>{instalacao.arquitetoNome}</TableCell>
                        <TableCell>{instalacao.ambiente}</TableCell>
                        <TableCell>{instalacao.endereco}</TableCell>
                        <TableCell>R$ {instalacao.valorTotal.toFixed(2)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(instalacao.status)}`}>
                            {instalacao.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEditInstalacao(instalacao)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteInstalacao(instalacao.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
