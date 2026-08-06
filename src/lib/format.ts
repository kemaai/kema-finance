/** Formatação de valores para exibição (apenas apresentação). */

const nf = (min: number, max: number) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: min, maximumFractionDigits: max });

/** R$ 1.234,56 */
export function formatBRL(value: number): string {
  return `R$ ${nf(2, 2).format(Number(value) || 0)}`;
}

/**
 * Valor monetário compacto para cards: acima de 10 mil usa sufixo
 * (R$ 24,1 mil / R$ 1,25 mi) para nunca estourar a largura do card.
 */
export function formatBRLCompact(value: number): string {
  const v = Number(value) || 0;
  const abs = Math.abs(v);
  const sign = v < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}R$ ${nf(0, 2).format(abs / 1_000_000)} mi`;
  if (abs >= 10_000) return `${sign}R$ ${nf(0, 1).format(abs / 1_000)} mil`;
  return `${sign}R$ ${nf(2, 2).format(abs)}`;
}

/** Versão curta sem centavos, usada em subtítulos. */
export function formatBRLShort(value: number): string {
  const v = Number(value) || 0;
  const abs = Math.abs(v);
  const sign = v < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}R$ ${nf(0, 1).format(abs / 1_000_000)}mi`;
  if (abs >= 1_000) return `${sign}R$ ${nf(0, 1).format(abs / 1_000)}k`;
  return `${sign}R$ ${nf(0, 0).format(abs)}`;
}
