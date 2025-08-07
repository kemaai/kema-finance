
import { useState, useMemo } from 'react';
import { addMonths, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';

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

export const useSiteMonthFilter = (sites: Site[]) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const filteredSites = useMemo(() => {
    if (!sites || sites.length === 0) return [];

    return sites.filter((site) => {
      const dataVencimento = new Date(site.data_vencimento);
      return isSameMonth(dataVencimento, selectedMonth);
    });
  }, [sites, selectedMonth]);

  const goToPreviousMonth = () => {
    setSelectedMonth(prev => addMonths(prev, -1));
  };

  const goToNextMonth = () => {
    setSelectedMonth(prev => addMonths(prev, 1));
  };

  const goToCurrentMonth = () => {
    setSelectedMonth(new Date());
  };

  return {
    selectedMonth,
    filteredSites,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
  };
};
