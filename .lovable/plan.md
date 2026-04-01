

## Redesign Visual Premium Completo - Estilo Rico App

Redesign completo de cores, tipografia, layout e componentes para visual premium dark com tons navy/indigo, inspirado no app Rico.

### Paleta de Cores

```text
Background:     #080B1A  (navy profundo)
Cards:          #111631  (indigo escuro)
Cards hover:    #1A1F45  (indigo médio)
Borders:        #1E2450  (indigo border)
Primary (CTA):  #F97316  (laranja vibrante)
Text primary:   #E2E8F0  (branco suave)
Text secondary: #64748B  (slate)
Success:        #22C55E
Danger:         #EF4444
Warning:        #F59E0B
Info/Accent:    #6366F1  (indigo)
Bottom nav bg:  #0A0E24
Sidebar bg:     #0A0E24
Input bg:       #111631
```

### Arquivos a Alterar (15 arquivos)

**1. `src/index.css`** -- Core design system
- Reescrever todas CSS variables (dark como principal, light ajustado)
- Atualizar `card-tech` para background indigo `#111631` com border `#1E2450`
- `btn-tech` com gradiente laranja mais vibrante
- `input-tech` com bg indigo e focus ring laranja
- `bg-tech-particles` com gradientes navy/indigo sutis
- Remover `bg-grid-pattern` (visual mais limpo como Rico)
- Novos shadows com tonalidade navy ao inves de preto puro
- Badges atualizados para tons mais vibrantes sobre fundo escuro

**2. `src/components/Layout.tsx`** -- Layout limpo
- Remover `bg-tech-particles` e `bg-grid-pattern` overlays do main content
- Header mobile: background navy solido `#0A0E24`, borda indigo sutil
- Clean layout sem efeitos visuais sobrepostos

**3. `src/components/AppSidebar.tsx`** -- Sidebar premium
- Background navy profundo
- Items ativos com highlight indigo `bg-indigo-500/20` + borda esquerda laranja
- Footer com avatar circular estilizado
- Separadores indigo sutis
- Logo "Kema AI" em branco com accent laranja

**4. `src/components/MobileNavigation.tsx`** -- Bottom nav estilo Rico
- Background navy solido `#0A0E24`
- Items ativos com icone em circulo laranja (como Rico)
- Sem carousel - usar scroll horizontal simples com 5 items principais visíveis
- Texto menor, mais compacto

**5. `src/components/DashboardCard.tsx`** -- Cards premium
- Background indigo com gradient sutil
- Bordas indigo, hover com glow sutil
- Ícones em círculos com fundo mais vibrante
- Valores em branco bold, subtítulos em slate

**6. `src/pages/Dashboard.tsx`** -- Layout dashboard redesenhado
- Hero section: gradiente navy com saudação em branco, sem orbs animados
- Cards em grid 2x2 no mobile (como Rico) ao invés de 1 coluna
- Seção de gráfico com card indigo
- Listas (vencimentos, despesas, instalações) com items em rows indigo
- Filtro de período com pills indigo/laranja
- Botão refresh mais discreto integrado ao header

**7. `src/components/AuthForm.tsx`** -- Login premium
- Background navy puro sem particles/grid
- Card central em indigo com bordas sutis
- Tabs com estilo pill (bg indigo, active laranja)
- Inputs com bg navy escuro e focus laranja

**8. `src/pages/Clientes.tsx`** -- Layout clientes modernizado
- Header com título e botão em linha, estilo compacto
- Grid de cards com espaçamento uniforme
- Botão "Novo Cliente" com estilo pill laranja

**9. `src/pages/Sites.tsx`** -- Layout sites modernizado
- Receita mensal em destaque como badge grande no topo
- Barra de busca com bg indigo e ícone integrado
- Filtros com estilo pill

**10. `src/pages/Despesas.tsx`** -- Layout despesas modernizado
- Cards de estatísticas compactos com ícones coloridos
- Navegação de mês com setas estilizadas
- Tabs de vencimento com estilo moderno

**11. `src/pages/Instalacoes.tsx`** -- Layout instalações modernizado
- Resumo da quinzena em card highlight com borda laranja
- Grid responsivo otimizado

**12. `src/pages/Dividas.tsx`** -- Layout dívidas modernizado
- Cards de resumo com gradientes sutis
- Tabs de empréstimos/dívidas com estilo moderno

**13. `src/pages/Relatorios.tsx`** -- Layout relatórios modernizado
- Filtros compactos no topo
- Cards de métricas com visual premium

**14. `src/components/KemaAIWidget.tsx`** -- Widget AI premium
- Card com borda gradiente indigo->laranja
- Score em destaque grande
- Alerta principal com bg indigo

**15. `src/components/RevenueChart.tsx`** -- Cores do gráfico
- Atualizar paleta de cores para tons que combinem com fundo navy/indigo
- Grid lines em indigo sutil

### Princípios de Design
- Mobile-first: cards 2x2 no mobile, como app Rico
- Tipografia: Inter/system font, hierarquia clara (branco bold para valores, slate para labels)
- Espaçamento: padding consistente `p-4` mobile, `p-6` desktop
- Transições suaves em hover/focus
- Sem efeitos "tech" excessivos (particles, grid overlay) -- visual limpo premium
- Dark mode como experiência principal (light mode mantido funcional)

### Nota Tecnica
- Alterações são 100% visuais via CSS variables e classes Tailwind
- Nenhuma funcionalidade ou lógica de negócio será alterada
- Componentes shadcn/ui herdam automaticamente das CSS variables
- O `tailwind.config.ts` não precisa ser alterado (usa CSS vars)

