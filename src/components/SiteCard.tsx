
import React from 'react';
import { Edit, Trash2, Globe, Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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
  return (
    <Card className="bg-white border border-border hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-foreground mb-1">{site.cliente_nome}</h3>
            <p className="text-sm text-muted-foreground">{site.descricao_projeto}</p>
            {site.url_site && (
              <a
                href={site.url_site}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 mt-1"
              >
                <Globe className="w-3 h-3" />
                {site.url_site}
              </a>
            )}
          </div>
          <div className="flex gap-1">
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
          </div>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Plano:</span>
            <span className="font-medium">{getTipoPlanoLabel(site.tipo_plano)}</span>
          </div>
          
          {getServicosAdicionais(site) && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Serviços:</span>
              <span className="font-medium">{getServicosAdicionais(site)}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Valor:</span>
            <div className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              <span className="font-medium">R$ {site.valor_mensal.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Vencimento:</span>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(site.data_vencimento).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(site.status)}`}>
            {site.status}
          </span>
        </div>

        {site.observacoes && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-sm text-muted-foreground line-clamp-2">
              <strong>Obs:</strong> {site.observacoes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
