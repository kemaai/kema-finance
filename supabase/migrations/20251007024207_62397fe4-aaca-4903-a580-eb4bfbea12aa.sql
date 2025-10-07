-- Add pedido_recebido column to instalacoes table
ALTER TABLE public.instalacoes 
ADD COLUMN pedido_recebido boolean NOT NULL DEFAULT false;