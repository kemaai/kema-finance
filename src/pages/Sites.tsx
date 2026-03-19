import React, { useState } from 'react';
import { Plus, Search, Filter, Globe } from 'lucide-react';
import { SiteForm } from '../components/SiteForm';
import { SiteCard } from '../components/SiteCard';
import { SiteMonthFilter } from '../components/SiteMonthFilter';
import { useSiteMonthFilter } from '../hooks/useSiteMonthFilter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { addMonths } from 'date-fns';

interface Cliente {
  id: string;
  nome: string;
}

interface Site {
  id: string;
  cliente_id: string;
  cliente_nome: string;
  data_inicio: string;
  tipo_plano: 'assinatura-70' | 'assinatura-85' | 'venda-1400';
  status: 'Ativo' | 'Suspenso' | 'Cancelado';
  data_vencimento: string;
  valor_mensal: number;
  descricao_projeto: string;
  url_site?: string;
  observacoes?: string;
  hospedagem: boolean;
  instalacao: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export const Sites = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | undefined>();
  const [searchTerm, setSearchTerm] = useState('');

  // Buscar sites do Supabase
  const { data: sites = [], isLoading: sitesLoading } = useQuery({
    queryKey: ['sites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Site[] || [];
    },
    enabled: !!user,
  });

  // Usar o hook de filtro de mês
  const {
    selectedMonth,
    filteredSites,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
  } = useSiteMonthFilter(sites);

  // Buscar clientes para o formulário
  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome')
        .order('nome');
      
      if (error) throw error;
      return data as Cliente[] || [];
    },
    enabled: !!user,
  });

  // Mutação para criar/atualizar site
  const saveSiteMutation = useMutation({
    mutationFn: async (siteData: Omit<Site, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      if (editingSite) {
        const { data, error } = await supabase
          .from('sites')
          .update(siteData)
          .eq('id', editingSite.id)
          .eq('user_id', user!.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('sites')
          .insert([{ ...siteData, user_id: user!.id }])
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      toast.success(editingSite ? 'Site atualizado!' : 'Site criado!');
      setEditingSite(undefined);
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      toast.error('Erro ao salvar site: ' + error.message);
    },
  });

  // Mutação para deletar site
  const deleteSiteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sites')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      toast.success('Site excluído!');
    },
    onError: (error: any) => {
      toast.error('Erro ao excluir site: ' + error.message);
    },
  });

  // Função para duplicar site para o próximo mês
  const handleDuplicateSite = (site: Site) => {
    const nextMonthDate = addMonths(new Date(site.data_vencimento), 1);
    const duplicatedSite = {
      ...site,
      data_vencimento: nextMonthDate.toISOString().split('T')[0],
    };
    
    // Remove campos que não devem ser duplicados
    const { id, created_at, updated_at, user_id, ...siteData } = duplicatedSite;
    
    saveSiteMutation.mutate(siteData);
  };

  const handleSaveSite = (siteData: Omit<Site, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    saveSiteMutation.mutate(siteData);
  };

  const handleEditSite = (site: Site) => {
    setEditingSite(site);
    setIsFormOpen(true);
  };

  const handleDeleteSite = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este site?')) {
      deleteSiteMutation.mutate(id);
    }
  };

  // Filtrar sites por termo de busca
  const searchFilteredSites = filteredSites.filter(site =>
    site.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    site.descricao_projeto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (site.url_site && site.url_site.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calcular total de receita mensal recorrente do mês selecionado
  const receitaMensalRecorrente = filteredSites
    .filter(site => site.status === 'Ativo' && (site.tipo_plano.includes('assinatura') || site.hospedagem))
    .reduce((total, site) => {
      if (site.tipo_plano.includes('assinatura')) {
        return total + site.valor_mensal;
      } else if (site.hospedagem) {
        return total + 40; // Apenas hospedagem se não for assinatura
      }
      return total;
    }, 0);

  if (sitesLoading) {
    return (
      <div className="p-3 md:p-6 pb-20 md:pb-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Carregando sites...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 pb-20 md:pb-6">
      <div className="flex flex-col gap-3 md:gap-4 md:flex-row md:items-center justify-between mb-4 md:mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Sites</h1>
          <p className="text-sm md:text-base text-muted-foreground">Gerencie contratos e assinaturas</p>
          <p className="text-sm text-orange-500 font-medium mt-1">
            Receita mensal recorrente: R$ {receitaMensalRecorrente.toFixed(2)}
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="btn-tech px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors w-full md:w-auto"
        >
          <Plus className="w-4 h-4" />
          Novo Site
        </button>
      </div>

      <div className="card-tech">
        <div className="p-3 md:p-4 border-b border-orange-500/20">
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
                placeholder="Buscar sites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-tech w-full pl-10 pr-4 py-2 rounded-lg text-sm"
              />
            </div>
            <button className="px-4 py-2 border border-orange-500/30 rounded-lg flex items-center justify-center gap-2 hover:bg-orange-500/10 transition-colors text-foreground">
              <Filter className="w-4 h-4" />
              Filtros
            </button>
          </div>
        </div>

        {searchFilteredSites.length === 0 ? (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchFilteredSites.map((site) => (
                <SiteCard
                  key={site.id}
                  site={site}
                  onEdit={handleEditSite}
                  onDelete={handleDeleteSite}
                  onDuplicate={handleDuplicateSite}
                />
              ))}
            </div>
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
