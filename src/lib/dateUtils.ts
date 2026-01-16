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

/**
 * Formata o período para exibição
 */
export const formatPeriodo = (
  periodo: 'semanal' | 'mensal' | 'anual',
  semana: number,
  mes: number,
  ano: number
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
    default:
      return '';
  }
};

/**
 * Obtém as datas de início e fim baseado no período selecionado
 */
export const getPeriodoDatas = (
  periodo: 'semanal' | 'mensal' | 'anual',
  semana: number,
  mes: number,
  ano: number
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
    default:
      dataInicio = new Date(ano, mes, 1);
      dataFim = new Date(ano, mes + 1, 0);
  }

  return { dataInicio, dataFim };
};
