

## Transformar Menu "Sites" em Menu "Serviços"

Renomear e generalizar o módulo Sites para suportar qualquer tipo de serviço prestado (sites, sistemas, papel de parede, pintura, etc), mantendo o vínculo com clientes.

### Mudanças no Banco de Dados

Criar nova tabela `servicos` (mantendo `sites` intacta por enquanto para evitar perda de dados):

```sql
CREATE TABLE public.servicos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  cliente_id uuid NOT NULL,
  cliente_nome text NOT NULL,
  nome_servico text NOT NULL,
  valor numeric NOT NULL DEFAULT 0,
  data_servico date NOT NULL,
  descricao text NOT NULL,
  status text NOT NULL DEFAULT 'Pendente', -- Pendente | Pago
  pago boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS idêntica ao padrão das outras tabelas (4 policies por user_id)
-- Trigger update_updated_at_column
```

**Observação:** Vou manter a tabela `sites` no banco (não dropar) para preservar dados existentes. Caso queira migrá-los depois, faremos em etapa separada.

### Mudanças no Frontend

**Renomear/criar arquivos:**
- `src/pages/Sites.tsx` → `src/pages/Servicos.tsx` (refatorado)
- `src/components/SiteForm.tsx` → `src/components/ServicoForm.tsx`
- `src/components/SiteCard.tsx` → `src/components/ServicoCard.tsx`

**Novo formulário (`ServicoForm`)** — campos:
- Cliente (select dos clientes cadastrados) — obrigatório
- Nome do serviço (texto livre, ex: "Criação de site", "Pintura sala") — obrigatório
- Valor cobrado (R$) — obrigatório
- Data do serviço — obrigatório
- Descrição (textarea, obrigatório conforme pedido)
- Status: Pendente / Pago (toggle)

**Novo card (`ServicoCard`)** — exibe nome do serviço, cliente, valor, data, status, descrição truncada; ações editar/excluir.

**Página `Servicos`:**
- Título: "Serviços" / subtítulo: "Gerencie os serviços prestados"
- Métrica topo: "Total faturado no mês: R$ X" (soma dos serviços do mês selecionado)
- Filtro de mês reutilizando lógica existente (`useSiteMonthFilter` adaptado → `useServicoMonthFilter` baseado em `data_servico`)
- Busca por nome do serviço, cliente ou descrição
- Grid de cards

**Navegação (`AppSidebar.tsx` + `MobileNavigation.tsx`):**
- Item "Sites" (ícone Globe) → "Serviços" (ícone `Wrench` ou `Briefcase`)
- Rota `/sites` → `/servicos`

**Roteamento (`App.tsx`):**
- Substituir `<Route path="/sites" element={<Sites/>} />` por `<Route path="/servicos" element={<Servicos/>} />`
- Manter redirect `/sites` → `/servicos` para não quebrar links salvos

**Dashboard (`src/pages/Dashboard.tsx`):**
- Card "Sites Ativos" → "Serviços do Mês" (conta serviços do mês atual)
- Cálculo de receita mensal: substituir lógica baseada em `sites` (assinatura/hospedagem) por soma de `servicos.valor` do mês atual onde `pago = true` (faturado) + opcional pendente
- Receita recorrente de sites será removida (não faz mais sentido conceitualmente — todo serviço agora é pontual)

**Hooks:**
- Criar `useServicoMonthFilter` (cópia adaptada de `useSiteMonthFilter` usando `data_servico`)
- `useSupabaseData` / `useKemaFinanceAI` / `RelatorioFilter`: substituir queries de `sites` por `servicos` onde a receita é calculada

### Arquivos Afetados
- **Migration nova:** criar tabela `servicos` + RLS + trigger
- **Criados:** `src/pages/Servicos.tsx`, `src/components/ServicoForm.tsx`, `src/components/ServicoCard.tsx`, `src/hooks/useServicoMonthFilter.tsx`
- **Editados:** `src/App.tsx`, `src/components/AppSidebar.tsx`, `src/components/MobileNavigation.tsx`, `src/pages/Dashboard.tsx`, `src/hooks/useKemaFinanceAI.tsx`, `src/pages/Relatorios.tsx` (se usar sites), `src/components/QuickActions.tsx` (se referenciar sites)
- **Mantidos (não deletados):** `src/pages/Sites.tsx`, `SiteForm.tsx`, `SiteCard.tsx`, tabela `sites` — para não perder histórico. Podemos remover em iteração futura.

### Ponto de atenção
O Dashboard hoje calcula "receita mensal recorrente" baseado em assinaturas de sites. Como serviços agora são pontuais, a métrica mudará para "Receita de serviços do mês" (soma de valores com `data_servico` no mês). Confirmaria isso após implementar — se quiser manter recorrência para alguns serviços, podemos adicionar campo `recorrente` posteriormente.

