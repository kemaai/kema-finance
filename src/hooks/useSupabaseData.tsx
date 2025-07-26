
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Site {
  id: string;
  status: string;
  valor_mensal: number;
  tipo_plano: string;
  data_vencimento: string;
  cliente_nome: string;
  descricao_projeto: string;
}

interface Cliente {
  id: string;
  nome: string;
}

interface Instalacao {
  id: string;
  numero_pedido: string;
  data_instalacao: string;
  valor_total: number;
  status: string;
  arquiteto_nome: string;
  ambiente: string;
}

export const useSites = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['sites'],
    queryFn: async (): Promise<Site[]> => {
      if (!user) {
        console.log('No user found, returning empty array');
        return [];
      }

      console.log('Fetching sites for user:', user.id);
      
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sites:', error);
        throw error;
      }

      console.log('Sites fetched:', data);
      return data || [];
    },
    enabled: !!user,
  });
};

export const useClientes = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['clientes'],
    queryFn: async (): Promise<Cliente[]> => {
      if (!user) {
        console.log('No user found, returning empty array');
        return [];
      }

      console.log('Fetching clientes for user:', user.id);
      
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clientes:', error);
        throw error;
      }

      console.log('Clientes fetched:', data);
      return data || [];
    },
    enabled: !!user,
  });
};

export const useInstalacoes = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['instalacoes'],
    queryFn: async (): Promise<Instalacao[]> => {
      if (!user) {
        console.log('No user found, returning empty array');
        return [];
      }

      console.log('Fetching instalacoes for user:', user.id);
      
      const { data, error } = await supabase
        .from('instalacoes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching instalacoes:', error);
        throw error;
      }

      console.log('Instalacoes fetched:', data);
      return data || [];
    },
    enabled: !!user,
  });
};
