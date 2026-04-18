import { useState, useMemo } from 'react';
import { addMonths, isSameMonth } from 'date-fns';
import { parseLocalDate } from '@/lib/utils';

interface Servico {
  id: string;
  user_id: string;
  cliente_id: string;
  cliente_nome: string;
  nome_servico: string;
  valor: number;
  data_servico: string;
  descricao: string;
  status: string;
  pago: boolean;
  created_at: string;
  updated_at: string;
}

export const useServicoMonthFilter = (servicos: Servico[]) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const filteredServicos = useMemo(() => {
    if (!servicos || servicos.length === 0) return [];
    return servicos.filter((s) => isSameMonth(parseLocalDate(s.data_servico), selectedMonth));
  }, [servicos, selectedMonth]);

  return {
    selectedMonth,
    filteredServicos,
    goToPreviousMonth: () => setSelectedMonth(prev => addMonths(prev, -1)),
    goToNextMonth: () => setSelectedMonth(prev => addMonths(prev, 1)),
    goToCurrentMonth: () => setSelectedMonth(new Date()),
  };
};
