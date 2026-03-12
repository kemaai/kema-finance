import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowRight, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { useKemaFinanceAI } from '../hooks/useKemaFinanceAI';
import { Progress } from './ui/progress';

export const KemaAIWidget = () => {
  const navigate = useNavigate();
  const { diagnostico, alertas } = useKemaFinanceAI();

  const getScoreColor = () => {
    if (diagnostico.scoreFinanceiro <= 39) return 'text-red-600 dark:text-red-400';
    if (diagnostico.scoreFinanceiro <= 69) return 'text-amber-600 dark:text-amber-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getScoreGradient = () => {
    if (diagnostico.scoreFinanceiro <= 39) return 'from-red-500 to-red-600';
    if (diagnostico.scoreFinanceiro <= 69) return 'from-amber-500 to-amber-600';
    return 'from-green-500 to-green-600';
  };

  const getProgressColor = () => {
    if (diagnostico.scoreFinanceiro <= 39) return 'bg-red-500';
    if (diagnostico.scoreFinanceiro <= 69) return 'bg-amber-500';
    return 'bg-green-500';
  };

  const alertaPrincipal = alertas.find(a => a.tipo === 'critico') || alertas.find(a => a.tipo === 'atencao') || alertas[0];

  const getAlertIcon = (tipo: string) => {
    switch (tipo) {
      case 'critico':
        return <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />;
      case 'atencao':
        return <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      default:
        return <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />;
    }
  };

  const getAlertBg = (tipo: string) => {
    switch (tipo) {
      case 'critico':
        return 'bg-red-100 border-red-200 dark:bg-red-900/30 dark:border-red-700/40';
      case 'atencao':
        return 'bg-amber-100 border-amber-200 dark:bg-amber-900/30 dark:border-amber-700/40';
      default:
        return 'bg-green-100 border-green-200 dark:bg-green-900/30 dark:border-green-700/40';
    }
  };

  return (
    <div 
      onClick={() => navigate('/agente')}
      className="card-tech p-4 md:p-6 hover:border-primary/50 transition-all duration-300 cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 bg-gradient-to-br ${getScoreGradient()} rounded-xl flex items-center justify-center shadow-lg`}>
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">KemaFinance AI</h3>
            <p className="text-sm text-muted-foreground hidden sm:block">Análise financeira inteligente</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
          <span className="text-sm hidden sm:inline">Ver análise</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Score e Status - Responsivo */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Score</span>
            <span className={`text-2xl font-bold ${getScoreColor()}`}>
              {diagnostico.scoreFinanceiro}
            </span>
          </div>
          <Progress 
            value={diagnostico.scoreFinanceiro} 
            className="h-2 bg-muted"
          />
        </div>

        {/* Status */}
        <div className="flex flex-col items-end justify-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{diagnostico.classificacaoEmoji}</span>
            <span className={`font-semibold ${getScoreColor()}`}>
              {diagnostico.classificacaoLabel}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {diagnostico.saldoReal >= 0 ? (
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <TrendingUp className="w-3 h-3" />
                +R$ {diagnostico.saldoReal.toFixed(0)}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                <TrendingDown className="w-3 h-3" />
                -R$ {Math.abs(diagnostico.saldoReal).toFixed(0)}
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Alerta Principal */}
      {alertaPrincipal && (
        <div className={`p-3 rounded-xl border ${getAlertBg(alertaPrincipal.tipo)}`}>
          <div className="flex items-start gap-2">
            {getAlertIcon(alertaPrincipal.tipo)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {alertaPrincipal.titulo}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {alertaPrincipal.mensagem}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats - Hidden on very small screens */}
      <div className="hidden sm:grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border/50">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Receita</p>
          <p className="text-sm font-semibold text-green-600 dark:text-green-400">
            R$ {diagnostico.receitaTotal.toFixed(0)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Despesas</p>
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">
            R$ {diagnostico.despesaTotal.toFixed(0)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Dívidas</p>
          <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
            R$ {diagnostico.totalDividas.toFixed(0)}
          </p>
        </div>
      </div>
    </div>
  );
};
