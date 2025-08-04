
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface EmprestimoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EmprestimoForm: React.FC<EmprestimoFormProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    nome: '',
    valor_original: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome || !formData.valor_original) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    const valorOriginal = Number(formData.valor_original);
    if (valorOriginal <= 0) {
      toast.error('O valor deve ser maior que zero');
      return;
    }

    try {
      const { error } = await supabase
        .from('emprestimos')
        .insert([{
          user_id: user?.id,
          nome: formData.nome,
          valor_original: valorOriginal,
          valor_atual: valorOriginal
        }]);

      if (error) throw error;

      toast.success('Empréstimo cadastrado com sucesso!');
      setFormData({ nome: '', valor_original: '' });
      onClose();
      onSuccess();
    } catch (error) {
      console.error('Erro ao cadastrar empréstimo:', error);
      toast.error('Erro ao cadastrar empréstimo');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Empréstimo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome do Empréstimo</Label>
            <Input
              id="nome"
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: Banco Santander, João Silva, etc."
            />
          </div>
          <div>
            <Label htmlFor="valor">Valor Original</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              value={formData.valor_original}
              onChange={(e) => setFormData({ ...formData, valor_original: e.target.value })}
              placeholder="0,00"
            />
          </div>
          <Button type="submit" className="w-full">
            Cadastrar Empréstimo
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
