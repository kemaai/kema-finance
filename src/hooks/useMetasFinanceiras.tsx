import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface MetaFinanceira {
  id: string;
  user_id: string;
  tipo_meta: 'reserva_emergencia' | 'quitar_divida' | 'economia_mensal' | 'distribuicao';
  nome: string;
  descricao: string | null;
  valor_meta: number;
  valor_atual: number;
  valor_mensal_sugerido: number;
  prazo_meses: number | null;
  data_inicio: string;
  data_fim: string | null;
  progresso: number;
  ativa: boolean;
  prioridade: number;
  criada_por_ai: boolean;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface PlanoDistribuicao {
  despesasEssenciais: number;
  despesasEssenciaisPercent: number;
  paraDividas: number;
  paraDividasPercent: number;
  paraReserva: number;
  paraReservaPercent: number;
  paraEconomia: number;
  paraEconomiaPercent: number;
}

export interface MetasGeradas {
  planoDistribuicao: PlanoDistribuicao;
  metas: Omit<MetaFinanceira, 'id' | 'user_id' | 'created_at' | 'updated_at'>[];
}

export function useMetasFinanceiras() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: metas = [], isLoading, refetch } = useQuery({
    queryKey: ['metas_financeiras', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('metas_financeiras')
        .select('*')
        .eq('user_id', user.id)
        .order('prioridade', { ascending: true });

      if (error) throw error;
      return data as MetaFinanceira[];
    },
    enabled: !!user,
  });

  const createMeta = useMutation({
    mutationFn: async (meta: Omit<MetaFinanceira, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('metas_financeiras')
        .insert([{ ...meta, user_id: user.id, metadata: meta.metadata as any }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metas_financeiras'] });
    },
  });

  const updateMeta = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MetaFinanceira> & { id: string }) => {
      if (!user) throw new Error('Usuário não autenticado');
      const updateData = updates.metadata ? { ...updates, metadata: updates.metadata as any } : updates;
      const { data, error } = await supabase
        .from('metas_financeiras')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metas_financeiras'] });
    },
  });

  const deleteMeta = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('metas_financeiras')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metas_financeiras'] });
      toast.success('Meta removida com sucesso');
    },
  });

  const saveMetasGeradas = async (metasGeradas: MetasGeradas) => {
    if (!user) throw new Error('Usuário não autenticado');

    // Delete existing AI-generated metas
    await supabase
      .from('metas_financeiras')
      .delete()
      .eq('user_id', user.id)
      .eq('criada_por_ai', true);

    // Insert new metas
    const metasToInsert = metasGeradas.metas.map(meta => ({
      ...meta,
      user_id: user.id,
      metadata: meta.metadata as any,
    }));

    const { error } = await supabase
      .from('metas_financeiras')
      .insert(metasToInsert);

    if (error) throw error;

    queryClient.invalidateQueries({ queryKey: ['metas_financeiras'] });
    toast.success('Metas financeiras geradas com sucesso!');
  };

  // Calculate aggregated data
  const metasAtivas = metas.filter(m => m.ativa);
  const metaReserva = metasAtivas.find(m => m.tipo_meta === 'reserva_emergencia');
  const metasDividas = metasAtivas.filter(m => m.tipo_meta === 'quitar_divida');
  const metaEconomia = metasAtivas.find(m => m.tipo_meta === 'economia_mensal');
  const metaDistribuicao = metasAtivas.find(m => m.tipo_meta === 'distribuicao');

  const progressoGeral = metasAtivas.length > 0
    ? metasAtivas.reduce((sum, m) => sum + m.progresso, 0) / metasAtivas.length
    : 0;

  return {
    metas,
    metasAtivas,
    metaReserva,
    metasDividas,
    metaEconomia,
    metaDistribuicao,
    progressoGeral,
    isLoading,
    refetch,
    createMeta,
    updateMeta,
    deleteMeta,
    saveMetasGeradas,
  };
}
