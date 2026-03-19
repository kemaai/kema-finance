

## Análise de Segurança RLS - Resultados e Plano de Correção

### Situação Atual das Políticas RLS

Todas as 8 tabelas possuem RLS habilitado com políticas `auth.uid() = user_id` para SELECT, INSERT, UPDATE, DELETE. A tabela `pagamentos_emprestimo` usa subquery contra `emprestimos` para validar ownership. Isso está correto no lado do banco.

### Vulnerabilidades Encontradas no Código (Defense-in-Depth)

Embora o RLS proteja no servidor, o código cliente tem inconsistências que criam risco se o RLS falhar ou for desabilitado:

#### 1. WARN: Updates/Deletes sem filtro `user_id` no código

Várias operações de UPDATE e DELETE filtram apenas por `id` do registro, sem adicionar `.eq('user_id', user.id)` como camada extra de defesa:

| Arquivo | Operação | Tabela | Filtro |
|---------|----------|--------|--------|
| `DividaNegativadaCard.tsx` | update | dividas_negativadas | `.eq('id', ...)` apenas |
| `DividaNegativadaCard.tsx` | delete | dividas_negativadas | `.eq('id', ...)` apenas |
| `EmprestimoCard.tsx` | update emprestimos | emprestimos | `.eq('id', ...)` apenas |
| `EmprestimoCard.tsx` | delete emprestimos | emprestimos | `.eq('id', ...)` apenas |
| `EmprestimoCard.tsx` | delete pagamento | pagamentos_emprestimo | `.eq('id', ...)` apenas |
| `EmprestimoCard.tsx` | update pagamento | pagamentos_emprestimo | `.eq('id', ...)` apenas |
| `EmprestimoEditForm.tsx` | update | emprestimos | `.eq('id', ...)` apenas |
| `Sites.tsx` | update | sites | `.eq('id', ...)` apenas |
| `Sites.tsx` | delete | sites | `.eq('id', ...)` apenas |
| `Despesas.tsx` | update | despesas | `.eq('id', ...)` apenas |
| `Despesas.tsx` | delete | despesas | `.eq('id', ...)` apenas |
| `Despesas.tsx` | update paga | despesas | `.eq('id', ...)` apenas |
| `useMetasFinanceiras.tsx` | update | metas_financeiras | `.eq('id', ...)` apenas |
| `useMetasFinanceiras.tsx` | delete | metas_financeiras | `.eq('id', ...)` apenas |

Note: `Clientes.tsx` e `Instalacoes.tsx` **já fazem corretamente** com `.eq('user_id', user.id)`.

#### 2. INFO: Tabela `pagamentos_emprestimo` não tem `user_id`

A tabela `pagamentos_emprestimo` depende de subquery para validar ownership. Isso é funcionalmente correto mas mais lento. Sem alteração necessária, apenas observação.

### Plano de Correção

Adicionar `.eq('user_id', user.id)` (ou verificação equivalente via parent para `pagamentos_emprestimo`) em todas as operações de UPDATE e DELETE que não possuem essa defesa em profundidade. Isso afeta 6 arquivos:

1. **`src/components/DividaNegativadaCard.tsx`** - Adicionar `user_id` filter no update e delete
2. **`src/components/EmprestimoCard.tsx`** - Adicionar `user_id` filter nos updates/deletes de emprestimos; para pagamentos, validar ownership do emprestimo antes de operar
3. **`src/components/EmprestimoEditForm.tsx`** - Adicionar `user_id` filter no update
4. **`src/pages/Sites.tsx`** - Adicionar `user_id` filter no update e delete
5. **`src/pages/Despesas.tsx`** - Adicionar `user_id` filter no update, delete e toggle
6. **`src/hooks/useMetasFinanceiras.tsx`** - Adicionar `user_id` filter no update e delete

### Nota Técnica

O RLS no Supabase é a camada primária de segurança e já funciona. Estas correções no código são **defesa em profundidade** - uma prática recomendada para que, caso o RLS seja acidentalmente desabilitado ou modificado, o código continue protegendo os dados.

