import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, CreditCard, Target } from 'lucide-react';
import { DiagnosticoFinanceiro } from '@/hooks/useKemaFinanceAI';

interface DiagnosticoCardProps {
  diagnostico: DiagnosticoFinanceiro;
}

export function DiagnosticoCard({ diagnostico }: DiagnosticoCardProps) {
  const getScoreColor = () => {
    if (diagnostico.scoreFinanceiro <= 39) return 'text-red-500';
    if (diagnostico.scoreFinanceiro <= 69) return 'text-amber-500';
    return 'text-green-500';
  };

  const getScoreGradient = () => {
    if (diagnostico.scoreFinanceiro <= 39) return 'from-red-500 to-red-600';
    if (diagnostico.scoreFinanceiro <= 69) return 'from-amber-500 to-amber-600';
    return 'from-green-500 to-green-600';
  };

  const getBadgeVariant = () => {
    if (diagnostico.classificacao === 'critica') return 'destructive';
    if (diagnostico.classificacao === 'atencao') return 'secondary';
    return 'default';
  };

  return (
    <Card className="card-tech border-primary/30">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">
            Diagnóstico Financeiro
          </CardTitle>
          <Badge variant={getBadgeVariant()} className="text-sm">
            {diagnostico.classificacaoEmoji} {diagnostico.classificacaoLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Circle */}
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-muted/30"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - diagnostico.scoreFinanceiro / 100)}`}
                strokeLinecap="round"
                className={`${getScoreColor()} transition-all duration-1000`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${getScoreColor()}`}>
                {diagnostico.scoreFinanceiro}
              </span>
              <span className="text-xs text-muted-foreground">de 100</span>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-green-900/20 rounded-lg border border-green-700/30">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-xs text-muted-foreground">Receita</span>
            </div>
            <p className="text-lg font-bold text-green-400">
              R$ {diagnostico.receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="p-3 bg-red-900/20 rounded-lg border border-red-700/30">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-red-400" />
              <span className="text-xs text-muted-foreground">Despesas</span>
            </div>
            <p className="text-lg font-bold text-red-400">
              R$ {diagnostico.despesaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className={`p-3 rounded-lg border ${
            diagnostico.saldoReal >= 0 
              ? 'bg-blue-900/20 border-blue-700/30' 
              : 'bg-red-900/20 border-red-700/30'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-4 h-4" style={{ color: diagnostico.saldoReal >= 0 ? '#60a5fa' : '#f87171' }} />
              <span className="text-xs text-muted-foreground">Saldo</span>
            </div>
            <p className={`text-lg font-bold ${diagnostico.saldoReal >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
              R$ {diagnostico.saldoReal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="p-3 bg-purple-900/20 rounded-lg border border-purple-700/30">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-muted-foreground">Dívidas</span>
            </div>
            <p className="text-lg font-bold text-purple-400">
              R$ {diagnostico.totalDividas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Commitment Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Renda Comprometida</span>
            <span className={`font-medium ${
              diagnostico.percentualComprometido > 80 ? 'text-red-400' :
              diagnostico.percentualComprometido > 60 ? 'text-amber-400' : 'text-green-400'
            }`}>
              {diagnostico.percentualComprometido.toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={Math.min(diagnostico.percentualComprometido, 100)} 
            className="h-2"
          />
        </div>

        {/* Economy Potential */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pode economizar</p>
              <p className="font-bold text-primary">
                R$ {diagnostico.capacidadeEconomia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Meta reserva</p>
              <p className="font-bold text-accent">
                R$ {diagnostico.metaReservaEmergencia.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
