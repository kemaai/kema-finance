

## Menu Perfil/Configurações — Implementação

### Objetivo
Substituir o `ProfileCard` atual (que tem apenas tema escuro e logout não funcional) por um sistema completo de perfil com página dedicada `/perfil` para gerenciar nome, foto, senha e email.

### Mudanças no Banco de Dados

**Migration 1 — adicionar coluna avatar_url em `profiles`:**
```sql
ALTER TABLE public.profiles ADD COLUMN avatar_url text;
```

**Migration 2 — criar storage bucket público para avatares:**
```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Policies: usuário só lê/escreve sua própria pasta {user_id}/...
CREATE POLICY "Avatares públicos para leitura" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Usuário faz upload do próprio avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuário atualiza próprio avatar" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuário deleta próprio avatar" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### Nova Página: `src/pages/Perfil.tsx`

Layout com 3 seções (cards):

**1. Informações Pessoais**
- Avatar grande (96px) com botão "Alterar foto" → upload para `avatars/{user.id}/avatar.{ext}` → salva URL pública em `profiles.avatar_url`
- Campo Nome completo (editável) → atualiza `profiles.full_name` e `first_name` (split do primeiro nome)
- Botão "Salvar alterações"

**2. Email**
- Mostra email atual de `user.email`
- Badge "Verificado" (verde) se `user.email_confirmed_at` existir, senão "Não verificado" (laranja) com botão "Reenviar verificação" → `supabase.auth.resend({ type: 'signup', email })`
- Campo "Novo email" + botão "Alterar email" → `supabase.auth.updateUser({ email })` (envia link de confirmação)

**3. Segurança / Senha**
- Campos: Nova senha + Confirmar nova senha (com validação Zod: mín. 8 chars, maiúscula, número)
- Botão "Alterar senha" → `supabase.auth.updateUser({ password })`
- Toast de sucesso/erro

### Atualização do `useAuth.tsx`
- Adicionar `avatar_url` ao tipo `UserProfile` e ao select da query `profiles`
- Adicionar função `refreshProfile()` exposta no contexto para recarregar após edição

### Atualização do `ProfileCard.tsx` (popover do header)
- Mostrar avatar (`profile.avatar_url`) no botão do trigger e no header do popover
- Mostrar nome real (`profile.full_name`) e email (`user.email`) no header do popover
- **Adicionar** item "Meu Perfil" → navega para `/perfil`
- Manter switch tema escuro
- Substituir `handleLogout` mockado por `signOut()` real do `useAuth`

### Rota
- `src/App.tsx`: adicionar `<Route path="/perfil" element={<ProtectedRoute><Layout><Perfil /></Layout></ProtectedRoute>} />`

### Validação
Schema Zod em `src/lib/validations.ts`:
- `profileSchema`: full_name (1-100 chars, trim)
- `passwordSchema`: 8-72 chars, ao menos 1 maiúscula e 1 número, confirmação igual
- `emailSchema`: email válido, max 255

### Arquivos
- **Criar**: `src/pages/Perfil.tsx`, 2 migrations
- **Editar**: `src/hooks/useAuth.tsx`, `src/components/ProfileCard.tsx`, `src/App.tsx`, `src/lib/validations.ts`

### Notas
- Avatar usa `Avatar`/`AvatarImage`/`AvatarFallback` (shadcn já existe) com fallback nas iniciais do nome
- Upload faz `upsert: true` com path `{user.id}/avatar-{timestamp}.{ext}` para evitar cache stale
- Nenhum `onAuthStateChange` adicional — o `updateUser` já atualiza a sessão automaticamente

