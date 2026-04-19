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
import { useAuth } from '@/hooks/useAuth';

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
  const { user } = useAuth();
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  const handleMarkAsPaid = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('dividas_negativadas')
        .update({ 
          pago: true,
          data_pagamento: paymentDate,
          valor_atual: 0
        })
        .eq('id', divida.id)
        .eq('user_id', user.id);

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
    if (!user) return;

    try {
      const { error } = await supabase
        .from('dividas_negativadas')
        .delete()
        .eq('id', divida.id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Dívida excluída com sucesso!');
      onUpdate();
    } catch (error) {
      console.error('Erro ao excluir dívida:', error);
      toast.error('Erro ao excluir dívida');
    }
  };

  return (
    <Card className="card-tech border-border border-l-4 border-l-amber-500 hover:border-primary/50 hover:border-l-amber-400 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg text-foreground">{divida.nome}</CardTitle>
            <CardDescription>
              Criado em {new Date(divida.created_at).toLocaleDateString('pt-BR')}
            </CardDescription>
          </div>
          <Badge className={divida.pago 
            ? 'bg-green-900/50 text-green-400 border border-green-700/50' 
            : 'bg-red-900/50 text-red-400 border border-red-700/50'
          }>
            {divida.pago ? 'Pago' : 'Pendente'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Valor Original</p>
            <p className="font-medium text-lg text-foreground">R$ {Number(divida.valor_original).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Valor Atual</p>
            <p className={`font-medium text-lg ${divida.pago ? 'text-green-400' : 'text-red-400'}`}>
              R$ {Number(divida.valor_atual).toFixed(2)}
            </p>
          </div>
        </div>

        {divida.pago && divida.data_pagamento && (
          <div className="text-sm">
            <p className="text-muted-foreground">Data do Pagamento</p>
            <p className="font-medium text-green-400">
              {new Date(divida.data_pagamento).toLocaleDateString('pt-BR')}
            </p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {!divida.pago && (
            <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90">
                  <Check className="w-4 h-4 mr-1" />
                  Marcar como Pago
                </Button>
              </DialogTrigger>
              <DialogContent className="card-tech border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Marcar como Pago - {divida.nome}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="data" className="text-foreground">Data do Pagamento</Label>
                    <Input
                      id="data"
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="bg-input border-border focus:border-primary"
                    />
                  </div>
                  <Button onClick={handleMarkAsPaid} className="w-full bg-primary hover:bg-primary/90">
                    Confirmar Pagamento
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDelete}
            className="border-red-700/50 text-red-400 hover:bg-red-900/30"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
