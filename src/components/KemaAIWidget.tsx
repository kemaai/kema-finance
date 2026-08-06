import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowRight, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { useKemaFinanceAI } from '../hooks/useKemaFinanceAI';
import { Progress } from './ui/progress';

export const KemaAIWidget = () => {
  const navigate = useNavigate();
  const { diagnostico, alertas } = useKemaFinanceAI();

  const getScoreColor = () => {
    if (diagnostico.scoreFinanceiro <= 39) return 'text-red-500';
    if (diagnostico.scoreFinanceiro <= 69) return 'text-amber-500';
    return 'text-green-500';
  };

  const scoreHex =
    diagnostico.scoreFinanceiro <= 39 ? '#EF4444' : diagnostico.scoreFinanceiro <= 69 ? '#F59E0B' : '#0E9F6E';

  const alertaPrincipal = alertas.find(a => a.tipo === 'critico') || alertas.find(a => a.tipo === 'atencao') || alertas[0];

  const getAlertBg = (tipo: string) => {
    switch (tipo) {
      case 'critico': return 'bg-red-500/10 border-red-500/20';
      case 'atencao': return 'bg-amber-500/10 border-amber-500/20';
      default: return 'bg-green-500/10 border-green-500/20';
    }
  };

  const getAlertIcon = (tipo: string) => {
    switch (tipo) {
      case 'critico': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'atencao': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default: return <TrendingUp className="w-4 h-4 text-green-500" />;
    }
  };

  return (
    <div 
      onClick={() => navigate('/agente')}
      className="card-tech p-4 md:p-5 cursor-pointer group transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="icon-tile w-9 h-9 grad-violet">
            <Brain className="w-[18px] h-[18px]" strokeWidth={2.2} />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-foreground">KemaFinance AI</h3>
            <p className="text-xs text-muted-foreground hidden sm:block">Score de saúde financeira</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
          <span className="text-xs hidden sm:inline">Ver análise</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div
          className="relative w-[92px] h-[92px] rounded-full flex-shrink-0"
          style={{
            background: `conic-gradient(${scoreHex} ${diagnostico.scoreFinanceiro * 3.6}deg, hsl(var(--muted)) 0deg)`,
          }}
          aria-label={`Score financeiro ${diagnostico.scoreFinanceiro} de 100`}
        >
          <div className="absolute inset-[9px] rounded-full bg-card flex flex-col items-center justify-center">
            <span className={`num text-2xl font-bold ${getScoreColor()}`}>{diagnostico.scoreFinanceiro}</span>
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground">de 100</span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">{diagnostico.classificacaoEmoji}</span>
            <span className={`text-sm font-semibold ${getScoreColor()}`}>{diagnostico.classificacaoLabel}</span>
          </div>
          <Progress value={diagnostico.scoreFinanceiro} className="h-1.5 bg-muted" />
          <span className="text-xs">
            {diagnostico.saldoReal >= 0 ? (
              <span className="flex items-center gap-1 text-green-500">
                <TrendingUp className="w-3 h-3" />+R$ {diagnostico.saldoReal.toFixed(0)}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-500">
                <TrendingDown className="w-3 h-3" />-R$ {Math.abs(diagnostico.saldoReal).toFixed(0)}
              </span>
            )}
          </span>
        </div>
      </div>

      {alertaPrincipal && (
        <div className={`p-3 rounded-lg border ${getAlertBg(alertaPrincipal.tipo)}`}>
          <div className="flex items-start gap-2">
            {getAlertIcon(alertaPrincipal.tipo)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{alertaPrincipal.titulo}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{alertaPrincipal.mensagem}</p>
            </div>
          </div>
        </div>
      )}

      <div className="hidden sm:grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-border">
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground">Receita</p>
          <p className="text-sm font-semibold text-green-500">R$ {diagnostico.receitaTotal.toFixed(0)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground">Despesas</p>
          <p className="text-sm font-semibold text-red-500">R$ {diagnostico.despesaTotal.toFixed(0)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground">Dívidas</p>
          <p className="text-sm font-semibold text-amber-500">R$ {diagnostico.totalDividas.toFixed(0)}</p>
        </div>
      </div>
    </div>
  );
};
