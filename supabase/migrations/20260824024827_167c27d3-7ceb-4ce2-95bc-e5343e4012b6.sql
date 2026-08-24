CREATE TABLE public.gastos_diarios_historico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  gasto_id uuid NOT NULL,
  acao text NOT NULL,
  descricao text NOT NULL DEFAULT '',
  alteracoes jsonb NOT NULL DEFAULT '[]'::jsonb,
  snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, DELETE ON public.gastos_diarios_historico TO authenticated;
GRANT ALL ON public.gastos_diarios_historico TO service_role;

ALTER TABLE public.gastos_diarios_historico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own gastos historico"
  ON public.gastos_diarios_historico FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own gastos historico"
  ON public.gastos_diarios_historico FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_gastos_historico_user_created
  ON public.gastos_diarios_historico (user_id, created_at DESC);
CREATE INDEX idx_gastos_historico_gasto
  ON public.gastos_diarios_historico (gasto_id);

CREATE OR REPLACE FUNCTION public.log_gasto_diario_historico()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  changes jsonb := '[]'::jsonb;
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.gastos_diarios_historico (user_id, gasto_id, acao, descricao, alteracoes, snapshot)
    VALUES (NEW.user_id, NEW.id, 'criado', NEW.descricao, '[]'::jsonb, to_jsonb(NEW));
    RETURN NEW;

  ELSIF (TG_OP = 'UPDATE') THEN
    IF NEW.descricao IS DISTINCT FROM OLD.descricao THEN
      changes := changes || jsonb_build_object('campo', 'Descrição', 'de', OLD.descricao, 'para', NEW.descricao);
    END IF;
    IF NEW.valor IS DISTINCT FROM OLD.valor THEN
      changes := changes || jsonb_build_object('campo', 'Valor', 'de', OLD.valor::text, 'para', NEW.valor::text);
    END IF;
    IF NEW.data_gasto IS DISTINCT FROM OLD.data_gasto THEN
      changes := changes || jsonb_build_object('campo', 'Data', 'de', OLD.data_gasto::text, 'para', NEW.data_gasto::text);
    END IF;
    IF NEW.categoria IS DISTINCT FROM OLD.categoria THEN
      changes := changes || jsonb_build_object('campo', 'Categoria', 'de', OLD.categoria, 'para', NEW.categoria);
    END IF;
    IF NEW.forma_pagamento IS DISTINCT FROM OLD.forma_pagamento THEN
      changes := changes || jsonb_build_object('campo', 'Forma de pagamento', 'de', OLD.forma_pagamento, 'para', NEW.forma_pagamento);
    END IF;
    IF NEW.essencial IS DISTINCT FROM OLD.essencial THEN
      changes := changes || jsonb_build_object(
        'campo', 'Classificação',
        'de', CASE WHEN OLD.essencial THEN 'Essencial' ELSE 'Supérfluo' END,
        'para', CASE WHEN NEW.essencial THEN 'Essencial' ELSE 'Supérfluo' END
      );
    END IF;
    IF NEW.observacao IS DISTINCT FROM OLD.observacao THEN
      changes := changes || jsonb_build_object('campo', 'Observação', 'de', COALESCE(OLD.observacao, ''), 'para', COALESCE(NEW.observacao, ''));
    END IF;

    IF jsonb_array_length(changes) > 0 THEN
      INSERT INTO public.gastos_diarios_historico (user_id, gasto_id, acao, descricao, alteracoes, snapshot)
      VALUES (NEW.user_id, NEW.id, 'editado', NEW.descricao, changes, to_jsonb(NEW));
    END IF;
    RETURN NEW;

  ELSE
    INSERT INTO public.gastos_diarios_historico (user_id, gasto_id, acao, descricao, alteracoes, snapshot)
    VALUES (OLD.user_id, OLD.id, 'excluido', OLD.descricao, '[]'::jsonb, to_jsonb(OLD));
    RETURN OLD;
  END IF;
END;
$$;

CREATE TRIGGER trg_gastos_diarios_historico
AFTER INSERT OR UPDATE OR DELETE ON public.gastos_diarios
FOR EACH ROW EXECUTE FUNCTION public.log_gasto_diario_historico();