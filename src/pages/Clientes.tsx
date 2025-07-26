
import React, { useState } from 'react';
import { Plus, Search, Filter, Users, Edit, Trash2 } from 'lucide-react';
import { ClienteForm } from '../components/ClienteForm';
import { ClienteCard } from '../components/ClienteCard';
import { useIsMobile } from '../hooks/use-mobile';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Cliente {
  id: string;
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
  user_id: string;
}

export const Clientes = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile();

  // Buscar clientes do Supabase
  const { data: clientes = [], isLoading } = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Cliente[] || [];
    },
    enabled: !!user,
  });

  // Mutação para criar/atualizar cliente
  const saveClienteMutation = useMutation({
    mutationFn: async (clienteData: Omit<Cliente, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      if (editingCliente) {
        const { data, error } = await supabase
          .from('clientes')
          .update(clienteData)
          .eq('id', editingCliente.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('clientes')
          .insert([{ ...clienteData, user_id: user!.id }])
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast.success(editingCliente ? 'Cliente atualizado!' : 'Cliente criado!');
      setEditingCliente(undefined);
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      toast.error('Erro ao salvar cliente: ' + error.message);
    },
  });

  // Mutação para deletar cliente
  const deleteClienteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast.success('Cliente excluído!');
    },
    onError: (error: any) => {
      toast.error('Erro ao excluir cliente: ' + error.message);
    },
  });

  const handleSaveCliente = (clienteData: Omit<Cliente, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    saveClienteMutation.mutate(clienteData);
  };

  const handleEditCliente = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setIsFormOpen(true);
  };

  const handleDeleteCliente = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      deleteClienteMutation.mutate(id);
    }
  };

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.cpf_cnpj.includes(searchTerm)
  );

  if (isLoading) {
    return (
      <div className="p-3 md:p-6 pb-20 md:pb-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Carregando clientes...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 pb-20 md:pb-6">
      <div className="flex flex-col gap-3 md:gap-4 md:flex-row md:items-center justify-between mb-4 md:mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Clientes</h1>
          <p className="text-sm md:text-base text-muted-foreground">Gerencie seus clientes e contratos</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors w-full md:w-auto"
        >
          <Plus className="w-4 h-4" />
          Novo Cliente
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border">
        <div className="p-3 md:p-4 border-b border-border">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <button className="px-4 py-2 border border-border rounded-lg flex items-center justify-center gap-2 hover:bg-muted transition-colors">
              <Filter className="w-4 h-4" />
              Filtros
            </button>
          </div>
        </div>

        {filteredClientes.length === 0 ? (
          <div className="p-6 md:p-8 text-center">
            <div className="text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">
                {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
              </h3>
              <p className="text-sm">
                {searchTerm ? 'Tente ajustar os termos de busca' : 'Comece adicionando seu primeiro cliente'}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 md:p-4">
            {isMobile ? (
              // Mobile Card View
              <div className="space-y-3">
                {filteredClientes.map((cliente) => (
                  <ClienteCard
                    key={cliente.id}
                    cliente={cliente}
                    onEdit={handleEditCliente}
                    onDelete={handleDeleteCliente}
                  />
                ))}
              </div>
            ) : (
              // Desktop Table View
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-border">
                    <tr>
                      <th className="text-left p-4 font-medium text-muted-foreground">Nome/Razão Social</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">CPF/CNPJ</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Email</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Telefone</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClientes.map((cliente) => (
                      <tr key={cliente.id} className="border-b border-border hover:bg-gray-50">
                        <td className="p-4 font-medium">{cliente.nome}</td>
                        <td className="p-4 text-muted-foreground">{cliente.cpf_cnpj}</td>
                        <td className="p-4 text-muted-foreground">{cliente.email}</td>
                        <td className="p-4 text-muted-foreground">{cliente.telefone}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditCliente(cliente)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCliente(cliente.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <ClienteForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCliente(undefined);
        }}
        onSave={handleSaveCliente}
        cliente={editingCliente}
      />
    </div>
  );
};
