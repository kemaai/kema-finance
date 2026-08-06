# Dashboard fiel às imagens de referência

Objetivo: reconstruir a aparência do Dashboard (claro e escuro) exatamente como nas duas telas anexadas — mesma estrutura, mesmas cores, mesmos componentes. Nenhum cálculo, consulta ou regra de negócio muda.

## O que muda visualmente

**Paleta**
- Claro: fundo branco/quase-branco, cartões brancos com borda cinza-clara de 1px e cantos ~20px, sombra praticamente inexistente. Cor principal verde-esmeralda (pílula "Quinzenal", avatar, valores positivos). Acentos: laranja (serviços), azul (instalações), roxo (clientes), vermelho/coral (despesas).
- Escuro: fundo quase-preto, cartões em tom levemente elevado com borda sutil, cada KPI com leve halo colorido do seu acento; laranja como cor da pílula ativa e da navegação, como na imagem.

**Cabeçalho**
- Avatar circular com iniciais (só no claro, conforme imagem), saudação "Olá, Adriano! 👋" + subtítulo, e à direita botões de sino e de atualizar em círculos discretos.
- Linha de filtros: chip "Atualizado agora mesmo" à esquerda; à direita rótulo "Período" e segmento arredondado Semanal / Quinzenal / Mensal com o item ativo preenchido.

**Cartões KPI**
- Claro: uma faixa de 5 cartões iguais, brancos — tile quadrado colorido com ícone + rótulo em cima, número grande colorido embaixo, linha de apoio em cinza. Sem gradientes, sem 3D, sem vidro.
- Escuro: mesmos 5 cartões em blocos escuros com ícone em círculo colorido e mini-sparkline à direita, empilhados 2+2+1 como na imagem.
- Em telas pequenas os 5 cartões usam grade de 2 colunas (o quinto ocupa a linha inteira).

**KemaFinance AI**
- Cartão largo: título com ícone, "Score de Saúde Financeira", número grande + barra de progresso fina, caixinha de situação ("Crítica" + variação), e um bloco de dica com ícone de lâmpada. Ilustração à direita apenas quando há espaço (desktop/tablet).

**Performance de Receita**
- Cartão branco/escuro com título + subtítulo, variação percentual e seletor de tipo de gráfico ("Linha") no canto.
- Gráfico de linhas finas com pontos marcados, grade horizontal muito leve, eixo Y em R$, legenda embaixo (claro) ou em cima (escuro) com Serviços, Instalações, Despesas e Saldo Líquido tracejado. Remove o preenchimento em área/gradientes atuais.

**Três cartões inferiores**
- "Serviços do Mês" e "Despesas Próximas": ícone + título, subtítulo "Mês atual", ilustração/ícone central e texto de estado vazio.
- "Instalações não pagas": contador em badge, lista com avatar de iniciais, nome, ambiente, valor em vermelho e data; link "Ver todas (3)" no rodapé.

**Navegação inferior (mobile)**
- Barra fixa com 5 itens; ativo com fundo pílula verde-claro (modo claro) ou ícone laranja (modo escuro), exatamente como nas imagens.

## Detalhes técnicos

- `src/index.css`: reescrever tokens claro/escuro (fundo, cartão, borda, primária verde, família de acentos) e substituir as utilidades de vidro/3D/gradiente por `.card-flat`, `.icon-tile` sólido e `.segmented`.
- `src/components/DashboardCard.tsx`: simplificar para um único estilo flat com variantes de cor, mantendo a API atual (title, value, icon, variant, subValue) para não quebrar chamadas.
- `src/pages/Dashboard.tsx`: trocar o bento assimétrico pela faixa de 5 KPIs + seções na ordem das imagens; manter todo o cálculo intacto.
- `src/components/RevenueChart.tsx`: linhas finas com pontos, sem área, grade suave, legenda reposicionada, tooltip simples.
- `src/components/KemaAIWidget.tsx`, `MobileNavigation.tsx`, `AppSidebar.tsx`: ajustar ao novo estilo flat.
- Fontes mantidas (Outfit/Figtree), que correspondem ao geométrico das imagens.
