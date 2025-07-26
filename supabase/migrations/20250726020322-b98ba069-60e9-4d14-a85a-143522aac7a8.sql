
-- Criar tabela de clientes
CREATE TABLE public.clientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  nome TEXT NOT NULL,
  cpf_cnpj TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT NOT NULL,
  endereco TEXT NOT NULL,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL,
  cep TEXT NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de sites
CREATE TABLE public.sites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE NOT NULL,
  cliente_nome TEXT NOT NULL, -- Denormalizado para facilitar consultas
  data_inicio DATE NOT NULL,
  tipo_plano TEXT NOT NULL CHECK (tipo_plano IN ('assinatura-70', 'assinatura-85', 'venda-1400')),
  status TEXT NOT NULL CHECK (status IN ('Ativo', 'Suspenso', 'Cancelado')),
  data_vencimento DATE NOT NULL,
  valor_mensal DECIMAL(10,2) NOT NULL,
  descricao_projeto TEXT NOT NULL,
  url_site TEXT,
  observacoes TEXT,
  hospedagem BOOLEAN NOT NULL DEFAULT false,
  instalacao BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de instalações
CREATE TABLE public.instalacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  numero_pedido TEXT NOT NULL,
  data_instalacao DATE NOT NULL,
  arquiteto_nome TEXT NOT NULL,
  ambiente TEXT NOT NULL,
  endereco TEXT NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Agendado', 'Em Andamento', 'Concluído', 'Cancelado')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instalacoes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para clientes
CREATE POLICY "Users can view their own clientes" 
  ON public.clientes 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clientes" 
  ON public.clientes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clientes" 
  ON public.clientes 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clientes" 
  ON public.clientes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas RLS para sites
CREATE POLICY "Users can view their own sites" 
  ON public.sites 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sites" 
  ON public.sites 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sites" 
  ON public.sites 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sites" 
  ON public.sites 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas RLS para instalações
CREATE POLICY "Users can view their own instalacoes" 
  ON public.instalacoes 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own instalacoes" 
  ON public.instalacoes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own instalacoes" 
  ON public.instalacoes 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own instalacoes" 
  ON public.instalacoes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Criar índices para melhor performance
CREATE INDEX idx_clientes_user_id ON public.clientes(user_id);
CREATE INDEX idx_sites_user_id ON public.sites(user_id);
CREATE INDEX idx_sites_cliente_id ON public.sites(cliente_id);
CREATE INDEX idx_instalacoes_user_id ON public.instalacoes(user_id);
CREATE INDEX idx_instalacoes_data ON public.instalacoes(data_instalacao);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_clientes_updated_at 
    BEFORE UPDATE ON public.clientes 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sites_updated_at 
    BEFORE UPDATE ON public.sites 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_instalacoes_updated_at 
    BEFORE UPDATE ON public.instalacoes 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
