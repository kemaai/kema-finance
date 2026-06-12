# Auditoria do KemaFinance — Bugs, Segurança e Melhorias

## 1. Estado atual (resultado da varredura)

**Segurança automatizada — TUDO LIMPO no código:**
- `agent_security`: 0 findings
- `connector_security_scan` (Wiz): 0 findings
- `supabase` / `supabase_lov`: 0 findings
- `npm audit`: 0 vulnerabilidades altas/críticas

**3 alertas do Supabase Linter — requerem ação manual no dashboard (não há como corrigir por código):**
1. OTP com expiração acima do recomendado
2. Proteção contra senhas vazadas desabilitada
3. Versão do Postgres com patches de segurança disponíveis

**Boas práticas já implementadas (confirmadas):**
- RLS em todas as tabelas com `.eq('user_id', user.id)` defensivo no client
- Mascaramento de CPF/CNPJ na UI
- `console.*` desabilitado em produção
- Validação de uploads (MIME + tamanho) em `useInstalacaoAnexos`
- Edge function `kema-finance-ai` com JWT, limite de mensagens e sanitização
- PWA com Service Worker, manifest e prompt de instalação
- SEO básico (sitemap, JSON-LD, OG/Twitter, canonical)

## 2. Correções propostas (Bugs e pequenas falhas)

### B1. `verify_jwt = false` em `kema-finance-ai`
`supabase/config.toml` declara `verify_jwt = false`, mas a função já valida o JWT internamente via `supabase.auth.getClaims`. Está seguro, mas inconsistente — vou ligar `verify_jwt = true` para defesa em profundidade (o gateway rejeita requests não autenticadas antes mesmo de chegarem na função).

### B2. 35 chamadas `console.*` espalhadas
Já são silenciadas em produção via `main.tsx`, mas algumas estão em handlers de erro úteis. Vou padronizar:
- manter `console.error` somente onde realmente ajuda debug
- remover `console.log` de fluxos normais (Servicos, Sites, Perfil, AnexosUpload, etc.)

### B3. Rota órfã `/sites`
`Sites.tsx` ainda existe no projeto, mas a rota `/sites` está como `<Navigate to="/servicos">`. Vou remover o arquivo `src/pages/Sites.tsx` (código morto).

### B4. Cleanup de listener no `useAuth`
Funciona, mas o `getUser()` inicial roda em paralelo com `onAuthStateChange`, podendo gerar 2 fetches do profile na inicialização. Vou usar apenas `onAuthStateChange` + `getSession` síncrono inicial.

### B5. Validação Zod em formulários sensíveis
Atualmente `ClienteForm`, `InstalacaoForm`, `DespesaForm` validam campo a campo. Vou centralizar em `src/lib/validations.ts` (já existe) usando schemas Zod com limites de tamanho — protege contra payloads abusivos antes de bater no Supabase.

### B6. Anexos de instalação — link de compartilhamento
O `AnexosUpload` gera signed URL com expiração curta. Vou conferir a expiração e adicionar opção de gerar link com TTL configurável (15min / 1h / 24h) para compartilhamento seguro.

## 3. Melhorias recomendadas (opcional — confirmar quais aplicar)

### M1. Per-route SEO com `react-helmet-async`
Mesmo com tudo autenticado, ajuda em compartilhamentos internos.

### M2. Lazy-loading das páginas (React.lazy + Suspense)
Bundle inicial cai significativamente; melhora LCP e PWA.

### M3. Error Boundary global
Hoje um erro de render quebra a tela inteira. Adicionar `<ErrorBoundary>` com fallback amigável.

### M4. Skeleton loaders padronizados
Substituir spinners genéricos por skeletons nos cards do Dashboard / listagens.

### M5. Exportação CSV/PDF dos relatórios
A página `Relatorios` já tem TXT — adicionar CSV e PDF (jspdf) para envio a contador/cliente.

### M6. Backup automático (export periódico)
Botão "Exportar tudo" no Perfil → baixa um ZIP com JSON de todas as tabelas do usuário.

### M7. Notificações de vencimento (PWA push)
Service Worker + Notifications API para avisar despesas/instalações vencendo.

### M8. Confirmação 2FA opcional no login
Supabase Auth suporta TOTP — flag por usuário no perfil.

### M9. Auditoria/log de ações sensíveis
Tabela `audit_log` (user_id, action, entity, payload, created_at) preenchida via trigger nas operações de UPDATE/DELETE em emprestimos, dividas_negativadas, instalacoes.

### M10. Testes automatizados
Hoje há 0 testes. Sugiro Vitest + Testing Library cobrindo:
- cálculo de M² (`valor_total / 24`)
- filtros de quinzena
- score financeiro do agente IA

## 4. Itens que exigem ação sua no dashboard Supabase
- Ativar **Leaked Password Protection** em Auth → Providers
- Reduzir **OTP expiry** (recomendado ≤ 3600s)
- **Upgrade do Postgres** em Settings → Infrastructure

## 5. O que vou implementar ao aprovar este plano

Por padrão (correções essenciais — baixo risco):
**B1, B2, B3, B4, B5, B6**

Por padrão (melhorias de alto valor / baixo esforço):
**M2 (lazy loading), M3 (Error Boundary), M5 (export CSV/PDF nos relatórios)**

Os demais itens (M1, M4, M6, M7, M8, M9, M10) só executo se você marcar quais quer. Me diga quais incluir ou se prefere outra combinação.
