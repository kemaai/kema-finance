# Dashboard: novo visual fiel às referências

Refazer o visual do Dashboard seguindo as imagens anexadas: modo claro = soft-UI pastel (imagem 2), modo escuro = fintech premium preto/azul elétrico (imagem 1). Nenhum cálculo, query ou regra de negócio muda.

## Direção

- **Claro (padrão)**: fundo azul-gelo suave, cards brancos com cantos arredondados e sombra macia difusa (sem bordas duras, sem blocos de cor sólida chapada). Acentos coloridos aparecem em: ícones dentro de quadradinhos com gradiente (rosa, verde, laranja, azul, roxo), barras de progresso finas e um pequeno KPI-card em gradiente. Cada card recebe uma barra de acento vertical à esquerda, como na referência.
- **Escuro**: fundo quase preto, superfícies carvão com borda de 1px muito sutil, número principal em azul elétrico, gráfico de linha fino com tooltip flutuante em card escuro, brilho radial discreto.
- **Tipografia**: Outfit nos títulos e números, Figtree no corpo. Números grandes com tabular-nums e sinal (+/-) colorido antes do valor, igual às referências.

## O que muda

### 1. Tokens (`src/index.css`, `tailwind.config.ts`, `index.html`)
- Reescrever `:root`: fundo `#eaf2f8`-ish, superfície branca, texto grafite, borda quase invisível.
- Reescrever `.dark`: fundo `#0b0b0d`, superfície `#141416`, borda `#232326`, primário azul elétrico.
- Nova família de tokens de acento pastel com par de gradiente: `--accent-pink`, `--accent-green`, `--accent-orange`, `--accent-blue`, `--accent-violet` (cada um com `-from` / `-to` para os gradientes).
- Sombras macias em camadas (`--shadow-soft`, `--shadow-lift`), raio maior (`1rem`/`1.25rem`).
- Trocar as fontes para Outfit + Figtree.

### 2. `DashboardCard.tsx`
Mesma API (`title`, `value`, `subValue`, `icon`, `variant`, `trend`, `featured`):
- Card branco com sombra macia, barra de acento colorida à esquerda.
- Ícone em quadradinho arredondado com gradiente da cor da variante.
- Valor em Outfit, tabular, com seta/sinal colorido.
- `trend` como texto pequeno com seta ↑↓ verde/vermelha e uma barra fina de progresso sob o valor.
- `featured` vira card em gradiente cheio (estilo os quatro cards coloridos do topo da referência).

### 3. `src/pages/Dashboard.tsx` (só marcação)
- Cabeçalho leve com saudação, data e filtro de período em pílula segmentada branca com item ativo sublinhado.
- Faixa superior: 4 KPI-cards em gradiente (Despesas rosa, Receita verde, Reserva laranja, Saldo azul).
- Abaixo: bloco do gráfico em card branco largo + coluna lateral com widgets (KemaAI, Serviços do Mês, Alertas, Ações Rápidas) como cards brancos com cabeçalho de acento.
- Listas internas dos widgets no padrão "ícone colorido + rótulo + barra de progresso + valor à direita".
- Skeletons com a forma do conteúdo.
- Mobile: uma coluna, KPIs 2x2 com respiro.

### 4. `RevenueChart.tsx`
Mesmos dados e séries (Serviços, Instalações, Despesas, Saldo Líquido):
- Linhas finas com gradiente suave abaixo, grid quase invisível, eixos em cinza claro.
- Tooltip como card flutuante (branco no claro, carvão no escuro) com data, valor e variação %.
- Legenda em chips coloridos pequenos.
- Cores vindas dos novos tokens de acento.

### 5. Navegação
- `AppSidebar.tsx`: coluna estreita clara, item ativo como pílula com gradiente suave e ícone colorido.
- `MobileNavigation.tsx`: barra flutuante branca com sombra macia e indicador ativo em pílula gradiente.
- `Layout.tsx`: cabeçalho mobile leve sobre o novo fundo.

## Fora do escopo
Telas internas (Clientes, Serviços, Instalações, Despesas, Dívidas, Relatórios, Perfil, Configurações) herdam as novas cores e fontes, mas não são recompostas agora.

## Detalhes técnicos
- Zero mudança em hooks, queries Supabase, edge functions, RLS ou cálculos (incluindo `valor_total / valor_m2`).
- Todas as cores via tokens semânticos; nenhuma cor literal em componentes.
- `data-testid` e `id` de automação preservados.
- Contraste verificado nos dois temas; verificação final com typecheck e captura em mobile e desktop.
