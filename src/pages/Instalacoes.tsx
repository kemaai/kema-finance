import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuinzenaFilter } from '@/hooks/useQuinzenaFilter';
import { InstalacaoCard } from '@/components/InstalacaoCard';
import { InstalacaoForm } from '@/components/InstalacaoForm';
import { QuinzenaFilter } from '@/components/QuinzenaFilter';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Instalacao {
  id: string;
  user_id: string;
  numero_pedido: string;
  endereco: string;
  ambiente: string;
  arquiteto_nome: string;
  data_instalacao: string;
  valor_total: number;
  status: string;
  pedido_recebido: boolean;
  created_at: string;
  updated_at: string;
}

export const Instalacoes = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingInstalacao, setEditingInstalacao] = useState<Instalacao | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  console.log('User authenticated:', !!user);
  console.log('User ID:', user?.id);

  const { data: instalacoes = [], isLoading } = useQuery({
    queryKey: ['instalacoes'],
    queryFn: async () => {
      console.log('Fetching instalacoes for user:', user?.id);
      const { data, error } = await supabase
        .from('instalacoes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching instalacoes:', error);
        throw error;
      }
      
      console.log('Instalacoes fetched:', data);
      return (data || []).map((instalacao: any) => ({
        ...instalacao,
        pedido_recebido: instalacao.pedido_recebido ?? false
      })) as Instalacao[];
    },
    enabled: !!user,
  });

  const {
    selectedMonth,
    selectedQuinzena,
    filteredInstalacoes,
    totalValorQuinzena,
    totalMetrosQuadrados,
    totalMetrosQuadradosMes,
    setSelectedMonth,
    setSelectedQuinzena,
  } = useQuinzenaFilter(instalacoes);

  const createInstalacaoMutation = useMutation({
    mutationFn: async (instalacaoData: Omit<Instalacao, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      console.log('Creating instalacao with data:', instalacaoData);
      console.log('User ID for creation:', user.id);

      const dataToInsert = {
        ...instalacaoData,
        user_id: user.id,
        valor_total: Number(instalacaoData.valor_total), // Garantir que é número
      };

      console.log('Data being inserted:', dataToInsert);

      const { data, error } = await supabase
        .from('instalacoes')
        .insert([dataToInsert])
        .select()
        .single();

      if (error) {
        console.error('Error creating instalacao:', error);
        throw error;
      }

      console.log('Instalacao created successfully:', data);
      return data;
    },
    onSuccess: () => {
      toast.success('Instalação criada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['instalacoes'] });
      setShowForm(false);
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast.error('Erro ao criar instalação: ' + error.message);
    },
  });

  const updateInstalacaoMutation = useMutation({
    mutationFn: async (instalacaoData: Instalacao) => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      console.log('Updating instalacao with data:', instalacaoData);

      const { data, error } = await supabase
        .from('instalacoes')
        .update({
          numero_pedido: instalacaoData.numero_pedido,
          endereco: instalacaoData.endereco,
          ambiente: instalacaoData.ambiente,
          arquiteto_nome: instalacaoData.arquiteto_nome,
          data_instalacao: instalacaoData.data_instalacao,
          valor_total: Number(instalacaoData.valor_total),
          status: instalacaoData.status,
        })
        .eq('id', instalacaoData.id)
        .eq('user_id', user.id) // Garantir que só atualiza próprios dados
        .select()
        .single();

      if (error) {
        console.error('Error updating instalacao:', error);
        throw error;
      }

      console.log('Instalacao updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      toast.success('Instalação atualizada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['instalacoes'] });
      setEditingInstalacao(null);
    },
    onError: (error) => {
      console.error('Update mutation error:', error);
      toast.error('Erro ao atualizar instalação: ' + error.message);
    },
  });

  const deleteInstalacaoMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      console.log('Deleting instalacao with id:', id);

      const { error } = await supabase
        .from('instalacoes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Garantir que só deleta próprios dados

      if (error) {
        console.error('Error deleting instalacao:', error);
        throw error;
      }

      console.log('Instalacao deleted successfully');
    },
    onSuccess: () => {
      toast.success('Instalação excluída com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['instalacoes'] });
    },
    onError: (error) => {
      console.error('Delete mutation error:', error);
      toast.error('Erro ao excluir instalação: ' + error.message);
    },
  });

  const handleCreateInstalacao = (instalacaoData: Omit<Instalacao, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    console.log('Handle create instalacao called with:', instalacaoData);
    createInstalacaoMutation.mutate(instalacaoData);
  };

  const handleUpdateInstalacao = (instalacao: Instalacao) => {
    console.log('Handle update instalacao called with:', instalacao);
    updateInstalacaoMutation.mutate(instalacao);
  };

  const handleDeleteInstalacao = (id: string) => {
    console.log('Handle delete instalacao called with id:', id);
    if (confirm('Tem certeza que deseja excluir esta instalação?')) {
      deleteInstalacaoMutation.mutate(id);
    }
  };

  const handleEditInstalacao = (instalacao: Instalacao) => {
    setEditingInstalacao(instalacao);
  };

  const togglePedidoRecebidoMutation = useMutation({
    mutationFn: async ({ id, recebido }: { id: string; recebido: boolean }) => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { error } = await supabase
        .from('instalacoes')
        .update({ pedido_recebido: recebido })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Status do pedido atualizado!');
      queryClient.invalidateQueries({ queryKey: ['instalacoes'] });
    },
    onError: (error) => {
      toast.error('Erro ao atualizar status: ' + error.message);
    },
  });

  const handleTogglePedidoRecebido = (id: string, recebido: boolean) => {
    togglePedidoRecebidoMutation.mutate({ id, recebido });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Você precisa estar logado para acessar esta página.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 lg:p-6 space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Instalações</h1>
        <Button 
          onClick={() => setShowForm(true)} 
          className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
          disabled={createInstalacaoMutation.isPending}
        >
          <Plus className="w-4 h-4 mr-2" />
          {createInstalacaoMutation.isPending ? 'Salvando...' : 'Nova Instalação'}
        </Button>
      </div>

      <QuinzenaFilter
        selectedMonth={selectedMonth}
        selectedQuinzena={selectedQuinzena}
        onMonthChange={setSelectedMonth}
        onQuinzenaChange={setSelectedQuinzena}
      />

      {(totalValorQuinzena > 0 || totalMetrosQuadrados > 0) && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 lg:p-4 rounded-r-lg space-y-1">
          <p className="text-blue-800 font-medium text-sm lg:text-base">
            Total da {selectedQuinzena === 'primeira' ? '1ª quinzena' : 
                     selectedQuinzena === 'segunda' ? '2ª quinzena' : 
                     'quinzena'}: R$ {totalValorQuinzena.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-blue-700 text-sm">
            Metragem da {selectedQuinzena === 'primeira' ? '1ª quinzena' : 
                         selectedQuinzena === 'segunda' ? '2ª quinzena' : 
                         'quinzena'}: {totalMetrosQuadrados.toFixed(2)} m²
          </p>
          <p className="text-blue-600 text-sm">
            Total do mês: {totalMetrosQuadradosMes.toFixed(2)} m²
          </p>
        </div>
      )}

      {(showForm || editingInstalacao) && (
        <div className="bg-white p-4 lg:p-6 rounded-lg border shadow-sm">
          <h2 className="text-lg lg:text-xl font-semibold mb-4">
            {editingInstalacao ? 'Editar Instalação' : 'Nova Instalação'}
          </h2>
          <InstalacaoForm
            instalacao={editingInstalacao}
            onSubmit={editingInstalacao ? handleUpdateInstalacao : handleCreateInstalacao}
            onCancel={() => {
              setShowForm(false);
              setEditingInstalacao(null);
            }}
            isLoading={createInstalacaoMutation.isPending || updateInstalacaoMutation.isPending}
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        {filteredInstalacoes.length === 0 ? (
          <div className="col-span-full text-center py-8 lg:py-12">
            <p className="text-gray-500 text-base lg:text-lg">
              Nenhuma instalação encontrada para este período.
            </p>
            <p className="text-gray-400 text-sm lg:text-base mt-2">
              {selectedQuinzena === 'primeira' ? 'Primeira quinzena (01-15)' :
               selectedQuinzena === 'segunda' ? 'Segunda quinzena (16-30)' :
               'Todas as quinzenas'} de {selectedMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        ) : (
          filteredInstalacoes.map((instalacao) => (
            <InstalacaoCard
              key={instalacao.id}
              instalacao={instalacao}
              onEdit={handleEditInstalacao}
              onDelete={handleDeleteInstalacao}
              onTogglePedidoRecebido={handleTogglePedidoRecebido}
            />
          ))
        )}
      </div>
    </div>
  );
};
