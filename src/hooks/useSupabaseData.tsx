import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Site {
  id: string;
  status: string;
  valor_mensal: number;
  tipo_plano: string;
  data_vencimento: string;
  data_inicio: string;
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

interface Despesa {
  id: string;
  nome: string;
  valor: number;
  data_vencimento: string;
  anotacao?: string;
  paga: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface Emprestimo {
  id: string;
  nome: string;
  valor_original: number;
  valor_atual: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface PagamentoEmprestimo {
  id: string;
  emprestimo_id: string;
  valor_pago: number;
  data_pagamento: string;
  created_at: string;
}

interface DividaNegativada {
  id: string;
  nome: string;
  valor_original: number;
  valor_atual: number;
  data_pagamento?: string;
  pago: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
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

export const useDespesas = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['despesas', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('despesas')
        .select('*')
        .order('data_vencimento', { ascending: true });

      if (error) {
        throw error;
      }

      return data as Despesa[];
    },
    enabled: !!user,
  });
};

export const useEmprestimos = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['emprestimos'],
    queryFn: async (): Promise<Emprestimo[]> => {
      if (!user) {
        console.log('No user found, returning empty array');
        return [];
      }

      console.log('Fetching emprestimos for user:', user.id);
      
      const { data, error } = await supabase
        .from('emprestimos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching emprestimos:', error);
        throw error;
      }

      console.log('Emprestimos fetched:', data);
      return data || [];
    },
    enabled: !!user,
  });
};

export const usePagamentosEmprestimo = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['pagamentos_emprestimo'],
    queryFn: async (): Promise<PagamentoEmprestimo[]> => {
      if (!user) {
        console.log('No user found, returning empty array');
        return [];
      }

      console.log('Fetching pagamentos_emprestimo for user:', user.id);
      
      const { data, error } = await supabase
        .from('pagamentos_emprestimo')
        .select('*')
        .order('data_pagamento', { ascending: false });

      if (error) {
        console.error('Error fetching pagamentos_emprestimo:', error);
        throw error;
      }

      console.log('Pagamentos emprestimo fetched:', data);
      return data || [];
    },
    enabled: !!user,
  });
};

export const useDividasNegativadas = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['dividas_negativadas'],
    queryFn: async (): Promise<DividaNegativada[]> => {
      if (!user) {
        console.log('No user found, returning empty array');
        return [];
      }

      console.log('Fetching dividas_negativadas for user:', user.id);
      
      const { data, error } = await supabase
        .from('dividas_negativadas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching dividas_negativadas:', error);
        throw error;
      }

      console.log('Dividas negativadas fetched:', data);
      return data || [];
    },
    enabled: !!user,
  });
};
