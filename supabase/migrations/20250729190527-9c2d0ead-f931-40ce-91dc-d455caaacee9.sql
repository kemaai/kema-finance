-- Create table for despesas (expenses)
CREATE TABLE public.despesas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    nome TEXT NOT NULL,
    valor NUMERIC(10,2) NOT NULL DEFAULT 0,
    data_vencimento DATE NOT NULL,
    anotacao TEXT,
    paga BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.despesas ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own despesas" 
ON public.despesas 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own despesas" 
ON public.despesas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own despesas" 
ON public.despesas 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own despesas" 
ON public.despesas 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_despesas_updated_at
BEFORE UPDATE ON public.despesas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();