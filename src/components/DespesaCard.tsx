import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Edit, Trash2, Check, X } from 'lucide-react';
import { format, isAfter, isBefore, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Despesa {
  id: string;
  nome: string;
  valor: number;
  data_vencimento: string;
  anotacao?: string;
  paga: boolean;
  created_at: string;
  updated_at: string;
}

interface DespesaCardProps {
  despesa: Despesa;
  onEdit: (despesa: Despesa) => void;
  onDelete: (id: string) => void;
  onDuplicate: (despesa: Despesa) => void;
  onTogglePaga: (id: string, paga: boolean) => void;
}

export const DespesaCard: React.FC<DespesaCardProps> = ({
  despesa,
  onEdit,
  onDelete,
  onDuplicate,
  onTogglePaga,
}) => {
  const dataVencimento = new Date(despesa.data_vencimento);
  const hoje = new Date();
  
  const isVencida = !despesa.paga && isBefore(dataVencimento, hoje) && !isToday(dataVencimento);
  const isVenceHoje = !despesa.paga && isToday(dataVencimento);

  const getStatusBadge = () => {
    if (despesa.paga) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Paga</Badge>;
    }
    if (isVencida) {
      return <Badge variant="destructive">Vencida</Badge>;
    }
    if (isVenceHoje) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Vence Hoje</Badge>;
    }
    return <Badge variant="outline">Pendente</Badge>;
  };

  return (
    <Card className={`w-full ${isVencida && !despesa.paga ? 'border-red-200 bg-red-50' : ''} ${isVenceHoje && !despesa.paga ? 'border-yellow-200 bg-yellow-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{despesa.nome}</h3>
            <p className="text-2xl font-bold text-primary mt-1">
              R$ {despesa.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Vencimento:</span>
            <span className="font-medium">
              {format(dataVencimento, 'dd/MM/yyyy', { locale: ptBR })}
            </span>
          </div>
          
          {despesa.anotacao && (
            <div className="text-sm">
              <span className="text-muted-foreground">Anotação:</span>
              <p className="mt-1">{despesa.anotacao}</p>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(despesa)}
            className="flex items-center gap-1"
          >
            <Edit className="h-4 w-4" />
            Editar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDuplicate(despesa)}
            className="flex items-center gap-1"
          >
            <Copy className="h-4 w-4" />
            Duplicar
          </Button>
          
          <Button
            variant={despesa.paga ? "outline" : "default"}
            size="sm"
            onClick={() => onTogglePaga(despesa.id, !despesa.paga)}
            className={`flex items-center gap-1 ${despesa.paga ? '' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {despesa.paga ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
            {despesa.paga ? 'Marcar Pendente' : 'Marcar Paga'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(despesa.id)}
            className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Excluir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};