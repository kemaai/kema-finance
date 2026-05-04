## Objetivo

Permitir anexar arquivos (imagens, PDF, planilhas, documentos Word) a cada instalação, com possibilidade de visualizar e compartilhar os anexos.

## Visão geral

1. **Storage** — criar bucket privado `instalacao-anexos` no Supabase com RLS por usuário.
2. **Banco** — criar tabela `instalacao_anexos` para registrar metadados (nome, tipo, tamanho, path).
3. **Formulário (`InstalacaoForm.tsx`)** — adicionar área de upload (multi-arquivo, drag & drop) com validação de formato e tamanho. Lista anexos já existentes (em modo edição) com opção de remover.
4. **Card (`InstalacaoCard.tsx`)** — na seção expandida, listar anexos com ações: **Visualizar** (abre em nova aba via signed URL) e **Compartilhar** (Web Share API + fallback de copiar link).

## Detalhes técnicos

### Storage bucket
- `id: 'instalacao-anexos'`, **privado** (não público — documentos podem ter dados sensíveis).
- Acesso via **signed URLs** (expiração curta para visualizar; mais longa para compartilhar — ex. 7 dias).
- Estrutura de pastas: `{user_id}/{instalacao_id}/{uuid}-{nome_arquivo}`.

### RLS no storage.objects
Políticas restringindo SELECT/INSERT/UPDATE/DELETE ao próprio usuário, validando que o primeiro segmento do path é igual ao `auth.uid()`.

### Tabela `instalacao_anexos`
```text
id              uuid PK
instalacao_id   uuid (referencia logicamente instalacoes.id)
user_id         uuid
file_name       text          -- nome original
file_path       text          -- caminho no bucket
mime_type       text
file_size       bigint
created_at      timestamptz default now()
```
RLS padrão: usuário só vê/edita os próprios (`auth.uid() = user_id`), seguindo o padrão do projeto (memória `Row Level Security`).

### Formatos aceitos
- Imagens: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- PDF: `application/pdf`
- Planilhas: `.xlsx`, `.xls`, `.csv`
- Documentos: `.doc`, `.docx`
- Limite: 10 MB por arquivo (validação no client + via política).

### Mudanças no formulário
- Componente `<AnexosUpload>` com input `<input type="file" multiple accept="...">`.
- Em modo "novo": acumula arquivos em estado local; faz upload **após** criar a instalação (precisa do `instalacao.id`).
- Em modo "edição": faz upload imediato vinculando ao `instalacao_id` existente.
- Mostra progresso e thumbnails (imagens) / ícone por tipo (PDF, planilha, doc).

### Visualização e compartilhamento (no card expandido)
- Botão **Visualizar**: gera signed URL (60s) e `window.open` em nova aba. Imagens e PDF abrem inline; planilhas/doc fazem download.
- Botão **Compartilhar**: gera signed URL (7 dias) e:
  - Se `navigator.share` disponível (mobile) → abre share sheet nativo com link.
  - Senão → copia o link para a área de transferência com toast de confirmação.
- Botão **Remover** (ícone lixeira) com confirmação.

### Hook auxiliar
Criar `useInstalacaoAnexos(instalacaoId)` para listar/uploadar/remover anexos via React Query, mantendo padrão do projeto.

## Arquivos afetados
- **Nova migração**: tabela `instalacao_anexos`, bucket `instalacao-anexos`, políticas RLS.
- **Novo**: `src/components/AnexosUpload.tsx` (input + lista de anexos com ações).
- **Novo**: `src/hooks/useInstalacaoAnexos.tsx`.
- **Editar**: `src/components/InstalacaoForm.tsx` — incluir `<AnexosUpload>` e disparar upload pendente após criação.
- **Editar**: `src/components/InstalacaoCard.tsx` — exibir anexos na seção expandida com Visualizar/Compartilhar/Remover.
- **Editar**: `src/pages/Instalacoes.tsx` — após `createInstalacaoMutation.onSuccess`, repassar o novo `id` ao form para concluir uploads pendentes.

## Considerações de segurança
- Bucket privado + signed URLs (nunca expor URLs públicas).
- Validação de MIME type e tamanho no client antes do upload.
- RLS garante isolamento por usuário tanto na tabela quanto no storage.
- Toast genérico em erros (sem vazar detalhes), conforme padrão do projeto.
