
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus, Receipt } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmprestimoEditForm } from './EmprestimoEditForm';

interface EmprestimoCardProps {
  emprestimo: {
    id: string;
    nome: string;
    valor_original: number;
    valor_atual: number;
    created_at: string;
  };
  pagamentos: Array<{
    id: string;
    emprestimo_id: string;
    valor_pago: number;
    data_pagamento: string;
  }>;
  onUpdate: () => void;
}

export const EmprestimoCard: React.FC<EmprestimoCardProps> = ({ 
  emprestimo, 
  pagamentos = [],
  onUpdate 
}) => {
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  const emprestimoPayments = pagamentos.filter(p => p.emprestimo_id === emprestimo.id);
  const totalPago = emprestimoPayments.reduce((sum, p) => sum + Number(p.valor_pago), 0);
  const remainingAmount = Number(emprestimo.valor_original) - totalPago;
  const progressPercentage = (totalPago / Number(emprestimo.valor_original)) * 100;

  const handleAddPayment = async () => {
    if (!paymentAmount || !paymentDate) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    const valorPago = Number(paymentAmount);
    if (valorPago <= 0) {
      toast.error('O valor deve ser maior que zero');
      return;
    }

    if (valorPago > remainingAmount) {
      toast.error('O valor do pagamento não pode ser maior que o valor restante');
      return;
    }

    try {
      const { error: paymentError } = await supabase
        .from('pagamentos_emprestimo')
        .insert([{
          emprestimo_id: emprestimo.id,
          valor_pago: valorPago,
          data_pagamento: paymentDate
        }]);

      if (paymentError) throw paymentError;

      const novoValorAtual = remainingAmount - valorPago;
      
      const { error: updateError } = await supabase
        .from('emprestimos')
        .update({ valor_atual: novoValorAtual })
        .eq('id', emprestimo.id);

      if (updateError) throw updateError;

      toast.success('Pagamento adicionado com sucesso!');
      setPaymentAmount('');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setIsPaymentDialogOpen(false);
      onUpdate();
    } catch (error) {
      console.error('Erro ao adicionar pagamento:', error);
      toast.error('Erro ao adicionar pagamento');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este empréstimo?')) return;

    try {
      const { error } = await supabase
        .from('emprestimos')
        .delete()
        .eq('id', emprestimo.id);

      if (error) throw error;

      toast.success('Empréstimo excluído com sucesso!');
      onUpdate();
    } catch (error) {
      console.error('Erro ao excluir empréstimo:', error);
      toast.error('Erro ao excluir empréstimo');
    }
  };

  const isFullyPaid = remainingAmount <= 0;

  return (
    <Card className="hover:shadow-md transition-shadow w-full max-w-sm mx-auto">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{emprestimo.nome}</CardTitle>
            <CardDescription className="text-sm">
              Criado em {new Date(emprestimo.created_at).toLocaleDateString('pt-BR')}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditDialogOpen(true)}
              className="h-8 w-8 p-0"
            >
              <Edit className="w-3 h-3" />
            </Button>
            <Badge variant={isFullyPaid ? "default" : "secondary"} className="shrink-0">
              {isFullyPaid ? 'Quitado' : 'Em andamento'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Valor Original</p>
            <p className="font-medium text-base">R$ {Number(emprestimo.valor_original).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Valor Restante</p>
            <p className={`font-medium text-base ${isFullyPaid ? 'text-green-600' : 'text-orange-600'}`}>
              R$ {remainingAmount.toFixed(2)}
            </p>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Progresso</span>
            <span>{progressPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>

        <div className="text-sm">
          <p className="text-muted-foreground text-xs">Total Pago</p>
          <p className="font-medium text-green-600">R$ {totalPago.toFixed(2)}</p>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <div className="flex gap-2">
            {!isFullyPaid && (
              <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="flex-1 text-xs px-2 py-1 h-8">
                    <Plus className="w-3 h-3 mr-1" />
                    Adicionar Pagamento
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Pagamento - {emprestimo.nome}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="valor">Valor do Pagamento</Label>
                      <Input
                        id="valor"
                        type="number"
                        step="0.01"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="0,00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="data">Data do Pagamento</Label>
                      <Input
                        id="data"
                        type="date"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleAddPayment} className="w-full">
                      Adicionar Pagamento
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            
            <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className={`text-xs px-2 py-1 h-8 ${!isFullyPaid ? 'flex-1' : 'flex-1'}`}>
                  <Receipt className="w-3 h-3 mr-1" />
                  Histórico
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Histórico de Pagamentos - {emprestimo.nome}</DialogTitle>
                </DialogHeader>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {emprestimoPayments.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Nenhum pagamento registrado
                    </p>
                  ) : (
                    emprestimoPayments.map((pagamento) => (
                      <div key={pagamento.id} className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <p className="font-medium">R$ {Number(pagamento.valor_pago).toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(pagamento.data_pagamento).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <Button variant="destructive" size="sm" onClick={handleDelete} className="w-full text-xs h-8">
            <Trash2 className="w-3 h-3 mr-1" />
            Excluir Empréstimo
          </Button>
        </div>
      </CardContent>

      {/* Formulário de Edição */}
      <EmprestimoEditForm
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSuccess={onUpdate}
        emprestimo={emprestimo}
      />
    </Card>
  );
};
