# Redesign 2026 — Dashboard e Navegação

Modernização completa do visual e da experiência, **sem alterar nenhuma funcionalidade, cálculo ou regra de negócio**. Todos os dados, filtros e ações continuam idênticos — muda a forma, não o conteúdo.

## Direção visual escolhida

- **Paleta**: Navy + Laranja refinada — fundo `#080B1A`, superfícies `#141A33`, acento primário laranja `#F97316`, acento secundário teal `#2D8A9E` (novo, usado em gráficos e estados informativos).
- **Tipografia**: Sora nos títulos e números, Manrope no corpo. Números financeiros com espaçamento tabular para alinhamento em coluna.
- **Layout**: Bento Grid — blocos de tamanhos diferentes, com hierarquia real em vez de uma grade uniforme de 5 cards iguais.

## Gaps identificados no app atual

1. Todos os KPIs têm o mesmo peso visual — nada indica o que é mais importante.
2. Cards com muito contorno e pouca respiração; densidade alta no mobile (2x2 apertado).
3. O gráfico de receita é a informação mais rica, mas ocupa um bloco visualmente igual aos demais.
4. Sidebar sem hierarquia: todos os itens têm o mesmo tratamento, o item ativo é pouco evidente.
5. Navegação mobile plana, sem destaque para a ação principal.
6. Estados de carregamento genéricos (spinner) em vez de skeletons com a forma do conteúdo.
7. Referências modernas (imagens anexadas) usam ícones coloridos em pastilha, microtipografia hierárquica e superfícies com profundidade suave — o app hoje usa borda plana.

## O que será feito

### 1. Fundação de design (tokens)
- Novos tokens de cor em `src/index.css`: superfícies em camadas (`surface-1/2/3`), acento teal, tokens de gráfico, sombras suaves com profundidade e um gradiente de destaque.
- Fontes Sora + Manrope carregadas via `index.html` e registradas em `tailwind.config.ts` (`font-display` / `font-sans`).
- Raio de borda maior e escala de espaçamento mais generosa.

### 2. Cards KPI
Refatorar `DashboardCard.tsx` mantendo a API atual (`variant`, `icon`, `value`, `subValue`, `trend`):
- Ícone em pastilha arredondada colorida (padrão da referência 1).
- Valor em Sora, grande, tabular.
- Indicador de tendência com seta e cor semântica.
- Superfície com profundidade suave em vez de borda dura; hover com elevação leve.
- Variante `featured` para o card de destaque no bento.

### 3. Dashboard em Bento Grid
Reorganizar `src/pages/Dashboard.tsx` (só marcação e classes — os cálculos ficam intocados):
- Bloco hero de saldo/receita ocupando 2 colunas, com o gráfico integrado.
- KPIs secundários em blocos menores ao redor.
- Widgets (KemaAI, Serviços do Mês, Alertas, Ações Rápidas) redistribuídos como blocos do bento em vez de linha uniforme.
- Cabeçalho redesenhado: saudação, data e botão de sincronizar como chip discreto.
- Filtro de período como segmented control moderno.
- Skeletons no lugar do spinner.

### 4. Gráficos
`RevenueChart.tsx` — mesmos dados e séries (Serviços, Instalações, Despesas, Saldo Líquido):
- Áreas com gradiente, linhas mais finas, grid quase invisível.
- Tooltip customizado com card escuro e valores formatados em BRL.
- Legenda como chips clicáveis.
- Eixos com tipografia menor e mais clara.

### 5. Navegação
- `AppSidebar.tsx`: item ativo com pílula sólida e barra de acento, ícones consistentes, grupos com rótulos discretos, rodapé de perfil redesenhado.
- `MobileNavigation.tsx`: barra flutuante arredondada com indicador ativo animado e botão de ação central em destaque.
- `Layout.tsx`: cabeçalho mobile mais leve, respeitando safe-area.

## Fora do escopo desta entrega
Telas internas (Clientes, Serviços, Instalações, Despesas, Dívidas, Relatórios, Agente) mantêm o layout atual — herdam apenas os novos tokens de cor e tipografia. Podem ser redesenhadas numa próxima etapa.

## Detalhes técnicos
- Nenhuma mudança em hooks, queries Supabase, edge functions, RLS ou lógica de cálculo (incluindo `valor_total / valor_m2`).
- Todas as cores via tokens semânticos; nenhuma cor literal em componentes.
- Todos os `data-testid` e `id` de automação existentes preservados.
- Modo claro e escuro validados; verificação de contraste nos pares texto/fundo.
- Verificação final com typecheck e captura da tela em mobile e desktop.
