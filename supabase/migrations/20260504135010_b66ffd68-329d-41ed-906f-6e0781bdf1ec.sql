-- Tabela de anexos de instalação
CREATE TABLE public.instalacao_anexos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instalacao_id UUID NOT NULL,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_instalacao_anexos_instalacao_id ON public.instalacao_anexos(instalacao_id);
CREATE INDEX idx_instalacao_anexos_user_id ON public.instalacao_anexos(user_id);

ALTER TABLE public.instalacao_anexos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own instalacao_anexos"
ON public.instalacao_anexos FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own instalacao_anexos"
ON public.instalacao_anexos FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own instalacao_anexos"
ON public.instalacao_anexos FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own instalacao_anexos"
ON public.instalacao_anexos FOR DELETE
USING (auth.uid() = user_id);

-- Bucket privado para os arquivos
INSERT INTO storage.buckets (id, name, public)
VALUES ('instalacao-anexos', 'instalacao-anexos', false);

-- Políticas no storage.objects (path estruturado: {user_id}/{instalacao_id}/{file})
CREATE POLICY "Users can view their own instalacao files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'instalacao-anexos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own instalacao files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'instalacao-anexos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own instalacao files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'instalacao-anexos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own instalacao files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'instalacao-anexos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);