
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
  const [isEditPaymentDialogOpen, setIsEditPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingPayment, setEditingPayment] = useState<{
    id: string;
    valor_pago: number;
    data_pagamento: string;
  } | null>(null);

  const emprestimoPayments = pagamentos.filter(p => p.emprestimo_id === emprestimo.id);
  const totalPago = emprestimoPayments.reduce((sum, p) => sum + Number(p.valor_pago), 0);
  const remainingAmount = Number(emprestimo.valor_original) - totalPago;
  const progressPercentage = (totalPago / Number(emprestimo.valor_original)) * 100;

  const handleAddPayment = async (data: PagamentoEmprestimoFormData) => {
    try {
      const { error: paymentError } = await supabase
        .from('pagamentos_emprestimo')
        .insert([{
          emprestimo_id: emprestimo.id,
          valor_pago: data.valor_pago,
          data_pagamento: data.data_pagamento
        }]);

      if (paymentError) throw paymentError;

      const novoValorAtual = Math.max(0, emprestimo.valor_atual - data.valor_pago);

      const { error: updateError } = await supabase
        .from('emprestimos')
        .update({ valor_atual: novoValorAtual })
        .eq('id', emprestimo.id);

      if (updateError) throw updateError;

      toast.success('Pagamento adicionado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['emprestimos'] });
      queryClient.invalidateQueries({ queryKey: ['pagamentos', emprestimo.id] });
      setIsPaymentDialogOpen(false);
      paymentForm.reset();
    } catch (error: any) {
      console.error('Error adding payment:', error);
      toast.error('Erro ao adicionar pagamento: ' + error.message);
    }
  };

  const handleEditPayment = (payment: any) => {
    setEditingPayment(payment);
    setPaymentAmount(payment.valor_pago.toString());
    setPaymentDate(payment.data_pagamento);
    setIsEditPaymentDialogOpen(true);
  };

  const handleUpdatePayment = async () => {
    if (!editingPayment || !paymentAmount || !paymentDate) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    const valorPago = parseFloat(paymentAmount);
    if (isNaN(valorPago) || valorPago <= 0) {
      toast.error('Valor inválido');
      return;
    }

    try {
      // Calculate the difference
      const oldValor = editingPayment.valor_pago;
      const difference = valorPago - oldValor;

      // Update payment
      const { error: paymentError } = await supabase
        .from('pagamentos_emprestimo')
        .update({
          valor_pago: valorPago,
          data_pagamento: paymentDate
        })
        .eq('id', editingPayment.id);

      if (paymentError) throw paymentError;

      // Update emprestimo valor_atual
      const novoValorAtual = Math.max(0, emprestimo.valor_atual - difference);

      const { error: updateError } = await supabase
        .from('emprestimos')
        .update({ valor_atual: novoValorAtual })
        .eq('id', emprestimo.id);

      if (updateError) throw updateError;

      toast.success('Pagamento atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['emprestimos'] });
      queryClient.invalidateQueries({ queryKey: ['pagamentos', emprestimo.id] });
      setIsEditPaymentDialogOpen(false);
      setEditingPayment(null);
      setPaymentAmount('');
      setPaymentDate('');
    } catch (error: any) {
      console.error('Error updating payment:', error);
      toast.error('Erro ao atualizar pagamento: ' + error.message);
    }
  };

  const handleDeletePayment = async (payment: any) => {
    if (!confirm('Tem certeza que deseja excluir este pagamento?')) {
      return;
    }

    try {
      // Delete payment
      const { error: deleteError } = await supabase
        .from('pagamentos_emprestimo')
        .delete()
        .eq('id', payment.id);

      if (deleteError) throw deleteError;

      // Restore valor_atual
      const novoValorAtual = emprestimo.valor_atual + payment.valor_pago;

      const { error: updateError } = await supabase
        .from('emprestimos')
        .update({ valor_atual: novoValorAtual })
        .eq('id', emprestimo.id);

      if (updateError) throw updateError;

      toast.success('Pagamento excluído com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['emprestimos'] });
      queryClient.invalidateQueries({ queryKey: ['pagamentos', emprestimo.id] });
    } catch (error: any) {
      console.error('Error deleting payment:', error);
      toast.error('Erro ao excluir pagamento: ' + error.message);
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

  const handleEditPayment = (pagamento: { id: string; valor_pago: number; data_pagamento: string }) => {
    setEditingPayment(pagamento);
    setPaymentAmount(pagamento.valor_pago.toString());
    setPaymentDate(pagamento.data_pagamento);
    setIsEditPaymentDialogOpen(true);
  };

  const handleUpdatePayment = async () => {
    if (!editingPayment || !paymentAmount || !paymentDate) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    const novoValorPago = Number(paymentAmount);
    if (novoValorPago <= 0) {
      toast.error('O valor deve ser maior que zero');
      return;
    }

    try {
      const valorAntigoPago = Number(editingPayment.valor_pago);
      const diferencaValor = novoValorPago - valorAntigoPago;
      
      const { error: paymentError } = await supabase
        .from('pagamentos_emprestimo')
        .update({
          valor_pago: novoValorPago,
          data_pagamento: paymentDate
        })
        .eq('id', editingPayment.id);

      if (paymentError) throw paymentError;

      const novoValorAtual = remainingAmount - diferencaValor;
      
      const { error: updateError } = await supabase
        .from('emprestimos')
        .update({ valor_atual: novoValorAtual })
        .eq('id', emprestimo.id);

      if (updateError) throw updateError;

      toast.success('Pagamento atualizado com sucesso!');
      setPaymentAmount('');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setEditingPayment(null);
      setIsEditPaymentDialogOpen(false);
      onUpdate();
    } catch (error) {
      console.error('Erro ao atualizar pagamento:', error);
      toast.error('Erro ao atualizar pagamento');
    }
  };

  const handleDeletePayment = async (pagamentoId: string, valorPago: number) => {
    if (!confirm('Tem certeza que deseja excluir este pagamento?')) return;

    try {
      const { error: deleteError } = await supabase
        .from('pagamentos_emprestimo')
        .delete()
        .eq('id', pagamentoId);

      if (deleteError) throw deleteError;

      const novoValorAtual = remainingAmount + valorPago;
      
      const { error: updateError } = await supabase
        .from('emprestimos')
        .update({ valor_atual: novoValorAtual })
        .eq('id', emprestimo.id);

      if (updateError) throw updateError;

      toast.success('Pagamento excluído com sucesso!');
      onUpdate();
    } catch (error) {
      console.error('Erro ao excluir pagamento:', error);
      toast.error('Erro ao excluir pagamento');
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
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPayment(pagamento)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePayment(pagamento.id, Number(pagamento.valor_pago))}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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

      {/* Formulário de Edição do Empréstimo */}
      <EmprestimoEditForm
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSuccess={onUpdate}
        emprestimo={emprestimo}
      />

      {/* Formulário de Edição de Pagamento */}
      <Dialog open={isEditPaymentDialogOpen} onOpenChange={setIsEditPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Pagamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-valor">Valor do Pagamento</Label>
              <Input
                id="edit-valor"
                type="number"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="0,00"
              />
            </div>
            <div>
              <Label htmlFor="edit-data">Data do Pagamento</Label>
              <Input
                id="edit-data"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
            <Button onClick={handleUpdatePayment} className="w-full">
              Atualizar Pagamento
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
