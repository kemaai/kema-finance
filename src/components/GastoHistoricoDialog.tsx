import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { History, PlusCircle, PencilLine, Trash2, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/ui/status-badge';
import { useGastosDiariosHistorico } from '@/hooks/useSupabaseData';

interface GastoHistoricoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** Quando informado, mostra apenas o histórico deste lançamento. */
  gastoId?: string;
  titulo?: string;
}

const ACAO_META: Record<string, { label: string; tone: 'success' | 'info' | 'danger'; Icon: typeof PlusCircle }> = {
  criado: { label: 'Criado', tone: 'success', Icon: PlusCircle },
  editado: { label: 'Editado', tone: 'info', Icon: PencilLine },
  excluido: { label: 'Excluído', tone: 'danger', Icon: Trash2 },
};

const formatarValor = (campo: string, valor: string) => {
  if (campo === 'Valor') {
    const n = Number(valor);
    return Number.isFinite(n)
      ? n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      : valor;
  }
  if (campo === 'Data') {
    const [y, m, d] = valor.split('-');
    return y && m && d ? `${d}/${m}/${y}` : valor;
  }
  return valor || '—';
};

export const GastoHistoricoDialog: React.FC<GastoHistoricoDialogProps> = ({
  isOpen,
  onClose,
  gastoId,
  titulo,
}) => {
  const { data: historico = [], isLoading } = useGastosDiariosHistorico(gastoId);

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[520px] max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Histórico de alterações
          </DialogTitle>
          <DialogDescription className="truncate">
            {titulo ? `Lançamento: ${titulo}` : 'Todas as mudanças nos seus gastos diários'}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Carregando...</p>
        ) : historico.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            Nenhuma alteração registrada ainda.
          </p>
        ) : (
          <ol className="space-y-3">
            {historico.map((item) => {
              const meta = ACAO_META[item.acao] ?? ACAO_META.editado;
              const { Icon } = meta;
              return (
                <li key={item.id} className="rounded-xl border border-border p-3 space-y-2 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                      <span className="font-medium text-sm truncate">{item.descricao || 'Gasto'}</span>
                    </div>
                    <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
                  </div>

                  <p className="text-[11px] text-muted-foreground">
                    {format(new Date(item.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>

                  {item.alteracoes?.length > 0 && (
                    <ul className="space-y-1">
                      {item.alteracoes.map((alt, i) => (
                        <li key={`${item.id}-${i}`} className="text-xs text-muted-foreground flex flex-wrap items-center gap-1">
                          <span className="font-medium text-foreground">{alt.campo}:</span>
                          <span className="line-through break-all">{formatarValor(alt.campo, alt.de)}</span>
                          <ArrowRight className="w-3 h-3 flex-shrink-0" />
                          <span className="text-foreground break-all">{formatarValor(alt.campo, alt.para)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </DialogContent>
    </Dialog>
  );
};
