import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Copy, Edit, Trash2, Check, X } from 'lucide-react';
import { format, isAfter, isBefore, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { parseLocalDate } from '@/lib/utils';

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
  const dataVencimento = parseLocalDate(despesa.data_vencimento);
  const hoje = new Date();
  
  const isVencida = !despesa.paga && isBefore(dataVencimento, hoje) && !isToday(dataVencimento);
  const isVenceHoje = !despesa.paga && isToday(dataVencimento);

  const getStatusBadge = () => {
    if (despesa.paga) return <StatusBadge tone="success">Paga</StatusBadge>;
    if (isVencida) return <StatusBadge tone="danger">Vencida</StatusBadge>;
    if (isVenceHoje) return <StatusBadge tone="warning">Vence Hoje</StatusBadge>;
    return <StatusBadge tone="warning">Pendente</StatusBadge>;
  };

  const getCardStyle = () => {
    if (isVencida && !despesa.paga) {
      return 'border-red-300 bg-red-50/50 dark:border-red-700/50 dark:bg-red-900/10';
    }
    if (isVenceHoje && !despesa.paga) {
      return 'border-amber-300 bg-amber-50/50 dark:border-amber-700/50 dark:bg-amber-900/10';
    }
    return 'border-border';
  };

  return (
    <Card className={`w-full card-tech border-l-4 border-l-red-500 hover:border-l-red-400 ${getCardStyle()} hover:border-primary/50 transition-all duration-300`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-foreground">{despesa.nome}</h3>
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
            <span className="font-medium text-foreground">
              {format(dataVencimento, 'dd/MM/yyyy', { locale: ptBR })}
            </span>
          </div>
          
          {despesa.anotacao && (
            <div className="text-sm">
              <span className="text-muted-foreground">Anotação:</span>
              <p className="mt-1 text-foreground">{despesa.anotacao}</p>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(despesa)}
            className="flex items-center gap-1 border-border text-foreground hover:bg-muted/50 hover:text-primary hover:border-primary/50"
          >
            <Edit className="h-4 w-4" />
            Editar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDuplicate(despesa)}
            className="flex items-center gap-1 border-border text-foreground hover:bg-muted/50 hover:text-primary hover:border-primary/50"
          >
            <Copy className="h-4 w-4" />
            Duplicar
          </Button>
          
          <Button
            size="sm"
            onClick={() => onTogglePaga(despesa.id, !despesa.paga)}
            className={`flex items-center gap-1 ${
              despesa.paga 
                ? 'bg-muted text-foreground hover:bg-muted/80' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {despesa.paga ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
            {despesa.paga ? 'Marcar Pendente' : 'Marcar Paga'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(despesa.id)}
            className="flex items-center gap-1 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-700/50 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300"
          >
            <Trash2 className="h-4 w-4" />
            Excluir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
