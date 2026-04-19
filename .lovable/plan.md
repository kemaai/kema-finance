
## Padronização Visual dos Cards

O usuário quer que **todos os cards** da plataforma sigam o padrão da **primeira imagem** (cards coloridos com borda e ícone temáticos por categoria), em vez do padrão atual da **segunda imagem** (cards uniformes em navy escuro sem cor distintiva).

### Análise do Padrão Alvo (imagem 1)

Cada card tem cor temática aplicada em 3 elementos:
- **Borda colorida sutil** (border + glow)
- **Ícone colorido** dentro de um badge translúcido
- **Valor principal colorido** (texto destacado)
- Fundo permanece escuro mas com tom levemente tingido pela cor

Mapa de cores por tipo de métrica:
| Métrica | Cor |
|---|---|
| Instalações / Serviços | Orange (`primary`) |
| Receita / Pago | Green (`emerald-400`) |
| Metragem / Clientes | Blue (`blue-400`) |
| Despesas / Pendências | Red (`red-400`) |
| Dívidas / Empréstimos | Amber (`amber-400`) |
| Metas / Reservas | Indigo/Purple (`accent`) |

### Plano de Implementação

**1. Refatorar `DashboardCard.tsx`** (componente base)
- Adicionar prop `variant: 'orange' | 'green' | 'blue' | 'red' | 'amber' | 'purple'`
- Aplicar classes condicionais:
  - Borda: `border-{cor}/30`
  - Background tingido: `bg-gradient-to-br from-{cor}/5 to-transparent`
  - Badge do ícone: fundo `{cor}/10` com ícone `{cor}-400`
  - Valor principal: `text-{cor}-400`
- Reposicionar ícone para ficar **ao lado do título** (header do card), como na imagem 1

**2. Atualizar `Dashboard.tsx`** — atribuir variant correto a cada card:
- Receita Total → `green`
- Serviços do Mês → `orange`
- Instalações → `orange`
- Clientes → `blue`
- Despesas → `red`
- Metragem → `blue`

**3. Aplicar o mesmo padrão em outros componentes de card que exibem métricas:**
- `MetasProgressCard` → `purple`
- `MetaReservaCard` → `purple`
- `AlertasWidget` → `amber`
- `DiagnosticoCard` → manter neutro (texto longo)
- `PlanoDistribuicaoCard` → `indigo`

**4. Cards de listagem/CRUD** (`ClienteCard`, `SiteCard`, `ServicoCard`, `EmprestimoCard`, `DespesaCard`, `InstalacaoCard`, `DividaNegativadaCard`):
- Adicionar **faixa lateral colorida** (`border-l-4`) na cor da categoria para identificação visual rápida, sem alterar densidade da informação interna.

**5. Atualizar memory `mem://style/premium-design-system`** registrando o novo padrão "cards categorizados por cor".

### Tailwind — Garantia de classes
Como Tailwind faz purge, vou usar **classes completas estáticas** dentro de um mapa de variants (sem template strings dinâmicas), garantindo que `border-orange-500/30`, `text-emerald-400`, etc. sejam preservadas.

### Arquivos afetados
- `src/components/DashboardCard.tsx` (refator principal)
- `src/pages/Dashboard.tsx` (atribuir variants)
- `src/components/MetasProgressCard.tsx`
- `src/components/MetaReservaCard.tsx`
- `src/components/AlertasWidget.tsx`
- `src/components/PlanoDistribuicaoCard.tsx`
- 7 cards de listagem (faixa lateral colorida apenas)
- `mem://style/premium-design-system` (atualização)
