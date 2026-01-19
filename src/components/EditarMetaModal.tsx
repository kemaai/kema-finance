import React, { useState } from 'react';
import { Edit2, Check, X, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { MetaFinanceira, useMetasFinanceiras } from '@/hooks/useMetasFinanceiras';
import { toast } from 'sonner';

interface EditarMetaModalProps {
  meta: MetaFinanceira;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditarMetaModal({ meta, open, onOpenChange }: EditarMetaModalProps) {
  const [valorAtual, setValorAtual] = useState(meta.valor_atual.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateMeta } = useMetasFinanceiras();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.');
    setValorAtual(value);
  };

  const handleSubmit = async () => {
    const valor = parseFloat(valorAtual) || 0;
    const novoProgresso = meta.valor_meta > 0 ? (valor / meta.valor_meta) * 100 : 0;

    setIsSubmitting(true);
    try {
      await updateMeta.mutateAsync({
        id: meta.id,
        valor_atual: valor,
        progresso: Math.min(novoProgresso, 100),
      });
      toast.success('Meta atualizada com sucesso!');
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating meta:', error);
      toast.error('Erro ao atualizar meta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const valorNumerico = parseFloat(valorAtual) || 0;
  const progressoPreview = meta.valor_meta > 0 ? (valorNumerico / meta.valor_meta) * 100 : 0;
  const diferenca = valorNumerico - meta.valor_atual;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit2 className="w-5 h-5 text-primary" />
            Atualizar Progresso
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Meta Info */}
          <div className="p-4 bg-muted/50 rounded-xl">
            <h4 className="font-medium text-foreground mb-2">{meta.nome}</h4>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Meta:</span>
              <span className="font-medium">{formatCurrency(meta.valor_meta)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">Valor anterior:</span>
              <span className="font-medium">{formatCurrency(meta.valor_atual)}</span>
            </div>
          </div>

          {/* Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Novo valor acumulado (R$)
            </label>
            <Input
              type="text"
              inputMode="decimal"
              value={valorAtual}
              onChange={handleInputChange}
              placeholder="0.00"
              className="text-lg font-medium"
            />
            {diferenca !== 0 && (
              <p className={`text-sm flex items-center gap-1 ${diferenca > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                <TrendingUp className={`w-4 h-4 ${diferenca < 0 ? 'rotate-180' : ''}`} />
                {diferenca > 0 ? '+' : ''}{formatCurrency(diferenca)}
              </p>
            )}
          </div>

          {/* Progress Preview */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progresso</span>
              <span className={`font-medium ${progressoPreview >= 100 ? 'text-emerald-500' : 'text-foreground'}`}>
                {progressoPreview.toFixed(1)}%
              </span>
            </div>
            <div className="relative h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-300 ${
                  progressoPreview >= 100 ? 'bg-emerald-500' :
                  progressoPreview >= 50 ? 'bg-amber-500' :
                  'bg-primary'
                }`}
                style={{ width: `${Math.min(progressoPreview, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>R$ 0</span>
              <span>{formatCurrency(meta.valor_meta)}</span>
            </div>
          </div>

          {/* Completion message */}
          {progressoPreview >= 100 && (
            <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-center">
              <p className="text-sm font-medium text-emerald-500">🎉 Parabéns! Meta atingida!</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
            <Check className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
