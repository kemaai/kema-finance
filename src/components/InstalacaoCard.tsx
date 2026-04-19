import React, { useState } from 'react';
import { Scissors, Edit, Trash2, ChevronDown, ChevronUp, Calendar, DollarSign, MapPin } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { parseLocalDate } from '@/lib/utils';

interface Instalacao {
  id: string;
  user_id: string;
  numero_pedido: string;
  endereco: string;
  ambiente: string;
  arquiteto_nome: string;
  data_instalacao: string;
  valor_total: number;
  status: string;
  pedido_recebido: boolean;
  created_at: string;
  updated_at: string;
}

interface InstalacaoCardProps {
  instalacao: Instalacao;
  onEdit: (instalacao: Instalacao) => void;
  onDelete: (id: string) => void;
  onTogglePedidoRecebido: (id: string, recebido: boolean) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Agendado': return 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/50 dark:text-blue-400 dark:border-blue-700/50';
    case 'Em Andamento': return 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/50 dark:text-amber-400 dark:border-amber-700/50';
    case 'Concluído': return 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/50 dark:text-green-400 dark:border-green-700/50';
    case 'Cancelado': return 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/50 dark:text-red-400 dark:border-red-700/50';
    default: return 'bg-muted text-muted-foreground';
  }
};

export const InstalacaoCard: React.FC<InstalacaoCardProps> = ({ instalacao, onEdit, onDelete, onTogglePedidoRecebido }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="card-tech rounded-xl overflow-hidden border border-border border-l-4 border-l-orange-500 hover:border-primary/50 hover:border-l-orange-400 transition-all duration-300">
      {/* Card Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">#{instalacao.numero_pedido}</h3>
            <p className="text-sm text-muted-foreground truncate">{instalacao.arquiteto_nome}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${getStatusColor(instalacao.status)}`}>
            {instalacao.status}
          </span>
        </div>
        
        <div className={`flex items-center gap-2 mb-3 p-2 rounded-lg transition-colors border ${
          instalacao.pedido_recebido 
            ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700/50' 
            : 'bg-muted/30 border-border'
        }`}>
          <Checkbox 
            id={`pedido-${instalacao.id}`}
            checked={instalacao.pedido_recebido}
            onCheckedChange={(checked) => onTogglePedidoRecebido(instalacao.id, checked as boolean)}
            className="border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          <label 
            htmlFor={`pedido-${instalacao.id}`}
            className={`text-sm font-medium cursor-pointer select-none ${
              instalacao.pedido_recebido ? 'text-green-700 dark:text-green-400' : 'text-foreground'
            }`}
          >
            Pedido Recebido
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Calendar className="w-3 h-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{parseLocalDate(instalacao.data_instalacao).toLocaleDateString('pt-BR')}</p>
            </div>
            <div className="flex items-center gap-1 mb-1">
              <MapPin className="w-3 h-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground truncate">{instalacao.endereco}</p>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-primary" />
              <p className="text-sm font-bold text-primary">R$ {instalacao.valor_total.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-2">
            <button
              onClick={() => onEdit(instalacao)}
              className="p-2 text-primary hover:bg-primary/20 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(instalacao.id)}
              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-muted-foreground hover:bg-muted/50 rounded-lg transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-border bg-muted/20">
          <div className="pt-3 space-y-3">
            <div>
              <span className="text-muted-foreground text-sm">Ambiente:</span>
              <p className="text-sm mt-1 font-medium text-foreground">{instalacao.ambiente}</p>
            </div>
            
            <div>
              <span className="text-muted-foreground text-sm">Endereço Completo:</span>
              <p className="text-sm mt-1 font-medium text-foreground">{instalacao.endereco}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Metragem Estimada:</span>
                <p className="font-medium text-foreground">{(instalacao.valor_total / 24).toFixed(1)} m²</p>
              </div>
              <div>
                <span className="text-muted-foreground">Valor por m²:</span>
                <p className="font-medium text-foreground">R$ 24,00</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
