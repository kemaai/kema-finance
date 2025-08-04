
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface DividaNegativadaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DividaNegativadaForm: React.FC<DividaNegativadaFormProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    nome: '',
    valor: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome || !formData.valor) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    const valor = Number(formData.valor);
    if (valor <= 0) {
      toast.error('O valor deve ser maior que zero');
      return;
    }

    try {
      const { error } = await supabase
        .from('dividas_negativadas')
        .insert([{
          user_id: user?.id,
          nome: formData.nome,
          valor_original: valor,
          valor_atual: valor,
          pago: false
        }]);

      if (error) throw error;

      toast.success('Dívida negativada cadastrada com sucesso!');
      setFormData({ nome: '', valor: '' });
      onClose();
      onSuccess();
    } catch (error) {
      console.error('Erro ao cadastrar dívida:', error);
      toast.error('Erro ao cadastrar dívida');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Dívida Negativada</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome da Dívida</Label>
            <Input
              id="nome"
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: Cartão Visa, Financiamento Carro, etc."
            />
          </div>
          <div>
            <Label htmlFor="valor">Valor</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              value={formData.valor}
              onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
              placeholder="0,00"
            />
          </div>
          <Button type="submit" className="w-full">
            Cadastrar Dívida
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
