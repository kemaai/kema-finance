# KemaFinance

Sistema de gestao financeira pessoal com dashboard inteligente, categorizacao automatizada de gastos, metas financeiras 50-30-20 e consultoria via inteligencia artificial (Gemini). 19.323 linhas de codigo em producao.

## Funcionalidades

- **Dashboard** com score financeiro 0-100 baseado em receitas, despesas, dividas e investimentos
- **Transacoes** com categorizacao inteligente via regras personalizadas
- **Metas 50-30-20** com calculo automatico sobre a receita liquida e acompanhamento mensal
- **Relatorios** exportaveis em CSV e PDF com filtros por periodo, categoria e tipo
- **Consultoria financeira** via Gemini AI (Edge Function com autenticacao JWT)
- **Orcamentos** mensais com alertas de estouro de categoria
- **Controle de dividas e emprestimos** com acompanhamento de parcelas
- **Instalacoes** (servicos contratados) com gerenciamento de anexos
- **Perfil do usuario** com configuracao de metas e preferencias
- **PWA** com suporte offline parcial

## Paginas

Dashboard, Transacoes, Metas, Relatorios, Orcamentos, Dividas, Servicos, Configuracoes, Perfil, Agente IA, Login

## Estrutura de Dados

11 tabelas no Supabase (profiles, clientes, sites, instalacoes, despesas, emprestimos, pagamentos_emprestimo, dividas_negativadas, metas_financeiras, servicos, instalacao_anexos) com RLS por usuario.

## Stack

React, TypeScript, Supabase (Auth, DB, Storage, Edge Functions, RLS), Gemini AI, shadcn/ui, Vite, PWA

## Seguranca

- RLS habilitado em todas as 11 tabelas com politicas por usuario (auth.uid())
- Edge Function kema-finance-ai com verify_jwt
- Autenticacao via Supabase Auth (email + senha)
- .env removido do historico git

## Sobre o Desenvolvimento

Projeto concebido, especificado e orquestrado via ferramentas de IA (Lovable + Gemini). Pesquisa de mercado, PRD, prototipacao de mockups, revisao manual de cada funcionalidade e configuracao de infraestrutura realizadas pelo autor.
