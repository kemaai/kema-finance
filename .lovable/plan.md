

## Atualizar cards Despesas Próximas e Instalações

### Card "Despesas Próximas" (alteração)
- Mostrar **todas as despesas não pagas do mês atual** (não apenas próximas 15 dias).
- Remover o subtítulo "A vencer em 15 dias" → trocar por "Mês atual".
- Separar visualmente em duas seções:
  - **Vencidas** (não pagas, data < hoje): fundo/borda/valor **vermelho** (red-500).
  - **A vencer** (não pagas, data >= hoje): fundo/borda/valor **laranja** (primary/orange-500).
- **Não exibir despesas pagas** (conforme pedido do usuário).
- Ordenar: vencidas primeiro (mais antigas no topo), depois a vencer (mais próximas no topo).
- Badge contador exibe o total não pagas do mês.

### Card "Instalações" (alteração)
- Mostrar **todas as instalações do mês atual** (status `Concluído` ou `Agendado`), separadas em:
  - **Pagas** (`pedido_recebido = true`): fundo/borda/valor **verde**, ícone `CheckCircle` verde.
  - **Não pagas** (`pedido_recebido = false`): fundo/borda/valor **laranja** (primary), ícone `Clock` ou similar.
- Cada grupo com um sub-cabeçalho pequeno: "Pagas (N)" e "Não pagas (N)".
- Substituir lógica atual `todasInstalacoes` (que mistura próximas + concluídas) por filtro do mês inteiro.
- Subtítulo do card: "Mês atual".
- Ordenar dentro de cada grupo por data (mais recentes primeiro).

### Implementação (1 arquivo: `src/pages/Dashboard.tsx`)

1. **Recalcular dados** (após linha 143):
   - `despesasNaoPagasMes` = despesas do mês atual onde `paga === false` → dividir em `vencidas` e `aVencer`.
   - `instalacoesMes` = instalações do mês atual (qualquer status relevante) → dividir por `pedido_recebido` em `pagas` e `naoPagas`.
   - Remover/substituir variáveis não usadas: `despesasProximasVencimento`, `proximasInstalacoes`, `instalacoesConcluidasMes`, `todasInstalacoes`.

2. **Atualizar JSX do card Despesas** (linhas 304–343):
   - Substituir lista única por duas seções renderizadas condicionalmente (vencidas vermelho, a vencer laranja).
   - Mostrar mensagem vazia somente se ambas estiverem vazias.

3. **Atualizar JSX do card Instalações** (linhas 345–397):
   - Substituir mapeamento único por duas seções (Pagas verde, Não pagas laranja) com sub-cabeçalho cada.
   - Manter scroll `max-h-72 overflow-y-auto`.

### Sem alterações em
- Lógica de queries / hooks
- Outros cards (Receita, Sites, Clientes, Despesas total, Vencimentos)
- Estilo global / componentes compartilhados

