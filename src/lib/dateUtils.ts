// Utilitários de data para relatórios

/**
 * Obtém o número da semana do ano para uma data
 */
export const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

/**
 * Obtém a data de início de uma semana específica do ano
 */
export const getStartOfWeek = (year: number, week: number): Date => {
  const jan1 = new Date(year, 0, 1);
  const daysOffset = (week - 1) * 7;
  const dayOfWeek = jan1.getDay();
  const daysToMonday = dayOfWeek === 0 ? 1 : (dayOfWeek === 1 ? 0 : 8 - dayOfWeek);
  const firstMonday = new Date(year, 0, 1 + daysToMonday);
  return new Date(firstMonday.getTime() + daysOffset * 24 * 60 * 60 * 1000);
};

/**
 * Obtém a data de fim de uma semana específica do ano
 */
export const getEndOfWeek = (year: number, week: number): Date => {
  const startOfWeek = getStartOfWeek(year, week);
  return new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000);
};

/**
 * Verifica se uma data está dentro de um período
 */
export const isDateInPeriod = (date: Date, start: Date, end: Date): boolean => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const s = new Date(start);
  s.setHours(0, 0, 0, 0);
  const e = new Date(end);
  e.setHours(23, 59, 59, 999);
  return d >= s && d <= e;
};

/**
 * Obtém o total de semanas em um ano
 */
export const getTotalWeeksInYear = (year: number): number => {
  const dec31 = new Date(year, 11, 31);
  return getWeekNumber(dec31);
};

export type PeriodoTipo = 'semanal' | 'mensal' | 'anual' | 'personalizado';

export interface PeriodoRange {
  mesInicio: number;
  anoInicio: number;
  mesFim: number;
  anoFim: number;
}

/**
 * Formata o período para exibição
 */
export const formatPeriodo = (
  periodo: PeriodoTipo,
  semana: number,
  mes: number,
  ano: number,
  range?: PeriodoRange
): string => {
  const nomesMeses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  switch (periodo) {
    case 'semanal':
      const inicio = getStartOfWeek(ano, semana);
      const fim = getEndOfWeek(ano, semana);
      return `Semana ${semana} (${inicio.toLocaleDateString('pt-BR')} - ${fim.toLocaleDateString('pt-BR')})`;
    case 'mensal':
      return `${nomesMeses[mes]} de ${ano}`;
    case 'anual':
      return `Ano ${ano}`;
    case 'personalizado':
      if (!range) return '';
      return `${nomesMeses[range.mesInicio]}/${range.anoInicio} até ${nomesMeses[range.mesFim]}/${range.anoFim}`;
    default:
      return '';
  }
};

/**
 * Obtém as datas de início e fim baseado no período selecionado
 */
export const getPeriodoDatas = (
  periodo: PeriodoTipo,
  semana: number,
  mes: number,
  ano: number,
  range?: PeriodoRange
): { dataInicio: Date; dataFim: Date } => {
  let dataInicio: Date;
  let dataFim: Date;

  switch (periodo) {
    case 'semanal':
      dataInicio = getStartOfWeek(ano, semana);
      dataFim = getEndOfWeek(ano, semana);
      break;
    case 'mensal':
      dataInicio = new Date(ano, mes, 1);
      dataFim = new Date(ano, mes + 1, 0);
      break;
    case 'anual':
      dataInicio = new Date(ano, 0, 1);
      dataFim = new Date(ano, 11, 31);
      break;
    case 'personalizado': {
      const r = range ?? { mesInicio: mes, anoInicio: ano, mesFim: mes, anoFim: ano };
      dataInicio = new Date(r.anoInicio, r.mesInicio, 1);
      dataFim = new Date(r.anoFim, r.mesFim + 1, 0);
      break;
    }
    default:
      dataInicio = new Date(ano, mes, 1);
      dataFim = new Date(ano, mes + 1, 0);
  }

  return { dataInicio, dataFim };
};

/**
 * Gera os meses (buckets) de um intervalo personalizado
 */
export const getMesesDoIntervalo = (
  range: PeriodoRange
): { inicio: Date; fim: Date; label: string }[] => {
  const nomesMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const periodos: { inicio: Date; fim: Date; label: string }[] = [];
  let cursor = new Date(range.anoInicio, range.mesInicio, 1);
  const limite = new Date(range.anoFim, range.mesFim, 1);
  let guard = 0;
  while (cursor <= limite && guard < 240) {
    const inicio = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const fim = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    periodos.push({
      inicio,
      fim,
      label: `${nomesMeses[cursor.getMonth()]}/${cursor.getFullYear().toString().slice(-2)}`,
    });
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    guard++;
  }
  return periodos;
};

/**
 * Gera um array de períodos históricos para gráficos
 */
export const getHistoricoPeriodos = (
  periodo: 'semanal' | 'mensal' | 'anual',
  quantidade: number
): { inicio: Date; fim: Date; label: string }[] => {
  const periodos: { inicio: Date; fim: Date; label: string }[] = [];
  const hoje = new Date();
  const nomesMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  for (let i = quantidade - 1; i >= 0; i--) {
    let inicio: Date;
    let fim: Date;
    let label: string;

    switch (periodo) {
      case 'semanal':
        const semanaAtual = getWeekNumber(hoje);
        const anoAtual = hoje.getFullYear();
        let semanaAlvo = semanaAtual - i;
        let anoAlvo = anoAtual;
        
        if (semanaAlvo < 1) {
          anoAlvo = anoAtual - 1;
          semanaAlvo = getTotalWeeksInYear(anoAlvo) + semanaAlvo;
        }
        
        inicio = getStartOfWeek(anoAlvo, semanaAlvo);
        fim = getEndOfWeek(anoAlvo, semanaAlvo);
        label = `S${semanaAlvo}`;
        break;
        
      case 'mensal':
        const mesDate = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        inicio = new Date(mesDate.getFullYear(), mesDate.getMonth(), 1);
        fim = new Date(mesDate.getFullYear(), mesDate.getMonth() + 1, 0);
        label = `${nomesMeses[mesDate.getMonth()]}/${mesDate.getFullYear().toString().slice(-2)}`;
        break;
        
      case 'anual':
        const anoAlvoAnual = hoje.getFullYear() - i;
        inicio = new Date(anoAlvoAnual, 0, 1);
        fim = new Date(anoAlvoAnual, 11, 31);
        label = anoAlvoAnual.toString();
        break;
        
      default:
        inicio = new Date();
        fim = new Date();
        label = '';
    }

    periodos.push({ inicio, fim, label });
  }

  return periodos;
};
