
import React, { useState } from 'react';
import { Globe, Edit, Trash2, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

interface Site {
  id: string;
  clienteId: string;
  clienteNome: string;
  dataInicio: string;
  tipoPlano: 'assinatura-70' | 'assinatura-85' | 'venda-1400';
  status: 'Ativo' | 'Suspenso' | 'Cancelado';
  dataVencimento: string;
  valorMensal: number;
  descricaoProjeto: string;
  urlSite?: string;
  observacoes?: string;
  hospedagem: boolean;
  instalacao: boolean;
  createdAt: string;
}

interface SiteCardProps {
  site: Site;
  onEdit: (site: Site) => void;
  onDelete: (id: string) => void;
}

const getTipoPlanoLabel = (tipo: string) => {
  const tipos: Record<string, string> = {
    'assinatura-70': 'Assinatura R$70/mês',
    'assinatura-85': 'Assinatura R$85/mês',
    'venda-1400': 'Venda R$1.400'
  };
  return tipos[tipo] || tipo;
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'Ativo': 'bg-green-100 text-green-800',
    'Suspenso': 'bg-yellow-100 text-yellow-800',
    'Cancelado': 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getServicosAdicionais = (site: Site) => {
  const servicos = [];
  if (site.hospedagem) servicos.push('Hospedagem');
  if (site.instalacao) servicos.push('Instalação');
  return servicos.join(', ');
};

export const SiteCard: React.FC<SiteCardProps> = ({ site, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
      {/* Card Header - Always Visible */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{site.clienteNome}</h3>
            <p className="text-sm text-muted-foreground truncate">{site.descricaoProjeto}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${getStatusColor(site.status)}`}>
            {site.status}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-foreground">R$ {site.valorMensal.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{getTipoPlanoLabel(site.tipoPlano)}</p>
            {getServicosAdicionais(site) && (
              <p className="text-xs text-blue-600 mt-1">{getServicosAdicionais(site)}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(site)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(site.id)}
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
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Data Início:</span>
                <p className="font-medium">{new Date(site.dataInicio).toLocaleDateString('pt-BR')}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Vencimento:</span>
                <p className="font-medium">{new Date(site.dataVencimento).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
            
            {site.urlSite && (
              <div>
                <span className="text-muted-foreground text-sm">URL do Site:</span>
                <a
                  href={site.urlSite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm mt-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  {site.urlSite}
                </a>
              </div>
            )}
            
            {site.observacoes && (
              <div>
                <span className="text-muted-foreground text-sm">Observações:</span>
                <p className="text-sm mt-1">{site.observacoes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
