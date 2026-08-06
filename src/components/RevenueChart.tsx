import React, { useState } from 'react';
import { 
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { parseLocalDate } from '@/lib/utils';

const COLORS = {
  servicos: '#7C4DF0',    // violet accent
  instalacoes: '#2563EB', // electric blue accent
  despesas: '#F5326B',    // pink accent
  saldo: '#22B573',       // green accent
};

interface Servico {
  id: string;
  data_servico: string;
  valor: number;
}

interface Instalacao {
  id: string; numero_pedido: string; data_instalacao: string; valor_total: number;
  status: string; arquiteto_nome: string; ambiente: string; pedido_recebido: boolean;
}

interface Despesa {
  id: string;
  data_vencimento: string;
  valor: number;
}

interface RevenueChartProps {
  servicos?: Servico[];
  instalacoes?: Instalacao[];
  despesas?: Despesa[];
  /** @deprecated mantido para compat — não utilizado */
  sites?: unknown[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl border border-border/70 bg-popover p-3 shadow-lift min-w-[180px]">
        <p className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{label}</p>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}
              </span>
              <span className="num text-xs font-semibold text-foreground">
                {Number(entry.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const axisProps = {
  stroke: 'hsl(var(--muted-foreground))',
  fontSize: 11,
  tickLine: false as const,
  axisLine: false as const,
};

const compactBRL = (v: number) =>
  Math.abs(v) >= 1000 ? `R$ ${(v / 1000).toFixed(1)}k` : `R$ ${v}`;

const renderLegend = (value: string) => (
  <span className="text-xs font-medium text-muted-foreground">{value}</span>
);

/** Rótulo percentual dentro da fatia — nunca é cortado pelas bordas do card. */
const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (!percent || percent < 0.05) return null;
  const RAD = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RAD);
  const y = cy + r * Math.sin(-midAngle * RAD);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>
      {`${Math.round(percent * 100)}%`}
    </text>
  );
};

export const RevenueChart: React.FC<RevenueChartProps> = ({ servicos = [], instalacoes = [], despesas = [] }) => {
  const [activeTab, setActiveTab] = useState('linha');

  const generateChartData = () => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentDate = new Date();
    const chartData = [];

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = months[monthDate.getMonth()];

      const servicosRevenue = servicos
        .filter(s => {
          const d = parseLocalDate(s.data_servico);
          return d.getMonth() === monthDate.getMonth() && d.getFullYear() === monthDate.getFullYear();
        })
        .reduce((total, s) => total + Number(s.valor), 0);

      const instalacoesRevenue = instalacoes
        .filter(instalacao => {
          const installDate = parseLocalDate(instalacao.data_instalacao);
          return instalacao.status === 'Concluído' &&
                 installDate.getMonth() === monthDate.getMonth() &&
                 installDate.getFullYear() === monthDate.getFullYear();
        })
        .reduce((total, instalacao) => total + Number(instalacao.valor_total), 0);

      const despesasMes = despesas
        .filter(d => {
          const dt = parseLocalDate(d.data_vencimento);
          return dt.getMonth() === monthDate.getMonth() && dt.getFullYear() === monthDate.getFullYear();
        })
        .reduce((total, d) => total + Number(d.valor), 0);

      chartData.push({
        month: monthName,
        servicos: servicosRevenue,
        instalacoes: instalacoesRevenue,
        despesas: despesasMes,
        saldo: servicosRevenue + instalacoesRevenue - despesasMes,
      });
    }
    return chartData;
  };

  const data = generateChartData();
  const totalServicos = data.reduce((sum, item) => sum + item.servicos, 0);
  const totalInstalacoes = data.reduce((sum, item) => sum + item.instalacoes, 0);
  const totalDespesas = data.reduce((sum, item) => sum + item.despesas, 0);
  const pieData = [
    { name: 'Serviços', value: totalServicos },
    { name: 'Instalações', value: totalInstalacoes },
    { name: 'Despesas', value: totalDespesas },
  ];
  const pieColors = [COLORS.servicos, COLORS.instalacoes, COLORS.despesas];
  const pieTotal = pieData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="inline-flex h-auto w-auto gap-1 rounded-full bg-surface-3 p-1 mb-5">
        <TabsTrigger value="linha" className="rounded-full px-4 py-1.5 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Área</TabsTrigger>
        <TabsTrigger value="pizza" className="rounded-full px-4 py-1.5 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Pizza</TabsTrigger>
        <TabsTrigger value="barra" className="rounded-full px-4 py-1.5 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Barra</TabsTrigger>
      </TabsList>

      <TabsContent value="linha" className="h-72 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <defs>
              {(['servicos', 'instalacoes', 'despesas'] as const).map((k) => (
                <linearGradient key={k} id={`grad-${k}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS[k]} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={COLORS[k]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} stroke="hsl(var(--chart-grid))" strokeOpacity={0.5} strokeDasharray="2 8" />
            <XAxis dataKey="month" {...axisProps} dy={6} />
            <YAxis {...axisProps} width={64} tickFormatter={compactBRL} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" iconSize={8} formatter={renderLegend} wrapperStyle={{ paddingTop: 12 }} />
            <Area type="monotone" dataKey="servicos" stroke={COLORS.servicos} strokeWidth={2} fill="url(#grad-servicos)" name="Serviços" activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }} dot={false} />
            <Area type="monotone" dataKey="instalacoes" stroke={COLORS.instalacoes} strokeWidth={2} fill="url(#grad-instalacoes)" name="Instalações" activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }} dot={false} />
            <Area type="monotone" dataKey="despesas" stroke={COLORS.despesas} strokeWidth={2} fill="url(#grad-despesas)" name="Despesas" activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }} dot={false} />
            <Line type="monotone" dataKey="saldo" stroke={COLORS.saldo} strokeWidth={2} strokeDasharray="6 5" name="Saldo Líquido" dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }} />
          </AreaChart>
        </ResponsiveContainer>
      </TabsContent>

      <TabsContent value="pizza" className="h-72 md:h-80">
        <div className="relative h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
              <Pie
                data={pieData}
                cx="50%"
                cy="45%"
                labelLine={false}
                label={renderPieLabel}
                innerRadius="52%"
                outerRadius="78%"
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index]} stroke="hsl(var(--surface-1))" strokeWidth={3} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} formatter={renderLegend} wrapperStyle={{ paddingTop: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-x-0 top-[45%] -translate-y-1/2 flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Total</span>
            <span className="num text-lg md:text-xl font-bold text-foreground">{compactBRL(pieTotal)}</span>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="barra" className="h-72 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }} barGap={4}>
            <CartesianGrid vertical={false} stroke="hsl(var(--chart-grid))" strokeOpacity={0.5} strokeDasharray="2 8" />
            <XAxis dataKey="month" {...axisProps} dy={6} />
            <YAxis {...axisProps} width={64} tickFormatter={compactBRL} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted-foreground))', fillOpacity: 0.06 }} />
            <Legend iconType="circle" iconSize={8} formatter={renderLegend} wrapperStyle={{ paddingTop: 12 }} />
            <Bar dataKey="servicos" fill={COLORS.servicos} name="Serviços" radius={[10, 10, 0, 0]} maxBarSize={20} />
            <Bar dataKey="instalacoes" fill={COLORS.instalacoes} name="Instalações" radius={[10, 10, 0, 0]} maxBarSize={20} />
            <Bar dataKey="despesas" fill={COLORS.despesas} name="Despesas" radius={[10, 10, 0, 0]} maxBarSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </TabsContent>
    </Tabs>
  );
};
