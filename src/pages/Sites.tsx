
import React, { useState } from 'react';
import { Plus, Search, Filter, Globe } from 'lucide-react';
import { SiteForm } from '../components/SiteForm';
import { SiteCard } from '../components/SiteCard';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useIsMobile } from '../hooks/use-mobile';

interface Cliente {
  id: string;
  nome: string;
}

interface Site {
  id: string;
  clienteId: string;
  clienteNome: string;
  dataInicio: string;
  tipoPlano: 'assinatura-70' | 'assinatura-85' | 'venda-1400';
  status: 'Ativo' | 'Suspenso' | 'Cancelado';
  dataVencimento: string;
  valorMensal: number;
  descricaoProjeto: string;
  urlSite?: string;
  observacoes?: string;
  hospedagem: boolean;
  instalacao: boolean;
  createdAt: string;
}

const getTipoPlanoLabel = (tipo: string) => {
  const tipos: Record<string, string> = {
    'assinatura-70': 'Assinatura R$70/mês',
    'assinatura-85': 'Assinatura R$85/mês',
    'venda-1400': 'Venda R$1.400'
  };
  return tipos[tipo] || tipo;
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'Ativo': 'bg-green-100 text-green-800',
    'Suspenso': 'bg-yellow-100 text-yellow-800',
    'Cancelado': 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const Sites = () => {
  const [sites, setSites] = useLocalStorage<Site[]>('sites', []);
  const [clientes] = useLocalStorage<Cliente[]>('clientes', []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile();

  const handleSaveSite = (siteData: Omit<Site, 'id' | 'createdAt'>) => {
    if (editingSite) {
      setSites(sites.map(s => 
        s.id === editingSite.id 
          ? { ...siteData, id: editingSite.id, createdAt: editingSite.createdAt }
          : s
      ));
    } else {
      const newSite: Site = {
        ...siteData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      setSites([...sites, newSite]);
    }
    setEditingSite(undefined);
  };

  const handleEditSite = (site: Site) => {
    setEditingSite(site);
    setIsFormOpen(true);
  };

  const handleDeleteSite = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este site?')) {
      setSites(sites.filter(s => s.id !== id));
    }
  };

  const filteredSites = sites.filter(site =>
    site.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    site.descricaoProjeto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (site.urlSite && site.urlSite.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calcular total de receita mensal recorrente
  const receitaMensalRecorrente = sites
    .filter(site => site.status === 'Ativo' && (site.tipoPlano.includes('assinatura') || site.hospedagem))
    .reduce((total, site) => {
      if (site.tipoPlano.includes('assinatura')) {
        return total + site.valorMensal;
      } else if (site.hospedagem) {
        return total + 40; // Apenas hospedagem se não for assinatura
      }
      return total;
    }, 0);

  const getServicosAdicionais = (site: Site) => {
    const servicos = [];
    if (site.hospedagem) servicos.push('Hospedagem');
    if (site.instalacao) servicos.push('Instalação');
    return servicos.join(', ');
  };

  return (
    <div className="p-3 md:p-6 pb-20 md:pb-6">
      <div className="flex flex-col gap-3 md:gap-4 md:flex-row md:items-center justify-between mb-4 md:mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Sites</h1>
          <p className="text-sm md:text-base text-muted-foreground">Gerencie contratos e assinaturas</p>
          <p className="text-sm text-green-600 font-medium mt-1">
            Receita mensal recorrente: R$ {receitaMensalRecorrente.toFixed(2)}
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors w-full md:w-auto"
        >
          <Plus className="w-4 h-4" />
          Novo Site
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border">
        <div className="p-3 md:p-4 border-b border-border">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar sites..."
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

        {filteredSites.length === 0 ? (
          <div className="p-6 md:p-8 text-center">
            <div className="text-muted-foreground">
              <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">
                {searchTerm ? 'Nenhum site encontrado' : 'Nenhum site cadastrado'}
              </h3>
              <p className="text-sm">
                {searchTerm ? 'Tente ajustar os termos de busca' : 'Comece adicionando seu primeiro projeto'}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 md:p-4">
            {isMobile ? (
              // Mobile Card View
              <div className="space-y-3">
                {filteredSites.map((site) => (
                  <SiteCard
                    key={site.id}
                    site={site}
                    onEdit={handleEditSite}
                    onDelete={handleDeleteSite}
                  />
                ))}
              </div>
            ) : (
              // Desktop Table View
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-border">
                    <tr>
                      <th className="text-left p-4 font-medium text-muted-foreground">Cliente</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Projeto</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Plano</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Serviços</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Valor</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSites.map((site) => (
                      <tr key={site.id} className="border-b border-border hover:bg-gray-50">
                        <td className="p-4 font-medium">{site.clienteNome}</td>
                        <td className="p-4">
                          <div>
                            <div className="font-medium">{site.descricaoProjeto}</div>
                            {site.urlSite && (
                              <a
                                href={site.urlSite}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 mt-1"
                              >
                                <Globe className="w-3 h-3" />
                                {site.urlSite}
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {getTipoPlanoLabel(site.tipoPlano)}
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {getServicosAdicionais(site) || '-'}
                        </td>
                        <td className="p-4 font-medium">
                          R$ {site.valorMensal.toFixed(2)}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(site.status)}`}>
                            {site.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditSite(site)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Globe className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSite(site.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Globe className="w-4 h-4" />
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

      <SiteForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingSite(undefined);
        }}
        onSave={handleSaveSite}
        site={editingSite}
        clientes={clientes}
      />
    </div>
  );
};
