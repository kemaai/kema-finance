CREATE TABLE public.servicos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  cliente_id uuid NOT NULL,
  cliente_nome text NOT NULL,
  nome_servico text NOT NULL,
  valor numeric NOT NULL DEFAULT 0,
  data_servico date NOT NULL,
  descricao text NOT NULL,
  status text NOT NULL DEFAULT 'Pendente',
  pago boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own servicos"
  ON public.servicos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own servicos"
  ON public.servicos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own servicos"
  ON public.servicos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own servicos"
  ON public.servicos FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_servicos_updated_at
  BEFORE UPDATE ON public.servicos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_servicos_user_id ON public.servicos(user_id);
CREATE INDEX idx_servicos_data_servico ON public.servicos(data_servico);
CREATE INDEX idx_servicos_cliente_id ON public.servicos(cliente_id);