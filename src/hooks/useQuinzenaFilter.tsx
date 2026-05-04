import { useState, useMemo } from 'react';
import { parseLocalDate } from '@/lib/utils';

interface Instalacao {
  id: string;
  user_id: string;
  numero_pedido: string;
  endereco: string;
  ambiente: string;
  arquiteto_nome: string;
  data_instalacao: string;
  valor_total: number;
  status: string;
  pedido_recebido: boolean;
  created_at: string;
  updated_at: string;
}

export const useQuinzenaFilter = (instalacoes: Instalacao[]) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedQuinzena, setSelectedQuinzena] = useState<'primeira' | 'segunda' | 'todas'>('todas');

  const filteredInstalacoes = useMemo(() => {
    if (!instalacoes || instalacoes.length === 0) return [];

    const filtered = instalacoes.filter((instalacao) => {
      const dataInstalacao = parseLocalDate(instalacao.data_instalacao);
      
      // Filtrar por mês e ano
      const isSameMonth = dataInstalacao.getMonth() === selectedMonth.getMonth();
      const isSameYear = dataInstalacao.getFullYear() === selectedMonth.getFullYear();
      
      if (!isSameMonth || !isSameYear) return false;

      // Filtrar por quinzena
      if (selectedQuinzena === 'todas') return true;
      
      const day = dataInstalacao.getDate();
      
      if (selectedQuinzena === 'primeira') {
        return day >= 1 && day <= 15;
      } else if (selectedQuinzena === 'segunda') {
        return day >= 16 && day <= 31;
      }
      
      return true;
    });

    // Ordenar por data de instalação (mais recente primeiro);
    // dentro da mesma data, "pedido recebido" vem antes dos demais.
    return filtered.sort((a, b) => {
      const dateA = parseLocalDate(a.data_instalacao).getTime();
      const dateB = parseLocalDate(b.data_instalacao).getTime();
      if (dateA !== dateB) return dateB - dateA;
      const recA = a.pedido_recebido ? 1 : 0;
      const recB = b.pedido_recebido ? 1 : 0;
      return recB - recA;
    });
  }, [instalacoes, selectedMonth, selectedQuinzena]);

  const totalValorQuinzena = useMemo(() => {
    return filteredInstalacoes.reduce((total, instalacao) => {
      return total + Number(instalacao.valor_total || 0);
    }, 0);
  }, [filteredInstalacoes]);

  const totalMetrosQuadrados = useMemo(() => {
    return filteredInstalacoes.reduce((total, instalacao) => {
      return total + (Number(instalacao.valor_total || 0) / 24);
    }, 0);
  }, [filteredInstalacoes]);

  const totalMetrosQuadradosMes = useMemo(() => {
    if (!instalacoes || instalacoes.length === 0) return 0;

    const instalacoesMes = instalacoes.filter((instalacao) => {
      const dataInstalacao = parseLocalDate(instalacao.data_instalacao);
      const isSameMonth = dataInstalacao.getMonth() === selectedMonth.getMonth();
      const isSameYear = dataInstalacao.getFullYear() === selectedMonth.getFullYear();
      return isSameMonth && isSameYear;
    });
    
    return instalacoesMes.reduce((total, instalacao) => {
      return total + (Number(instalacao.valor_total || 0) / 24);
    }, 0);
  }, [instalacoes, selectedMonth]);

  return {
    selectedMonth,
    selectedQuinzena,
    filteredInstalacoes,
    totalValorQuinzena,
    totalMetrosQuadrados,
    totalMetrosQuadradosMes,
    setSelectedMonth,
    setSelectedQuinzena,
  };
};
