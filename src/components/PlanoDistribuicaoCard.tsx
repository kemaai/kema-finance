import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Wallet, TrendingDown, PiggyBank, Sparkles } from 'lucide-react';
import { PlanoDistribuicao } from '@/hooks/useMetasFinanceiras';
import { DiagnosticoFinanceiro } from '@/hooks/useKemaFinanceAI';

interface PlanoDistribuicaoCardProps {
  plano: PlanoDistribuicao | null;
  diagnostico: DiagnosticoFinanceiro;
}

export function PlanoDistribuicaoCard({ plano, diagnostico }: PlanoDistribuicaoCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Calculate distribution based on diagnostico if no plano
  const distribuicao = plano || calcularDistribuicao(diagnostico);

  const data = [
    {
      name: 'Despesas Essenciais',
      value: distribuicao.despesasEssenciaisPercent,
      amount: distribuicao.despesasEssenciais,
      color: '#3b82f6',
      icon: Wallet,
    },
    {
      name: 'Quitação de Dívidas',
      value: distribuicao.paraDividasPercent,
      amount: distribuicao.paraDividas,
      color: '#ef4444',
      icon: TrendingDown,
    },
    {
      name: 'Reserva de Emergência',
      value: distribuicao.paraReservaPercent,
      amount: distribuicao.paraReserva,
      color: '#22c55e',
      icon: PiggyBank,
    },
    {
      name: 'Economia/Investimento',
      value: distribuicao.paraEconomiaPercent,
      amount: distribuicao.paraEconomia,
      color: '#f59e0b',
      icon: Sparkles,
    },
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-background/95 backdrop-blur border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{item.name}</p>
          <p className="text-sm text-muted-foreground">{item.value}%</p>
          <p className="text-sm font-medium text-primary">{formatCurrency(item.amount)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card-tech p-6 border border-purple-500/30 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-purple-500 opacity-70" />
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-500/15 rounded-xl flex items-center justify-center">
          <Wallet className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Distribuição de Recursos</h3>
          <p className="text-sm text-muted-foreground">
            Base: {formatCurrency(diagnostico.receitaTotal)}/mês
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="h-48 lg:h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="space-y-3">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <div className="flex items-center gap-2">
                  <item.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{item.name}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-foreground">
                  {formatCurrency(item.amount)}
                </div>
                <div className="text-xs text-muted-foreground">{item.value}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison with current */}
      {diagnostico.despesaTotal > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <h4 className="text-sm font-medium text-foreground mb-3">Comparação com Situação Atual</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-red-500/10 rounded-lg">
              <p className="text-muted-foreground">Gastos atuais</p>
              <p className="font-medium text-red-400">{formatCurrency(diagnostico.despesaTotal)}</p>
              <p className="text-xs text-muted-foreground">
                {((diagnostico.despesaTotal / diagnostico.receitaTotal) * 100).toFixed(0)}% da receita
              </p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-lg">
              <p className="text-muted-foreground">Sugestão</p>
              <p className="font-medium text-emerald-400">{formatCurrency(distribuicao.despesasEssenciais)}</p>
              <p className="text-xs text-muted-foreground">
                {distribuicao.despesasEssenciaisPercent}% da receita
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function calcularDistribuicao(diagnostico: DiagnosticoFinanceiro): PlanoDistribuicao {
  const receita = diagnostico.receitaTotal || 0;
  const temDividas = diagnostico.totalDividas > 0;
  
  if (temDividas) {
    // Com dívidas: 60% essenciais, 30% dívidas, 10% reserva
    return {
      despesasEssenciais: receita * 0.6,
      despesasEssenciaisPercent: 60,
      paraDividas: receita * 0.3,
      paraDividasPercent: 30,
      paraReserva: receita * 0.1,
      paraReservaPercent: 10,
      paraEconomia: 0,
      paraEconomiaPercent: 0,
    };
  } else {
    // Sem dívidas: 50-30-20
    return {
      despesasEssenciais: receita * 0.5,
      despesasEssenciaisPercent: 50,
      paraDividas: 0,
      paraDividasPercent: 0,
      paraReserva: receita * 0.2,
      paraReservaPercent: 20,
      paraEconomia: receita * 0.3,
      paraEconomiaPercent: 30,
    };
  }
}
