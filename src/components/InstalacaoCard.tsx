import React, { useState } from 'react';
import { Scissors, Edit, Trash2, ChevronDown, ChevronUp, Calendar, DollarSign, MapPin, Paperclip } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { StatusBadge, getStatusMeta } from '@/components/ui/status-badge';
import { parseLocalDate, cn } from '@/lib/utils';
import { AnexosUpload } from '@/components/AnexosUpload';
import { useInstalacaoAnexos } from '@/hooks/useInstalacaoAnexos';
import { useM2Price } from '@/hooks/useM2Price';

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
  valor_m2?: number | null;
  created_at: string;
  updated_at: string;
}

interface InstalacaoCardProps {
  instalacao: Instalacao;
  onEdit: (instalacao: Instalacao) => void;
  onDelete: (id: string) => void;
  onTogglePedidoRecebido: (id: string, recebido: boolean) => void;
}

export const InstalacaoCard: React.FC<InstalacaoCardProps> = ({ instalacao, onEdit, onDelete, onTogglePedidoRecebido }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { price: globalM2Price } = useM2Price();
  const m2Price = instalacao.valor_m2 && Number(instalacao.valor_m2) > 0 ? Number(instalacao.valor_m2) : globalM2Price;
  const statusMeta = getStatusMeta(instalacao.status);
  const { anexos } = useInstalacaoAnexos(isExpanded ? instalacao.id : null);

  return (
    <div
      className={cn(
        "card-tech rounded-xl overflow-hidden border border-l-4 transition-all duration-300",
        instalacao.pedido_recebido
          ? "border-emerald-500/60 border-l-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 ring-2 ring-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:ring-emerald-500/60 hover:border-emerald-400"
          : "border-border border-l-orange-500 hover:border-primary/50 hover:border-l-orange-400"
      )}
    >
      {/* Card Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">#{instalacao.numero_pedido}</h3>
            <p className="text-sm text-muted-foreground truncate">{instalacao.arquiteto_nome}</p>
          </div>
          <StatusBadge tone={statusMeta.tone} icon={statusMeta.icon} className="ml-2">
            {instalacao.status}
          </StatusBadge>
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
                <p className="font-medium text-foreground">{(instalacao.valor_total / m2Price).toFixed(1)} m²</p>
              </div>
              <div>
                <span className="text-muted-foreground">Valor por m²:</span>
                <p className="font-medium text-foreground">R$ {m2Price.toFixed(2)}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-border/60">
              <div className="flex items-center gap-2 mb-2">
                <Paperclip className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  Anexos {anexos.length > 0 && `(${anexos.length})`}
                </span>
              </div>
              <AnexosUpload instalacaoId={instalacao.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
