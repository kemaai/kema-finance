
import React, { useState } from 'react';
import { Scissors, Edit, Trash2, ChevronDown, ChevronUp, Calendar, DollarSign, MapPin } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

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
    case 'Agendado': return 'bg-blue-100 text-blue-800';
    case 'Em Andamento': return 'bg-orange-100 text-orange-800';
    case 'Concluído': return 'bg-green-100 text-green-800';
    case 'Cancelado': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const InstalacaoCard: React.FC<InstalacaoCardProps> = ({ instalacao, onEdit, onDelete, onTogglePedidoRecebido }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
      {/* Card Header - Always Visible */}
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
        
        <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded-lg">
          <Checkbox 
            id={`pedido-${instalacao.id}`}
            checked={instalacao.pedido_recebido}
            onCheckedChange={(checked) => onTogglePedidoRecebido(instalacao.id, checked as boolean)}
          />
          <label 
            htmlFor={`pedido-${instalacao.id}`}
            className="text-sm font-medium cursor-pointer select-none"
          >
            Pedido Recebido
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Calendar className="w-3 h-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{new Date(instalacao.data_instalacao).toLocaleDateString('pt-BR')}</p>
            </div>
            <div className="flex items-center gap-1 mb-1">
              <MapPin className="w-3 h-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground truncate">{instalacao.endereco}</p>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-muted-foreground" />
              <p className="text-sm font-bold text-foreground">R$ {instalacao.valor_total.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-2">
            <button
              onClick={() => onEdit(instalacao)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(instalacao.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-border bg-gray-50">
          <div className="pt-3 space-y-3">
            <div>
              <span className="text-muted-foreground text-sm">Ambiente:</span>
              <p className="text-sm mt-1 font-medium">{instalacao.ambiente}</p>
            </div>
            
            <div>
              <span className="text-muted-foreground text-sm">Endereço Completo:</span>
              <p className="text-sm mt-1 font-medium">{instalacao.endereco}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Metragem Estimada:</span>
                <p className="font-medium">{(instalacao.valor_total / 20).toFixed(1)} m²</p>
              </div>
              <div>
                <span className="text-muted-foreground">Valor por m²:</span>
                <p className="font-medium">R$ 20,00</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
