
-- Criar tabela para empréstimos
CREATE TABLE public.emprestimos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  valor_original NUMERIC NOT NULL DEFAULT 0,
  valor_atual NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para pagamentos de empréstimos
CREATE TABLE public.pagamentos_emprestimo (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  emprestimo_id UUID NOT NULL REFERENCES public.emprestimos(id) ON DELETE CASCADE,
  valor_pago NUMERIC NOT NULL DEFAULT 0,
  data_pagamento DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para dívidas negativadas
CREATE TABLE public.dividas_negativadas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  valor_original NUMERIC NOT NULL DEFAULT 0,
  valor_atual NUMERIC NOT NULL DEFAULT 0,
  data_pagamento DATE NULL,
  pago BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.emprestimos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos_emprestimo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dividas_negativadas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para empréstimos
CREATE POLICY "Users can view their own emprestimos" 
  ON public.emprestimos 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own emprestimos" 
  ON public.emprestimos 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own emprestimos" 
  ON public.emprestimos 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own emprestimos" 
  ON public.emprestimos 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas RLS para pagamentos de empréstimos
CREATE POLICY "Users can view their own pagamentos_emprestimo" 
  ON public.pagamentos_emprestimo 
  FOR SELECT 
  USING (EXISTS(
    SELECT 1 FROM public.emprestimos 
    WHERE id = pagamentos_emprestimo.emprestimo_id 
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create their own pagamentos_emprestimo" 
  ON public.pagamentos_emprestimo 
  FOR INSERT 
  WITH CHECK (EXISTS(
    SELECT 1 FROM public.emprestimos 
    WHERE id = emprestimo_id 
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own pagamentos_emprestimo" 
  ON public.pagamentos_emprestimo 
  FOR UPDATE 
  USING (EXISTS(
    SELECT 1 FROM public.emprestimos 
    WHERE id = pagamentos_emprestimo.emprestimo_id 
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own pagamentos_emprestimo" 
  ON public.pagamentos_emprestimo 
  FOR DELETE 
  USING (EXISTS(
    SELECT 1 FROM public.emprestimos 
    WHERE id = pagamentos_emprestimo.emprestimo_id 
    AND user_id = auth.uid()
  ));

-- Políticas RLS para dívidas negativadas
CREATE POLICY "Users can view their own dividas_negativadas" 
  ON public.dividas_negativadas 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dividas_negativadas" 
  ON public.dividas_negativadas 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dividas_negativadas" 
  ON public.dividas_negativadas 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dividas_negativadas" 
  ON public.dividas_negativadas 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_emprestimos_updated_at 
  BEFORE UPDATE ON public.emprestimos 
  FOR EACH ROW 
  EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_dividas_negativadas_updated_at 
  BEFORE UPDATE ON public.dividas_negativadas 
  FOR EACH ROW 
  EXECUTE PROCEDURE public.update_updated_at_column();
