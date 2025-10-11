-- Criar profiles para usuários existentes que não têm profile
INSERT INTO public.profiles (id, full_name, first_name)
SELECT 
  u.id,
  u.raw_user_meta_data->>'full_name' as full_name,
  SPLIT_PART(u.raw_user_meta_data->>'full_name', ' ', 1) as first_name
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
  AND u.raw_user_meta_data->>'full_name' IS NOT NULL;