export interface CategoriaGasto {
  nome: string;
  emoji: string;
  /** Classe de cor do design system usada em ícones/gráficos */
  tone: 'orange' | 'blue' | 'green' | 'violet' | 'pink' | 'teal';
  /** Considerado essencial por padrão */
  essencialPadrao: boolean;
}

export const CATEGORIAS_GASTO: CategoriaGasto[] = [
  { nome: 'Alimentação', emoji: '🍽️', tone: 'orange', essencialPadrao: true },
  { nome: 'Mercado', emoji: '🛒', tone: 'green', essencialPadrao: true },
  { nome: 'Transporte', emoji: '🚗', tone: 'blue', essencialPadrao: true },
  { nome: 'Combustível', emoji: '⛽', tone: 'blue', essencialPadrao: true },
  { nome: 'Saúde', emoji: '💊', tone: 'teal', essencialPadrao: true },
  { nome: 'Casa', emoji: '🏠', tone: 'violet', essencialPadrao: true },
  { nome: 'Educação', emoji: '📚', tone: 'violet', essencialPadrao: true },
  { nome: 'Trabalho', emoji: '🧰', tone: 'teal', essencialPadrao: true },
  { nome: 'Lazer', emoji: '🎬', tone: 'pink', essencialPadrao: false },
  { nome: 'Assinaturas', emoji: '📺', tone: 'pink', essencialPadrao: false },
  { nome: 'Compras', emoji: '🛍️', tone: 'orange', essencialPadrao: false },
  { nome: 'Outros', emoji: '📦', tone: 'violet', essencialPadrao: false },
];

export const FORMAS_PAGAMENTO = ['Pix', 'Débito', 'Crédito', 'Dinheiro', 'Boleto', 'Transferência'];

export const CATEGORIA_COLOR: Record<CategoriaGasto['tone'], string> = {
  orange: 'hsl(var(--accent-orange))',
  blue: 'hsl(var(--accent-blue))',
  green: 'hsl(var(--accent-green))',
  violet: 'hsl(var(--accent-violet))',
  pink: 'hsl(var(--accent-pink))',
  teal: 'hsl(var(--teal))',
};

export const getCategoria = (nome: string): CategoriaGasto =>
  CATEGORIAS_GASTO.find(c => c.nome === nome) ?? CATEGORIAS_GASTO[CATEGORIAS_GASTO.length - 1];

export const corDaCategoria = (nome: string) => CATEGORIA_COLOR[getCategoria(nome).tone];
