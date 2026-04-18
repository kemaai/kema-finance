import React from 'react';
import { Edit, Trash2, Calendar, DollarSign, User, Briefcase, Repeat } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { parseLocalDate } from '@/lib/utils';
import type { Servico } from './ServicoForm';

interface ServicoCardProps {
  servico: Servico;
  onEdit: (s: Servico) => void;
  onDelete: (id: string) => void;
}

const statusStyles: Record<string, string> = {
  'Pago': 'bg-green-900/50 text-green-400 border border-green-700/50',
  'Pendente': 'bg-amber-900/50 text-amber-400 border border-amber-700/50',
};

export const ServicoCard: React.FC<ServicoCardProps> = ({ servico, onEdit, onDelete }) => {
  return (
    <Card className="card-tech border-border hover:border-primary/50 transition-all duration-300">
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base sm:text-lg text-foreground mb-1 truncate flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="truncate">{servico.nome_servico}</span>
              </h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                <User className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{servico.cliente_nome}</span>
              </p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={() => onEdit(servico)}
                className="p-1.5 sm:p-2 text-primary hover:bg-primary/20 rounded-lg transition-colors"
                title="Editar"
              >
                <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={() => onDelete(servico.id)}
                className="p-1.5 sm:p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                title="Excluir"
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Valor:</span>
              <div className="flex items-center gap-1 text-primary">
                <DollarSign className="w-3 h-3" />
                <span className="font-medium">R$ {Number(servico.valor).toFixed(2)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Data:</span>
              <div className="flex items-center gap-1 text-foreground">
                <Calendar className="w-3 h-3" />
                <span>{parseLocalDate(servico.data_servico).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center gap-2 flex-wrap">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[servico.status] || 'bg-muted text-muted-foreground'}`}>
              {servico.status}
            </span>
            {servico.recorrente && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-900/40 text-blue-400 border border-blue-700/50 flex items-center gap-1">
                <Repeat className="w-3 h-3" />
                Recorrente
              </span>
            )}
          </div>

          {servico.descricao && (
            <div className="pt-3 border-t border-border">
              <p className="text-sm text-muted-foreground line-clamp-3">
                <strong className="text-foreground">Descrição:</strong> {servico.descricao}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
