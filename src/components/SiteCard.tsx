import React from 'react';
import { Edit, Trash2, Globe, Calendar, DollarSign, Copy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { parseLocalDate } from '@/lib/utils';

interface Site {
  id: string;
  cliente_id: string;
  cliente_nome: string;
  data_inicio: string;
  tipo_plano: 'assinatura-70' | 'assinatura-85' | 'venda-1400';
  status: 'Ativo' | 'Suspenso' | 'Cancelado';
  data_vencimento: string;
  valor_mensal: number;
  descricao_projeto: string;
  url_site?: string;
  observacoes?: string;
  hospedagem: boolean;
  instalacao: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface SiteCardProps {
  site: Site;
  onEdit: (site: Site) => void;
  onDelete: (id: string) => void;
  onDuplicate: (site: Site) => void;
}

const getTipoPlanoLabel = (tipo: string) => {
  const tipos: Record<string, string> = {
    'assinatura-70': 'Assinatura R$70/mês',
    'assinatura-85': 'Assinatura R$85/mês',
    'venda-1400': 'Venda R$1.400'
  };
  return tipos[tipo] || tipo;
};


const getServicosAdicionais = (site: Site) => {
  const servicos = [];
  if (site.hospedagem) servicos.push('Hospedagem');
  if (site.instalacao) servicos.push('Instalação');
  return servicos.join(', ');
};

export const SiteCard: React.FC<SiteCardProps> = ({ site, onEdit, onDelete, onDuplicate }) => {
  return (
    <Card className="card-tech border-border border-l-4 border-l-cyan-500 hover:border-primary/50 hover:border-l-cyan-400 transition-all duration-300">
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col gap-3">
          {/* Header com título e ações */}
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base sm:text-lg text-foreground mb-1 truncate">{site.cliente_nome}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{site.descricao_projeto}</p>
              {site.url_site && (
                <a
                  href={site.url_site}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 text-sm flex items-center gap-1 mt-1 truncate"
                >
                  <Globe className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{site.url_site}</span>
                </a>
              )}
            </div>
            
            {/* Botões de ação */}
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={() => onDuplicate(site)}
                className="p-1.5 sm:p-2 text-green-400 hover:bg-green-900/30 rounded-lg transition-colors"
                title="Duplicar para próximo mês"
              >
                <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={() => onEdit(site)}
                className="p-1.5 sm:p-2 text-primary hover:bg-primary/20 rounded-lg transition-colors"
                title="Editar"
              >
                <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={() => onDelete(site.id)}
                className="p-1.5 sm:p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                title="Excluir"
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {/* Informações do site */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Plano:</span>
              <span className="font-medium text-foreground text-right truncate ml-2">{getTipoPlanoLabel(site.tipo_plano)}</span>
            </div>
            
            {getServicosAdicionais(site) && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Serviços:</span>
                <span className="font-medium text-foreground text-right truncate ml-2">{getServicosAdicionais(site)}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Valor:</span>
              <div className="flex items-center gap-1 flex-shrink-0 text-primary">
                <DollarSign className="w-3 h-3" />
                <span className="font-medium">R$ {site.valor_mensal.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Vencimento:</span>
              <div className="flex items-center gap-1 flex-shrink-0 text-foreground">
                <Calendar className="w-3 h-3" />
                <span>{parseLocalDate(site.data_vencimento).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex justify-between items-center">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(site.status)}`}>
              {site.status}
            </span>
          </div>

          {/* Observações */}
          {site.observacoes && (
            <div className="pt-3 border-t border-border">
              <p className="text-sm text-muted-foreground line-clamp-2">
                <strong className="text-foreground">Obs:</strong> {site.observacoes}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
