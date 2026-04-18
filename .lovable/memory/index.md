# Memory: index.md
Updated: now

# Project Memory

## Core
Premium dark theme: Deep Navy bg (#080B1A), Indigo surfaces (#111631), Orange accents (#F97316). Minimal, no logo images.
Calculate M² constantly as `valor_total / 24`. Always use this specific ratio.
Use `parseLocalDate` in src/lib/utils.ts for 'YYYY-MM-DD' dates to prevent timezone day-shifting errors.
Dashboard revenue/sites must only include 'Ativo' status with due date in the current month.
All client-side write/delete operations MUST explicitly include `.eq('user_id', user.id)`.
Cast financial values to Numbers before performing summations for dashboard totals.
Sidebar footer shows real user (avatar_url + full_name + email) from profile, clickable to /perfil.
Disable console logging in production environments to prevent sensitive data exposure.
PII masking required: CPF/CNPJ must be truncated in UI to show only the last 4 digits.

## Memories
- [Row Level Security](mem://database/row-level-security) — Complex ownership rules and defense-in-depth with explicit client-side .eq('user_id', user.id)
- [Dashboard Sidebar Cleanup](mem://ui/dashboard-sidebar-cleanup) — "Configuração" and "Novo" buttons moved to Ações Rápidas in sidebar
- [PWA Configuration](mem://features/pwa-configuration) — Network First strategy, maskable icons, 60min update check
- [Console Logging Disabled](mem://security/console-logging-disabled) — Environment-based suppression to prevent sensitive data exposure
- [Pedido Recebido Tracking](mem://features/pedido-recebido-tracking) — Green highlighting for orders marked as paid/received
- [User Profile Architecture](mem://auth/user-profile-system-architecture) — PostgreSQL trigger extracts/splits first name from auth metadata
- [Installation Logic Constants](mem://features/instalacao-logic-constants) — Total M² derived from financial value: valor_total / 24
- [Local Date Consistency](mem://data/local-date-consistency-strategy) — parseLocalDate utility usage to prevent timezone day-shifting errors
- [Dashboard Mobile UX](mem://features/dashboard-mobile-ux-cleanup) — Mobile title rendering optimization
- [Dashboard Active Sites](mem://features/active-sites-filtering-logic) — Revenue metrics include only 'Ativo' sites due within current month
- [KemaFinance AI Agent](mem://features/kemafinance-ai-agent-architecture) — Gemini AI analysis, non-judgmental, prioritizes emergency reserves
- [Chart Visualization Theme](mem://style/chart-visualization-theme) — Indigo grid lines, Orange/Amber metrics on Navy background
- [Reporting Engine V2](mem://features/reporting-engine-logic-v2) — Synchronized engine logic, loan balance metrics, TXT exports
- [Dividas Management V2](mem://features/dividas-management-logic-v2) — Dynamic recalculation of loan current balance from payment history
- [Dashboard Desktop Layout](mem://ui/dashboard-desktop-layout-optimization) — Responsive classes preventing text truncation on desktop
- [Dashboard Period Filtering](mem://features/dashboard/period-filtering) — Period filters and explicit Number casting for financial totals
- [AI Agent Hardening](mem://security/ai-agent-hardening) — JWT validation, 50 msg/4000 char limits, generic edge function errors
- [PII Masking](mem://security/pii-masking) — UI-level masking for CPF/CNPJ (shows only last 4 digits)
- [KemaFinance Goals System](mem://features/kemafinance/goals-system) — 50-30-20 rule tracking, manual updates triggering recalculations
- [Premium Design System](mem://style/premium-design-system) — Deep Navy (#080B1A), Indigo surfaces, Orange accents, minimal aesthetic
