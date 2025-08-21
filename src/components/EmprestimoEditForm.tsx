
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EmprestimoEditFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  emprestimo: {
    id: string;
    nome: string;
    valor_original: number;
  };
}

export const EmprestimoEditForm: React.FC<EmprestimoEditFormProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  emprestimo
}) => {
  const [formData, setFormData] = useState({
    nome: emprestimo.nome,
    valor_original: emprestimo.valor_original.toString()
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
        .update({
          nome: formData.nome,
          valor_original: valorOriginal,
          updated_at: new Date().toISOString()
        })
        .eq('id', emprestimo.id);

      if (error) throw error;

      toast.success('Empréstimo atualizado com sucesso!');
      onClose();
      onSuccess();
    } catch (error) {
      console.error('Erro ao atualizar empréstimo:', error);
      toast.error('Erro ao atualizar empréstimo');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Empréstimo</DialogTitle>
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
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
