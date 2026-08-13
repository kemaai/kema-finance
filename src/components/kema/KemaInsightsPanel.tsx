import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Lightbulb, MessageSquare, Sparkles, TrendingUp, Info, CheckCircle2 } from 'lucide-react';
import { useKemaAgent } from '@/contexts/KemaAgentContext';
import { KemaInsight, InsightSeverity } from '@/hooks/useKemaInsights';
import { Button } from '@/components/ui/button';

const STYLE: Record<InsightSeverity, { wrap: string; chip: string; icon: React.ElementType; label: string }> = {
  critico: {
    wrap: 'border-red-500/30 bg-red-500/[0.06]',
    chip: 'bg-red-500/15 text-red-500',
    icon: AlertTriangle,
    label: 'Urgente',
  },
  atencao: {
    wrap: 'border-amber-500/30 bg-amber-500/[0.06]',
    chip: 'bg-amber-500/15 text-amber-500',
    icon: TrendingUp,
    label: 'Atenção',
  },
  oportunidade: {
    wrap: 'border-violet-500/30 bg-violet-500/[0.06]',
    chip: 'bg-violet-500/15 text-violet-500',
    icon: Lightbulb,
    label: 'Oportunidade',
  },
  info: {
    wrap: 'border-border bg-muted/30',
    chip: 'bg-muted text-muted-foreground',
    icon: Info,
    label: 'Insight',
  },
};

interface Props {
  /** Limita a quantidade exibida */
  max?: number;
  /** Usa apenas os insights da página atual (padrão) ou todos */
  scope?: 'page' | 'all';
  title?: string;
  className?: string;
}

export const KemaInsightsPanel: React.FC<Props> = ({ max = 3, scope = 'page', title, className = '' }) => {
  const navigate = useNavigate();
  const { pageInsights, insights, ask, moduloLabel } = useKemaAgent();

  const source: KemaInsight[] = scope === 'all' ? insights : pageInsights;
  const list = source.slice(0, max);

  return (
    <div className={`card-tech p-4 md:p-5 ${className}`}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="icon-tile w-9 h-9 grad-violet">
            <Sparkles className="w-[18px] h-[18px]" strokeWidth={2.2} />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-foreground">
              {title ?? 'KEMA AI recomenda'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {scope === 'all' ? 'Prioridades de toda a operação' : `Contexto: ${moduloLabel}`}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => ask()} className="text-xs">
          Falar com o KEMA
        </Button>
      </div>

      {list.length === 0 ? (
        <div className="flex items-center gap-2 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06]">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            Nada crítico por aqui. Sua operação está em dia neste módulo.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {list.map(insight => {
            const s = STYLE[insight.severidade];
            const Icon = s.icon;
            return (
              <div key={insight.id} className={`rounded-xl border p-3 ${s.wrap}`}>
                <div className="flex items-start gap-2.5">
                  <span className={`rounded-lg p-1.5 flex-shrink-0 ${s.chip}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">{insight.titulo}</p>
                      <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${s.chip}`}>
                        {s.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{insight.descricao}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs rounded-full"
                        onClick={() => navigate(insight.rota)}
                      >
                        {insight.acao}
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs rounded-full"
                        onClick={() => ask(insight.pergunta)}
                      >
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Pedir orientação
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
