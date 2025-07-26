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

  console.log('User authenticated:', !!user);
  console.log('User ID:', user?.id);

  const { data: clientes = [], isLoading } = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      console.log('Fetching clientes for user:', user?.id);
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clientes:', error);
        throw error;
      }
      
      console.log('Clientes fetched:', data);
      return data as Cliente[];
    },
    enabled: !!user,
  });

  const createClienteMutation = useMutation({
    mutationFn: async (clienteData: Omit<Cliente, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      console.log('Creating cliente with data:', clienteData);
      console.log('User ID for creation:', user.id);

      const dataToInsert = {
        ...clienteData,
        user_id: user.id,
      };

      console.log('Data being inserted:', dataToInsert);

      const { data, error } = await supabase
        .from('clientes')
        .insert([dataToInsert])
        .select()
        .single();

      if (error) {
        console.error('Error creating cliente:', error);
        throw error;
      }

      console.log('Cliente created successfully:', data);
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

      console.log('Updating cliente with data:', clienteData);

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

      console.log('Cliente updated successfully:', data);
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

      console.log('Deleting cliente with id:', id);

      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Garantir que só deleta próprios dados

      if (error) {
        console.error('Error deleting cliente:', error);
        throw error;
      }

      console.log('Cliente deleted successfully');
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
    console.log('Handle create cliente called with:', clienteData);
    createClienteMutation.mutate(clienteData);
  };

  const handleUpdateCliente = (cliente: Cliente) => {
    console.log('Handle update cliente called with:', cliente);
    updateClienteMutation.mutate(cliente);
  };

  const handleDeleteCliente = (id: string) => {
    console.log('Handle delete cliente called with id:', id);
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      deleteClienteMutation.mutate(id);
    }
  };

  const handleEditCliente = (cliente: Cliente) => {
    setEditingCliente(cliente);
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
        <Button 
          onClick={() => setShowForm(true)} 
          className="bg-blue-600 hover:bg-blue-700"
          disabled={createClienteMutation.isPending}
        >
          <Plus className="w-4 h-4 mr-2" />
          {createClienteMutation.isPending ? 'Salvando...' : 'Novo Cliente'}
        </Button>
      </div>

      {(showForm || editingCliente) && (
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-4">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clientes.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">Nenhum cliente cadastrado ainda.</p>
            <p className="text-gray-400">Clique em "Novo Cliente" para começar.</p>
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
