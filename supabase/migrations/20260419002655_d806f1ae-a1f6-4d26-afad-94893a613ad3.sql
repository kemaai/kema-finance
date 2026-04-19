
-- ============================================
-- 1. Storage bucket "avatars" — policies owner-scoped
-- ============================================

-- Drop existing broad policies if they exist
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Avatars are viewable by owner" ON storage.objects;

-- SELECT: público (necessário para <img src> em bucket público), mas via URL direta apenas
CREATE POLICY "Avatar files are publicly readable"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

-- INSERT: apenas o próprio usuário no seu folder {user_id}/...
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- UPDATE: apenas o próprio usuário
CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- DELETE: apenas o próprio usuário
CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- 2. CPF/CNPJ masking — função + view
-- ============================================

-- Função imutável que mascara CPF/CNPJ deixando apenas os 4 últimos dígitos
CREATE OR REPLACE FUNCTION public.mask_cpf_cnpj(doc text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN doc IS NULL OR length(doc) <= 4 THEN doc
    ELSE repeat('•', length(doc) - 4) || right(doc, 4)
  END;
$$;

-- View segura que expõe CPF/CNPJ mascarado
-- security_invoker=true garante que RLS da tabela clientes seja aplicada
CREATE OR REPLACE VIEW public.clientes_safe
WITH (security_invoker = true)
AS
SELECT
  id,
  user_id,
  nome,
  public.mask_cpf_cnpj(cpf_cnpj) AS cpf_cnpj,
  email,
  telefone,
  endereco,
  cidade,
  estado,
  cep,
  observacoes,
  created_at,
  updated_at
FROM public.clientes;

-- Garantir acesso à view para usuários autenticados
GRANT SELECT ON public.clientes_safe TO authenticated;
