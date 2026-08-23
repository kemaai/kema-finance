CREATE TABLE public.gastos_diarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  descricao TEXT NOT NULL,
  valor NUMERIC NOT NULL DEFAULT 0,
  data_gasto DATE NOT NULL DEFAULT CURRENT_DATE,
  categoria TEXT NOT NULL DEFAULT 'Outros',
  forma_pagamento TEXT NOT NULL DEFAULT 'Pix',
  essencial BOOLEAN NOT NULL DEFAULT true,
  observacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.gastos_diarios TO authenticated;
GRANT ALL ON public.gastos_diarios TO service_role;

ALTER TABLE public.gastos_diarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own gastos_diarios" ON public.gastos_diarios FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own gastos_diarios" ON public.gastos_diarios FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own gastos_diarios" ON public.gastos_diarios FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own gastos_diarios" ON public.gastos_diarios FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_gastos_diarios_user_data ON public.gastos_diarios (user_id, data_gasto DESC);

CREATE TRIGGER update_gastos_diarios_updated_at
BEFORE UPDATE ON public.gastos_diarios
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();