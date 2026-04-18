

## Mobile bottom nav: adicionar Perfil + limitar visualização a 5 itens

### Objetivo
Na barra inferior mobile (`MobileNavigation.tsx`):
1. Adicionar item **Perfil** ao final da lista
2. Mostrar apenas **5 itens visíveis por vez**, com os demais acessíveis via **scroll horizontal**

### Análise atual
`src/components/MobileNavigation.tsx` já tem 8 itens e usa `overflow-x-auto` com `min-w-[64px]` por item. No viewport de 390px isso resulta em ~6 itens visíveis e o scroll já existe — porém o usuário vê 6 itens (Home, Clientes, Serviços, Instalações, Despesas, Dívidas) e os demais (Relatórios, KemaAI) ficam atrás. Falta também o **Perfil**.

Para garantir exatamente 5 itens visíveis em qualquer largura mobile, cada item precisa ocupar `width: calc(100% / 5)` (em vez de `min-w-[64px]`), e os itens excedentes ficam acessíveis via scroll horizontal.

### Mudanças

**Arquivo único: `src/components/MobileNavigation.tsx`**

1. Adicionar entrada no array `menuItems`:
   ```ts
   { name: 'Perfil', icon: User, path: '/perfil' }
   ```
   (importar `User` do `lucide-react`)

2. Substituir `min-w-[64px] px-2` no `<NavLink>` por largura fixa baseada em 1/5 do container:
   ```tsx
   className="flex flex-col items-center justify-center gap-1 flex-shrink-0 w-[20%] min-w-[20%] px-1 py-1.5"
   ```
   Isso faz cada item ocupar 20% da largura visível → exatamente 5 visíveis. Os 4 restantes (total 9) ficam acessíveis com swipe horizontal, aproveitando o `overflow-x-auto` já existente.

3. Manter `scrollbar-hide` e `overflow-x-auto` no container.

### Ordem final dos 9 itens
Home, Clientes, Serviços, Instalações, Despesas, Dívidas, Relatórios, KemaAI, Perfil
(primeiros 5 visíveis; demais via scroll)

### Não muda
- Sidebar desktop (já tem Perfil)
- Rotas, AuthProvider, página `/perfil`
- Layout/altura da barra (h-16)

