# Dashboard 2026 — Transformação visual completa

Refazer o Dashboard do zero visualmente: modo claro branco com cores vivas, blocos bento coloridos e tipografia forte. Nenhuma funcionalidade, cálculo, query ou regra de negócio muda — só forma, cor e layout.

## Direção escolhida

- **Paleta**: fundo branco puro (#FFFFFF), superfícies off-white e cada bloco com sua própria cor sólida viva — lilás (#8B7CFF), lima (#C9F24D), pêssego (#FFB27A), azul elétrico (#2563EB), coral (#FF5A5F). Laranja da marca vira acento de ação (botões, ativo), não a cor de tudo.
- **Tipografia**: Space Grotesk nos títulos e números, DM Sans no corpo. Números grandes, tabulares, com peso real de hierarquia.
- **Layout**: Bento Grid multicolor — blocos de tamanhos diferentes, cada um com identidade de cor.
- **Tema padrão**: claro. O escuro continua funcionando e recebe a mesma linguagem em versão noturna.

## Por que o redesign anterior não pareceu novo

O visual continuou preso ao mesmo esquema: fundo escuro navy, cards translúcidos com borda e o mesmo laranja em tudo. Mudou o espaçamento, não a linguagem. Desta vez a mudança é estrutural: fundo branco, blocos com cor sólida de preenchimento, contraste alto e hierarquia agressiva.

## O que muda

### 1. Fundação de cor e tipo
- Reescrever os tokens de `:root` em `src/index.css`: fundo branco, superfícies neutras quentes, e uma nova família de tokens de bloco (`--block-violet`, `--block-lime`, `--block-peach`, `--block-blue`, `--block-coral`) com par de foreground para contraste garantido.
- Ajustar o bloco `.dark` para a versão noturna da mesma linguagem (blocos saturados sobre preto quase puro).
- Trocar as fontes em `index.html` e `tailwind.config.ts` para Space Grotesk + DM Sans.
- Raio de borda maior (blocos bem arredondados), sombras suaves e realistas em vez de glow.

### 2. Cards
Refatorar `DashboardCard.tsx` mantendo a API atual (`title`, `value`, `subValue`, `icon`, `variant`, `trend`, `featured`):
- Bloco de **cor sólida preenchida**, sem borda dura nem gradiente translúcido.
- Ícone em círculo de vidro sobre a cor do bloco.
- Valor enorme em Space Grotesk, rótulo pequeno em caixa alta discreta.
- Tendência como pílula com seta.
- `featured` vira bloco alto com número gigante e gráfico embutido.

### 3. Dashboard em bento
Reorganizar apenas a marcação de `src/pages/Dashboard.tsx` (cálculos intocados):
- Cabeçalho leve: saudação, data, filtro de período como segmented control em pílula e sincronizar como ícone discreto.
- Bloco hero de receita/saldo ocupando 2 colunas com o gráfico dentro.
- KPIs em blocos coloridos de tamanhos alternados ao redor.
- Widgets (KemaAI, Serviços do Mês, Alertas, Ações Rápidas) como blocos do bento, cada um com sua cor.
- Skeletons com a forma do conteúdo no lugar do spinner.
- Mobile: bento empilhado em 2 colunas com blocos que respiram, sem aperto.

### 4. Gráficos
`RevenueChart.tsx` — mesmos dados e séries (Serviços, Instalações, Despesas, Saldo Líquido):
- Áreas com gradiente suave sobre fundo claro, linhas finas, grid quase invisível.
- Tooltip em card branco com sombra e valores em BRL.
- Legenda como chips coloridos.
- Cores das séries vindas dos novos tokens de bloco.

### 5. Navegação
- `AppSidebar.tsx`: fundo branco, item ativo como pílula sólida colorida, ícones consistentes, rodapé de perfil limpo.
- `MobileNavigation.tsx`: barra flutuante branca com sombra, indicador ativo animado e ação central em destaque.
- `Layout.tsx`: cabeçalho mobile leve sobre fundo branco, respeitando safe-area.

## Fora do escopo
Telas internas (Clientes, Serviços, Instalações, Despesas, Dívidas, Relatórios, Agente, Configurações) herdam os novos tokens e fontes, mas não são recompostas agora — podem vir numa próxima etapa.

## Detalhes técnicos
- Nenhuma mudança em hooks, queries Supabase, edge functions, RLS ou cálculo (incluindo `valor_total / valor_m2`).
- Todas as cores via tokens semânticos em `index.css` + `tailwind.config.ts`; nenhuma cor literal em componentes.
- Todos os `data-testid` e `id` de automação preservados.
- Contraste verificado nos pares texto/bloco, claro e escuro.
- Verificação final com typecheck e captura da tela em mobile e desktop.
