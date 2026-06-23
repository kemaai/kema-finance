# 📊 KemaFinance — Gestão Financeira Pessoal Inteligente

**Stack:** React 18 · TypeScript · Vite · Supabase · shadcn/ui · Tailwind CSS · TanStack Query · Recharts · Gemini AI

---

## 🎯 Sobre

Sistema completo de gestão financeira pessoal com inteligência artificial integrada. Desenvolvido em **Lovable** (Vibe Coding) com arquitetura profissional — 19.323 linhas, 14 páginas, 11 tabelas no banco, PWA instalável.

> ⚡ **Em produção** — usado diariamente para gerenciar finanças pessoais, clientes, serviços e instalações.

## 📋 Funcionalidades

| Módulo | Descrição |
|---|---|
| **📈 Dashboard** | Visão geral com receitas, despesas, saldo, score financeiro, filtro quinzenal/semanal/mensal |
| **👥 Clientes** | Cadastro completo com mascaramento de CPF/CNPJ (PII) |
| **✂️ Serviços** | Controle de serviços prestados com status de pagamento |
| **🔧 Instalações** | Cálculo automático de M² (valor/24), upload de anexos, status |
| **💸 Despesas** | Controle de despesas mensais com status de pagamento |
| **🏦 Empréstimos** | Gestão com saldo devedor dinâmico e histórico de parcelas |
| **⚠️ Dívidas** | Controle de dívidas negativadas com valor atualizado |
| **📋 Relatórios** | Semanais/mensais/anuais com exportação CSV e PDF |
| **🎯 Metas** | Regra 50-30-20 + meta de reserva de emergência (6 meses) |
| **🤖 Agente IA** | Consultor financeiro com Gemini — score, diagnóstico, alertas e chat |

## 🧠 KemaFinance AI

Edge Function no Supabase conectada ao Gemini que analisa dados reais e oferece:
- **Score Financeiro** (0-100) com classificação 🔴🟡🟢
- **Alertas inteligentes** de despesas, dívidas e saldo
- **Consultoria personalizada** via chat com dados do usuário

## 🔐 Segurança

- RLS em todas as 11 tabelas + defense in depth no cliente
- PII masking (CPF/CNPJ truncados)
- Validação de upload (MIME + tamanho)
- JWT validation + rate limiting na Edge Function
- Console logging desabilitado em produção
- Sanitização com Zod

## 🛠️ Stack

```
Frontend:  React 18, TypeScript, Vite, Tailwind, shadcn/ui
State:     TanStack React Query
Forms:     React Hook Form + Zod
Charts:    Recharts
PWA:       Service Worker + Manifest + Offline
Backend:   Supabase (Auth, DB, Storage, Edge Functions)
AI:        Gemini
```

## 🚀 Desenvolvimento

```sh
git clone https://github.com/kemaai/kema-finance.git
cd kema-finance
npm i
npm run dev
```

---

<p align="center">
  <i>Sistema real, em produção, construído com Vibe Coding + Lovable 💎</i>
</p>
