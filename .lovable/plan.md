

## Card "Serviços Pendentes" no Dashboard — Reorganização

### Objetivo
Mostrar todos os serviços do **mês atual** organizados por status, com cores distintas. Renomear de "Serviços Pendentes" para refletir o novo escopo.

### Mudanças

**Arquivo único:** `src/pages/Dashboard.tsx`

1. **Título e subtítulo do card:**
   - "Serviços Pendentes" → "**Serviços do Mês**"
   - "Próximos 60 dias" → "**Mês atual**"

2. **Lógica de filtro:** trocar a query atual (próximos 60 dias / não pagos) por todos os serviços com `data_servico` no mês atual (mesmo critério `isSameMonth(parseLocalDate(s.data_servico), hoje)`).

3. **Separar em 3 grupos**, cada um com sub-cabeçalho colorido (igual ao padrão já adotado nos cards Despesas e Instalações):
   - **PAGAS** (verde) — `pago === true`
   - **PENDENTES** (laranja) — `pago === false` e `data_servico >= hoje`
   - **NÃO PAGAS / VENCIDAS** (vermelho) — `pago === false` e `data_servico < hoje`

4. **Estilo dos itens** (seguindo padrão dos outros cards):
   - Pagas: borda/fundo verde, valor verde, ícone `CheckCircle`
   - Pendentes: borda/fundo laranja, valor laranja, ícone `Clock`
   - Não pagas/vencidas: borda/fundo vermelho, valor vermelho, ícone `AlertCircle`

5. **Cada item exibe:** nome do cliente, nome do serviço, valor (R$), data formatada (dd/MM/yyyy via `parseLocalDate`).

6. **Estado vazio:** se os 3 grupos estiverem vazios → manter mensagem "Nenhum serviço neste mês".

7. **Badge de contagem** no header do card: total de serviços do mês (não só pendentes).

8. **Scroll:** manter `max-h-72 overflow-y-auto`.

### Sem alterações em
- Tabela `servicos` ou queries do Supabase
- Outros cards (Despesas Próximas, Instalações, Receita, etc.)
- Página `/servicos`

