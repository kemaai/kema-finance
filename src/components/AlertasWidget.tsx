import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, AlertCircle, Info, CheckCircle, ChevronRight } from 'lucide-react';
import { Alerta } from '@/hooks/useKemaFinanceAI';

interface AlertasWidgetProps {
  alertas: Alerta[];
  maxAlertas?: number;
}

export function AlertasWidget({ alertas, maxAlertas = 5 }: AlertasWidgetProps) {
  const getAlertIcon = (tipo: Alerta['tipo']) => {
    switch (tipo) {
      case 'critico':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'atencao':
        return <AlertCircle className="w-5 h-5 text-amber-400" />;
      case 'sucesso':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getAlertStyles = (tipo: Alerta['tipo']) => {
    switch (tipo) {
      case 'critico':
        return 'bg-red-900/20 border-red-700/30 hover:border-red-600/50';
      case 'atencao':
        return 'bg-amber-900/20 border-amber-700/30 hover:border-amber-600/50';
      case 'sucesso':
        return 'bg-green-900/20 border-green-700/30 hover:border-green-600/50';
      default:
        return 'bg-blue-900/20 border-blue-700/30 hover:border-blue-600/50';
    }
  };

  const displayAlertas = alertas.slice(0, maxAlertas);

  return (
    <Card className="card-tech border-primary/30">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary" />
            Alertas Inteligentes
          </CardTitle>
          {alertas.length > 0 && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
              {alertas.length} {alertas.length === 1 ? 'alerta' : 'alertas'}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {displayAlertas.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400/50" />
            <p className="text-muted-foreground">Nenhum alerta no momento</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Sua situação financeira parece estável
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayAlertas.map((alerta) => (
              <div
                key={alerta.id}
                className={`p-4 rounded-lg border transition-all duration-200 ${getAlertStyles(alerta.tipo)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getAlertIcon(alerta.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground text-sm">
                      {alerta.titulo}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {alerta.mensagem}
                    </p>
                    {alerta.impacto && (
                      <p className="text-xs text-muted-foreground/80 mt-2">
                        📊 {alerta.impacto}
                      </p>
                    )}
                    {alerta.acao && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                        <ChevronRight className="w-3 h-3" />
                        <span>{alerta.acao}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
