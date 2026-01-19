-- Tabela de metas financeiras personalizáveis
CREATE TABLE public.metas_financeiras (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tipo_meta TEXT NOT NULL, -- 'reserva_emergencia', 'quitar_divida', 'economia_mensal', 'distribuicao'
  nome TEXT NOT NULL,
  descricao TEXT,
  valor_meta NUMERIC DEFAULT 0,
  valor_atual NUMERIC DEFAULT 0,
  valor_mensal_sugerido NUMERIC DEFAULT 0,
  prazo_meses INTEGER,
  data_inicio DATE DEFAULT CURRENT_DATE,
  data_fim DATE,
  progresso NUMERIC DEFAULT 0,
  ativa BOOLEAN DEFAULT TRUE,
  prioridade INTEGER DEFAULT 1, -- 1 = alta, 2 = média, 3 = baixa
  criada_por_ai BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.metas_financeiras ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own metas_financeiras" 
ON public.metas_financeiras 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own metas_financeiras" 
ON public.metas_financeiras 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own metas_financeiras" 
ON public.metas_financeiras 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own metas_financeiras" 
ON public.metas_financeiras 
FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_metas_financeiras_updated_at
BEFORE UPDATE ON public.metas_financeiras
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();