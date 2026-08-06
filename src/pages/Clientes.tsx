import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ClienteCard } from '@/components/ClienteCard';
import { ClienteForm } from '@/components/ClienteForm';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Cliente {
  id: string;
  user_id: string;
  nome: string;
  cpf_cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export const Clientes = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();


  const { data: clientes = [], isLoading } = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      // Usa view segura que retorna CPF/CNPJ já mascarado no banco
      const { data, error } = await (supabase as any)
        .from('clientes_safe')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clientes:', error);
        throw error;
      }

      return (data || []) as Cliente[];
    },
    enabled: !!user,
  });

  // Ao editar, busca o CPF/CNPJ completo sob demanda (RLS já garante acesso)
  const handleEditClienteAsync = async (cliente: Cliente) => {
    const { data, error } = await supabase
      .from('clientes')
      .select('cpf_cnpj')
      .eq('id', cliente.id)
      .single();

    if (error) {
      toast.error('Erro ao carregar dados do cliente');
      return;
    }

    setEditingCliente({ ...cliente, cpf_cnpj: data.cpf_cnpj });
  };

  const createClienteMutation = useMutation({
    mutationFn: async (clienteData: Omit<Cliente, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }


      const dataToInsert = {
        ...clienteData,
        user_id: user.id,
      };


      const { data, error } = await supabase
        .from('clientes')
        .insert([dataToInsert])
        .select()
        .single();

      if (error) {
        console.error('Error creating cliente:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast.success('Cliente criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      setShowForm(false);
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast.error('Erro ao criar cliente: ' + error.message);
    },
  });

  const updateClienteMutation = useMutation({
    mutationFn: async (clienteData: Cliente) => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }


      const { data, error } = await supabase
        .from('clientes')
        .update({
          nome: clienteData.nome,
          cpf_cnpj: clienteData.cpf_cnpj,
          email: clienteData.email,
          telefone: clienteData.telefone,
          endereco: clienteData.endereco,
          cidade: clienteData.cidade,
          estado: clienteData.estado,
          cep: clienteData.cep,
          observacoes: clienteData.observacoes,
        })
        .eq('id', clienteData.id)
        .eq('user_id', user.id) // Garantir que só atualiza próprios dados
        .select()
        .single();

      if (error) {
        console.error('Error updating cliente:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast.success('Cliente atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      setEditingCliente(null);
    },
    onError: (error) => {
      console.error('Update mutation error:', error);
      toast.error('Erro ao atualizar cliente: ' + error.message);
    },
  });

  const deleteClienteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }


      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Garantir que só deleta próprios dados

      if (error) {
        console.error('Error deleting cliente:', error);
        throw error;
      }

    },
    onSuccess: () => {
      toast.success('Cliente excluído com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
    onError: (error) => {
      console.error('Delete mutation error:', error);
      toast.error('Erro ao excluir cliente: ' + error.message);
    },
  });

  const handleCreateCliente = (clienteData: Omit<Cliente, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    createClienteMutation.mutate(clienteData);
  };

  const handleUpdateCliente = (cliente: Cliente) => {
    updateClienteMutation.mutate(cliente);
  };

  const handleDeleteCliente = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      deleteClienteMutation.mutate(id);
    }
  };

  const handleEditCliente = (cliente: Cliente) => {
    handleEditClienteAsync(cliente);
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="page-title">Clientes</h1>
        <Button 
          onClick={() => setShowForm(true)} 
          className="btn-tech"
          disabled={createClienteMutation.isPending}
        >
          <Plus className="w-4 h-4 mr-2" />
          {createClienteMutation.isPending ? 'Salvando...' : 'Novo Cliente'}
        </Button>
      </div>

      {(showForm || editingCliente) && (
        <div className="card-tech p-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground">
            {editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
          </h2>
          <ClienteForm
            cliente={editingCliente}
            onSubmit={editingCliente ? handleUpdateCliente : handleCreateCliente}
            onCancel={() => {
              setShowForm(false);
              setEditingCliente(null);
            }}
            isLoading={createClienteMutation.isPending || updateClienteMutation.isPending}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clientes.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground text-lg">Nenhum cliente cadastrado ainda.</p>
            <p className="text-muted-foreground/70">Clique em "Novo Cliente" para começar.</p>
          </div>
        ) : (
          clientes.map((cliente) => (
            <ClienteCard
              key={cliente.id}
              cliente={cliente}
              onEdit={handleEditCliente}
              onDelete={handleDeleteCliente}
            />
          ))
        )}
      </div>
    </div>
  );
};
