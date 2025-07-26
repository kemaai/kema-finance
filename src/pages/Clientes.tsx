
import React, { useState } from 'react';
import { Plus, Search, Filter, Users, Edit, Trash2 } from 'lucide-react';
import { ClienteForm } from '../components/ClienteForm';
import { ClienteCard } from '../components/ClienteCard';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useIsMobile } from '../hooks/use-mobile';

interface Cliente {
  id: string;
  nome: string;
  cpfCnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  observacoes?: string;
  createdAt: string;
}

export const Clientes = () => {
  const [clientes, setClientes] = useLocalStorage<Cliente[]>('clientes', []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile();

  const handleSaveCliente = (clienteData: Omit<Cliente, 'id' | 'createdAt'>) => {
    if (editingCliente) {
      setClientes(clientes.map(c => 
        c.id === editingCliente.id 
          ? { ...clienteData, id: editingCliente.id, createdAt: editingCliente.createdAt }
          : c
      ));
    } else {
      const newCliente: Cliente = {
        ...clienteData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      setClientes([...clientes, newCliente]);
    }
    setEditingCliente(undefined);
  };

  const handleEditCliente = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setIsFormOpen(true);
  };

  const handleDeleteCliente = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      setClientes(clientes.filter(c => c.id !== id));
    }
  };

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.cpfCnpj.includes(searchTerm)
  );

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
                        <td className="p-4 text-muted-foreground">{cliente.cpfCnpj}</td>
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
