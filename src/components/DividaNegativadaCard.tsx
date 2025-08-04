
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DividaNegativadaCardProps {
  divida: {
    id: string;
    nome: string;
    valor_original: number;
    valor_atual: number;
    data_pagamento?: string;
    pago: boolean;
    created_at: string;
  };
  onUpdate: () => void;
}

export const DividaNegativadaCard: React.FC<DividaNegativadaCardProps> = ({ 
  divida, 
  onUpdate 
}) => {
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  const handleMarkAsPaid = async () => {
    try {
      const { error } = await supabase
        .from('dividas_negativadas')
        .update({ 
          pago: true,
          data_pagamento: paymentDate,
          valor_atual: 0
        })
        .eq('id', divida.id);

      if (error) throw error;

      toast.success('Dívida marcada como paga!');
      setIsPaymentDialogOpen(false);
      onUpdate();
    } catch (error) {
      console.error('Erro ao marcar dívida como paga:', error);
      toast.error('Erro ao marcar dívida como paga');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta dívida?')) return;

    try {
      const { error } = await supabase
        .from('dividas_negativadas')
        .delete()
        .eq('id', divida.id);

      if (error) throw error;

      toast.success('Dívida excluída com sucesso!');
      onUpdate();
    } catch (error) {
      console.error('Erro ao excluir dívida:', error);
      toast.error('Erro ao excluir dívida');
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{divida.nome}</CardTitle>
            <CardDescription>
              Criado em {new Date(divida.created_at).toLocaleDateString('pt-BR')}
            </CardDescription>
          </div>
          <Badge variant={divida.pago ? "default" : "destructive"}>
            {divida.pago ? 'Pago' : 'Pendente'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Valor Original</p>
            <p className="font-medium text-lg">R$ {Number(divida.valor_original).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Valor Atual</p>
            <p className={`font-medium text-lg ${divida.pago ? 'text-green-600' : 'text-red-600'}`}>
              R$ {Number(divida.valor_atual).toFixed(2)}
            </p>
          </div>
        </div>

        {divida.pago && divida.data_pagamento && (
          <div className="text-sm">
            <p className="text-muted-foreground">Data do Pagamento</p>
            <p className="font-medium text-green-600">
              {new Date(divida.data_pagamento).toLocaleDateString('pt-BR')}
            </p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {!divida.pago && (
            <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex-1">
                  <Check className="w-4 h-4 mr-1" />
                  Marcar como Pago
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Marcar como Pago - {divida.nome}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="data">Data do Pagamento</Label>
                    <Input
                      id="data"
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleMarkAsPaid} className="w-full">
                    Confirmar Pagamento
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
