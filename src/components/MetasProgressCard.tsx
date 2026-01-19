import React, { useState } from 'react';
import { Target, TrendingUp, CreditCard, PiggyBank, Trash2, Edit2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { MetaFinanceira, useMetasFinanceiras } from '@/hooks/useMetasFinanceiras';
import { EditarMetaModal } from './EditarMetaModal';

interface MetasProgressCardProps {
  metas: MetaFinanceira[];
  onDeleteMeta?: (id: string) => void;
}

export function MetasProgressCard({ metas, onDeleteMeta }: MetasProgressCardProps) {
  const { deleteMeta } = useMetasFinanceiras();
  const [editingMeta, setEditingMeta] = useState<MetaFinanceira | null>(null);

  const getMetaIcon = (tipo: string) => {
    switch (tipo) {
      case 'reserva_emergencia':
        return <PiggyBank className="w-5 h-5" />;
      case 'quitar_divida':
        return <CreditCard className="w-5 h-5" />;
      case 'economia_mensal':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <Target className="w-5 h-5" />;
    }
  };

  const getMetaColor = (tipo: string) => {
    switch (tipo) {
      case 'reserva_emergencia':
        return 'text-emerald-500';
      case 'quitar_divida':
        return 'text-red-500';
      case 'economia_mensal':
        return 'text-blue-500';
      default:
        return 'text-primary';
    }
  };

  const getProgressColor = (progresso: number) => {
    if (progresso >= 75) return 'bg-emerald-500';
    if (progresso >= 50) return 'bg-amber-500';
    if (progresso >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleDelete = (id: string) => {
    if (onDeleteMeta) {
      onDeleteMeta(id);
    } else {
      deleteMeta.mutate(id);
    }
  };

  if (metas.length === 0) {
    return (
      <div className="card-tech p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Suas Metas</h3>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nenhuma meta definida ainda.</p>
          <p className="text-sm">Clique em "Gerar Metas" para criar um plano personalizado.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card-tech p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Suas Metas</h3>
            <p className="text-sm text-muted-foreground">{metas.length} meta(s) ativa(s)</p>
          </div>
        </div>

        <div className="space-y-4">
          {metas.filter(m => m.tipo_meta !== 'distribuicao').map((meta) => (
            <div
              key={meta.id}
              className="p-4 bg-muted/30 rounded-xl border border-border hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`${getMetaColor(meta.tipo_meta)}`}>
                    {getMetaIcon(meta.tipo_meta)}
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{meta.nome}</h4>
                    {meta.descricao && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{meta.descricao}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    meta.prioridade === 1 ? 'bg-red-500/20 text-red-400' :
                    meta.prioridade === 2 ? 'bg-amber-500/20 text-amber-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {meta.prioridade === 1 ? 'Alta' : meta.prioridade === 2 ? 'Média' : 'Baixa'}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-primary"
                    onClick={() => setEditingMeta(meta)}
                    title="Atualizar progresso"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(meta.id)}
                    title="Excluir meta"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Clickable progress area */}
              <div 
                className="space-y-2 cursor-pointer hover:bg-muted/50 -mx-2 px-2 py-2 rounded-lg transition-colors"
                onClick={() => setEditingMeta(meta)}
                title="Clique para atualizar o progresso"
              >
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="font-medium text-foreground">{meta.progresso.toFixed(0)}%</span>
                </div>
                <div className="relative">
                  <Progress value={meta.progresso} className="h-2" />
                  <div
                    className={`absolute inset-0 h-2 rounded-full ${getProgressColor(meta.progresso)}`}
                    style={{ width: `${Math.min(meta.progresso, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatCurrency(meta.valor_atual)}</span>
                  <span>{formatCurrency(meta.valor_meta)}</span>
                </div>
              </div>

              {meta.valor_mensal_sugerido > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Valor mensal sugerido:</span>
                    <span className="font-medium text-primary">
                      {formatCurrency(meta.valor_mensal_sugerido)}
                    </span>
                  </div>
                  {meta.prazo_meses && (
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Prazo estimado:</span>
                      <span>{meta.prazo_meses} meses</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editingMeta && (
        <EditarMetaModal
          meta={editingMeta}
          open={!!editingMeta}
          onOpenChange={(open) => !open && setEditingMeta(null)}
        />
      )}
    </>
  );
}
