import React from 'react';
import { Shield, TrendingUp, Calendar, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { DiagnosticoFinanceiro } from '@/hooks/useKemaFinanceAI';
import { MetaFinanceira } from '@/hooks/useMetasFinanceiras';

interface MetaReservaCardProps {
  diagnostico: DiagnosticoFinanceiro;
  metaReserva?: MetaFinanceira | null;
}

export function MetaReservaCard({ diagnostico, metaReserva }: MetaReservaCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const metaValor = metaReserva?.valor_meta || diagnostico.metaReservaEmergencia;
  const valorAtual = metaReserva?.valor_atual || 0;
  const progresso = metaValor > 0 ? (valorAtual / metaValor) * 100 : 0;
  const prazoMeses = metaReserva?.prazo_meses || diagnostico.prazoReserva;
  const valorMensal = metaReserva?.valor_mensal_sugerido || diagnostico.capacidadeEconomia;

  const getProgressColor = () => {
    if (progresso >= 100) return 'from-emerald-500 to-green-400';
    if (progresso >= 50) return 'from-amber-500 to-yellow-400';
    return 'from-orange-500 to-red-400';
  };

  const getMesesRestantes = () => {
    if (valorMensal <= 0) return 'Sem capacidade atual';
    const restante = metaValor - valorAtual;
    if (restante <= 0) return 'Meta atingida!';
    const meses = Math.ceil(restante / valorMensal);
    return `${meses} meses restantes`;
  };

  return (
    <div className="card-tech p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-2xl" />
      
      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Reserva de Emergência</h3>
            <p className="text-sm text-muted-foreground">6 meses de despesas</p>
          </div>
        </div>

        {/* Progress Ring / Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-2xl md:text-3xl font-bold text-foreground">
                {formatCurrency(valorAtual)}
              </p>
              <p className="text-sm text-muted-foreground">acumulado</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-emerald-500">
                {progresso.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">do objetivo</p>
            </div>
          </div>

          <div className="relative h-4 bg-muted rounded-full overflow-hidden">
            <div
              className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getProgressColor()} rounded-full transition-all duration-500`}
              style={{ width: `${Math.min(progresso, 100)}%` }}
            />
          </div>

          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>R$ 0</span>
            <span>Meta: {formatCurrency(metaValor)}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-muted/30 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Contribuição Mensal</span>
            </div>
            <p className="text-lg font-semibold text-foreground">
              {formatCurrency(valorMensal)}
            </p>
            <p className="text-xs text-muted-foreground">sugerido</p>
          </div>

          <div className="p-4 bg-muted/30 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Prazo Estimado</span>
            </div>
            <p className="text-lg font-semibold text-foreground">
              {prazoMeses > 0 ? `${prazoMeses} meses` : '-'}
            </p>
            <p className="text-xs text-muted-foreground">{getMesesRestantes()}</p>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-emerald-500 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">
                Por que 6 meses?
              </h4>
              <p className="text-xs text-muted-foreground">
                Uma reserva de 6 meses cobre imprevistos como perda de renda, 
                despesas médicas ou reparos urgentes, dando tempo para se reorganizar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
