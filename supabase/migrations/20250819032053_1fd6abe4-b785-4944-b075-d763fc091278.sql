
-- Fix the update_updated_at_column() function to use a fixed search path
-- This prevents potential SQL injection in multi-schema environments
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Add triggers for updated_at columns if they don't exist
DO $$
BEGIN
    -- Check and add trigger for clientes table
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_clientes_updated_at' 
        AND tgrelid = 'public.clientes'::regclass
    ) THEN
        CREATE TRIGGER update_clientes_updated_at
            BEFORE UPDATE ON public.clientes
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;

    -- Check and add trigger for despesas table
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_despesas_updated_at' 
        AND tgrelid = 'public.despesas'::regclass
    ) THEN
        CREATE TRIGGER update_despesas_updated_at
            BEFORE UPDATE ON public.despesas
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;

    -- Check and add trigger for dividas_negativadas table
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_dividas_negativadas_updated_at' 
        AND tgrelid = 'public.dividas_negativadas'::regclass
    ) THEN
        CREATE TRIGGER update_dividas_negativadas_updated_at
            BEFORE UPDATE ON public.dividas_negativadas
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;

    -- Check and add trigger for emprestimos table
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_emprestimos_updated_at' 
        AND tgrelid = 'public.emprestimos'::regclass
    ) THEN
        CREATE TRIGGER update_emprestimos_updated_at
            BEFORE UPDATE ON public.emprestimos
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;

    -- Check and add trigger for instalacoes table
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_instalacoes_updated_at' 
        AND tgrelid = 'public.instalacoes'::regclass
    ) THEN
        CREATE TRIGGER update_instalacoes_updated_at
            BEFORE UPDATE ON public.instalacoes
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;

    -- Check and add trigger for sites table
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_sites_updated_at' 
        AND tgrelid = 'public.sites'::regclass
    ) THEN
        CREATE TRIGGER update_sites_updated_at
            BEFORE UPDATE ON public.sites
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;
