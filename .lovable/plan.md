# Destaque visual para cards de "Pedido Recebido"

## Problema
Atualmente, quando o checkbox "Pedido Recebido" é marcado, apenas a pequena faixa do checkbox fica verde. O resto do card (#12957 vs #13322 na imagem) continua visualmente idêntico aos demais, dificultando identificar rapidamente quais pedidos já foram pagos/recebidos — especialmente porque o badge de status "Concluído" também é verde.

## Solução
Aplicar um destaque verde envolvendo o card **inteiro** quando `pedido_recebido === true`, mantendo todos os dados perfeitamente legíveis (sem cobrir conteúdo, sem reduzir contraste).

### Comportamento visual proposto
Quando `pedido_recebido` for `true`, o card terá:

1. **Borda verde brilhante em todo o perímetro** (em vez da borda padrão `border-border`) — substitui também a borda lateral laranja (`border-l-orange-500`) por verde, deixando claro o "estado pago".
2. **Fundo levemente esverdeado** usando uma camada translúcida (`bg-emerald-500/5` no claro, `bg-emerald-500/10` no escuro) — sutil o suficiente para não competir com o texto.
3. **Glow/ring verde externo** (`ring-2 ring-emerald-500/40` + `shadow-[0_0_20px_rgba(16,185,129,0.15)]`) que cria o efeito de "halo" ao redor do card, separando-o visualmente dos demais.
4. **Hover preserva o destaque verde** (em vez de virar laranja), reforçando o estado.

A faixa interna do checkbox "Pedido Recebido" continua existindo, mas agora reforça o estado em vez de ser o único indicador.

### Comparação visual (ASCII)

```text
ANTES (recebido)              DEPOIS (recebido)
┌────────────────────┐        ╔════════════════════╗  ← ring verde + glow
│▌ #13322  Concluído │        ║▌ #13322  Concluído ║
│  Bianca            │        ║  Bianca            ║  ← fundo verde sutil
│ ┌────────────────┐ │        ║ ┌────────────────┐ ║
│ │✓ Pedido Receb. │ │        ║ │✓ Pedido Receb. │ ║
│ └────────────────┘ │        ║ └────────────────┘ ║
│  R$ 2071,20        │        ║  R$ 2071,20        ║
└────────────────────┘        ╚════════════════════╝
(idêntico aos outros)         (claramente diferente)
```

Cards **não recebidos** mantêm exatamente o visual atual (borda lateral laranja, fundo padrão), preservando consistência com o restante do sistema.

## Detalhes técnicos

**Arquivo único alterado:** `src/components/InstalacaoCard.tsx`

Alterar a `className` do container raiz (atualmente):
```tsx
className="card-tech rounded-xl overflow-hidden border border-border border-l-4 border-l-orange-500 hover:border-primary/50 hover:border-l-orange-400 transition-all duration-300"
```

Para uma versão condicional baseada em `instalacao.pedido_recebido`, usando `cn()` de `@/lib/utils`:

```tsx
import { cn } from '@/lib/utils';

<div
  className={cn(
    "card-tech rounded-xl overflow-hidden border border-l-4 transition-all duration-300",
    instalacao.pedido_recebido
      ? "border-emerald-500/60 border-l-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 ring-2 ring-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:ring-emerald-500/60 hover:border-emerald-400"
      : "border-border border-l-orange-500 hover:border-primary/50 hover:border-l-orange-400"
  )}
>
```

### Notas
- Usa a paleta `emerald-500` já presente no `StatusBadge` (`success` tone), mantendo consistência.
- Opacidade baixa no fundo (`/5` e `/10`) garante que texto branco/orange (R$ 2071,20) permaneça totalmente legível.
- `ring` é externo (não consome espaço interno), então layout/dados não se deslocam.
- Não toca em regra de negócio, hooks, banco, ou no `InstalacaoForm`.
- Não altera o card no estado "não recebido".

## Fora do escopo
- Mudanças no badge de status "Concluído".
- Mudanças no formulário de instalação.
- Animação de transição ao marcar/desmarcar (pode ser adicionada depois se desejado).
