## Objetivo

Tornar a tela de login e a navegação totalmente compatíveis com automação por browser tools / Playwright, sem alterar regras de negócio, autenticação, banco ou integrações. Apenas ajustes não-destrutivos de acessibilidade/seletores.

---

## Mudanças

### 1. `src/components/AuthForm.tsx` — Seletores estáveis no login

No formulário de **Sign In** (já é `<form>` nativo com `onSubmit` — submit por Enter já funciona):

- Adicionar ao `<form>`:
  - `id="login-form"`, `data-testid="login-form"`, `name="login"`, `aria-label="Login"`, `noValidate={false}`, `autoComplete="on"`
- No campo de email (`Input` que renderiza `<input>` HTML real):
  - Manter `id="email"` e adicionar:
    - `data-testid="login-email"` 
    - `autoComplete="email"`
    - `inputMode="email"`
    - `aria-label="Email"`
  - Adicionar **também** um wrapper invisível? Não — basta adicionar um segundo seletor. Como o requisito pede `id="login-email"` e o id atual `email` é usado pelo `<Label htmlFor>`, vamos:
    - Trocar `id="email"` por `id="login-email"` e atualizar `<Label htmlFor="login-email">`.
- No campo de senha:
  - Trocar `id="password"` por `id="login-password"` e atualizar `<Label htmlFor="login-password">`.
  - Adicionar `data-testid="login-password"`, `autoComplete="current-password"`, `aria-label="Senha"`.
- No botão "Entrar na conta" (já é `<button type="submit">` via componente `Button`):
  - Adicionar `id="login-submit"`, `data-testid="login-submit"`, `aria-label="Entrar"`.
- Botão "Esqueci minha senha": adicionar `data-testid="login-forgot"`.
- Botão Google: adicionar `data-testid="login-google"`.
- Tabs Entrar/Cadastrar: adicionar `data-testid="tab-signin"` / `data-testid="tab-signup"` para automação poder garantir que está na aba certa.

Os componentes `Input` e `Button` do shadcn já são wrappers finos que renderizam `<input>` e `<button>` nativos — **não há componentes não-HTML**, então o requisito 4 já é atendido.

### 2. `src/components/PWAInstallPrompt.tsx` — Banner não intrusivo / desativável

Adicionar três mecanismos de bypass (não-destrutivos):

1. **Auto-skip em automação**: no início do `useEffect`, detectar e não exibir o prompt quando:
   - `navigator.webdriver === true` (Playwright/Selenium), **ou**
   - `window.matchMedia('(hover: none)')` falso + UA contém `HeadlessChrome`, **ou**
   - URL contém `?automation=1` ou `?noPwa=1`, **ou**
   - `localStorage.getItem('pwa-prompt-disabled') === '1'`.
   - Em qualquer desses casos: `setShowPrompt(false)` e early-return (não registrar listeners de prompt).
2. **Persistência do desativar**: quando usuário fecha (X), além de `pwa-prompt-dismissed`, também aceitar via querystring `?noPwa=1` para sessões automatizadas.
3. **Seletores estáveis** no card: `data-testid="pwa-install-card"`, botão fechar `data-testid="pwa-install-close"`, botão instalar `data-testid="pwa-install-accept"`. Isso permite ao agente fechar o banner caso apareça.

Nada do fluxo PWA real é removido — usuários normais continuam vendo o prompt como hoje.

### 3. `src/pages/ResetPassword.tsx` (verificar e adicionar testids)

Adicionar `id`/`data-testid` nos campos de nova senha (`reset-password-new`, `reset-password-confirm`, `reset-password-submit`) para o agente também poder operar fluxo de recovery, se necessário.

### 4. Navegação — seletores estáveis nos itens da sidebar

Em `src/components/AppSidebar.tsx` e `src/components/MobileNavigation.tsx`:
- Adicionar `data-testid={`nav-${slug}`}` em cada link de menu (ex.: `nav-dashboard`, `nav-despesas`, `nav-clientes`, `nav-servicos`, `nav-instalacoes`, `nav-dividas`, `nav-relatorios`, `nav-agente`, `nav-perfil`).
- Garante que o agente possa navegar de forma robusta após login.

### 5. Acesso operacional seguro (requisito 6)

**Não** criar rota especial bypass-auth (seria risco de segurança). Em vez disso:
- Documentar (via comentário no topo de `AuthForm.tsx`) o contrato de seletores acima.
- Adicionar suporte ao querystring `?automation=1` que apenas **desativa o PWA prompt** e força `localStorage` `pwa-prompt-disabled=1` — o agente continua usando login normal com email/senha de uma conta dedicada criada manualmente pelo usuário (recomendado).

Não há criação de usuário, role, nem alteração de RLS — autenticação permanece intacta.

### 6. Itens já OK (apenas confirmar, sem mudança)

- Submit por Enter: `<form onSubmit={handleSignIn}>` já permite (requisito 5 ✅).
- `<input>` e `<button>` nativos: shadcn `Input`/`Button` renderizam tags nativas (requisito 4 ✅).
- Compatibilidade headless Chrome/Playwright: nenhum bloqueio existente além do PWA prompt, que será resolvido no item 2 (requisito 8 ✅).

---

## Arquivos afetados

- `src/components/AuthForm.tsx` — ids + data-testids no form de login (e reset)
- `src/components/PWAInstallPrompt.tsx` — bypass para webdriver/headless/querystring/localStorage + testids
- `src/pages/ResetPassword.tsx` — testids
- `src/components/AppSidebar.tsx` — `data-testid` nos itens de menu
- `src/components/MobileNavigation.tsx` — `data-testid` nos itens de menu

## Não alterado

- `useAuth`, Supabase client, RLS, edge functions, regras de negócio, fluxo visual, design tokens, rotas existentes.

## Contrato de seletores final (para o agente)

```text
Login form:        [data-testid="login-form"]
Email input:       #login-email  |  [data-testid="login-email"]
Password input:    #login-password  |  [data-testid="login-password"]
Submit button:     #login-submit  |  [data-testid="login-submit"]
Forgot link:       [data-testid="login-forgot"]
Google button:     [data-testid="login-google"]
PWA prompt close:  [data-testid="pwa-install-close"]
Bypass PWA:        ?automation=1  ou  localStorage.pwa-prompt-disabled = "1"
Nav items:         [data-testid="nav-<slug>"]  (dashboard, despesas, clientes, ...)
```