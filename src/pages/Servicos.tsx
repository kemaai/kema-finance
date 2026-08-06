import React, { useState } from 'react';
import { Plus, Search, Briefcase } from 'lucide-react';
import { ServicoForm, type Servico, type ServicoInput } from '../components/ServicoForm';
import { ServicoCard } from '../components/ServicoCard';
import { SiteMonthFilter } from '../components/SiteMonthFilter';
import { useServicoMonthFilter } from '../hooks/useServicoMonthFilter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Cliente {
  id: string;
  nome: string;
}

export const Servicos = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingServico, setEditingServico] = useState<Servico | undefined>();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: servicos = [], isLoading } = useQuery({
    queryKey: ['servicos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('servicos')
        .select('*')
        .order('data_servico', { ascending: false });
      if (error) throw error;
      return (data || []) as Servico[];
    },
    enabled: !!user,
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes-select'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome')
        .order('nome');
      if (error) throw error;
      return (data || []) as Cliente[];
    },
    enabled: !!user,
  });

  const {
    selectedMonth,
    filteredServicos,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
  } = useServicoMonthFilter(servicos);

  const saveMutation = useMutation({
    mutationFn: async (data: ServicoInput) => {
      if (editingServico) {
        const { error } = await supabase
          .from('servicos')
          .update(data)
          .eq('id', editingServico.id)
          .eq('user_id', user!.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('servicos')
          .insert([{ ...data, user_id: user!.id }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicos'] });
      toast.success(editingServico ? 'Serviço atualizado!' : 'Serviço criado!');
      setEditingServico(undefined);
      setIsFormOpen(false);
    },
    onError: (e: any) => toast.error('Erro ao salvar: ' + e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('servicos')
        .delete()
        .eq('id', id)
        .eq('user_id', user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicos'] });
      toast.success('Serviço excluído!');
    },
    onError: (e: any) => toast.error('Erro ao excluir: ' + e.message),
  });

  const searchFiltered = filteredServicos.filter(s =>
    s.nome_servico.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalFaturado = filteredServicos.reduce((sum, s) => sum + Number(s.valor), 0);

  if (isLoading) {
    return (
      <div className="p-3 md:p-6 pb-20 md:pb-6">
        <div className="flex items-center justify-center h-64 text-muted-foreground">Carregando serviços...</div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 pb-20 md:pb-6">
      <div className="flex flex-col gap-3 md:gap-4 md:flex-row md:items-center justify-between mb-4 md:mb-6">
        <div>
          <h1 className="page-title">Serviços</h1>
          <p className="text-sm md:text-base text-muted-foreground">Gerencie os serviços prestados</p>
          <p className="text-sm text-primary font-medium mt-1">
            Total faturado no mês: R$ {totalFaturado.toFixed(2)}
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="btn-tech px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors w-full md:w-auto"
        >
          <Plus className="w-4 h-4" />
          Novo Serviço
        </button>
      </div>

      <div className="card-tech">
        <div className="p-3 md:p-4 border-b border-border">
          <SiteMonthFilter
            selectedMonth={selectedMonth}
            onPreviousMonth={goToPreviousMonth}
            onNextMonth={goToNextMonth}
            onCurrentMonth={goToCurrentMonth}
          />
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por serviço, cliente ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-tech w-full pl-10 pr-4 py-2 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>

        {searchFiltered.length === 0 ? (
          <div className="p-6 md:p-8 text-center">
            <div className="text-muted-foreground">
              <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">
                {searchTerm ? 'Nenhum serviço encontrado' : 'Nenhum serviço neste mês'}
              </h3>
              <p className="text-sm">
                {searchTerm ? 'Tente ajustar os termos de busca' : 'Comece adicionando seu primeiro serviço'}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 md:p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchFiltered.map(s => (
                <ServicoCard
                  key={s.id}
                  servico={s}
                  onEdit={(srv) => { setEditingServico(srv); setIsFormOpen(true); }}
                  onDelete={(id) => {
                    if (confirm('Tem certeza que deseja excluir este serviço?')) deleteMutation.mutate(id);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <ServicoForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingServico(undefined); }}
        onSave={(data) => saveMutation.mutate(data)}
        servico={editingServico}
        clientes={clientes}
      />
    </div>
  );
};
