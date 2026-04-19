import React, { useState } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { parseLocalDate } from '@/lib/utils';

const COLORS = {
  servicos: '#F97316',   // orange
  instalacoes: '#6366F1', // indigo
  despesas: '#EF4444',    // red
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
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="text-primary font-medium mb-2 text-sm">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: R$ {Number(entry.value).toFixed(2)}
          </p>
        ))}
      </div>
    );
  }
  return null;
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

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-3 mb-4 bg-muted/50 border border-border">
        <TabsTrigger value="linha" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs">Linha</TabsTrigger>
        <TabsTrigger value="pizza" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs">Pizza</TabsTrigger>
        <TabsTrigger value="barra" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs">Barra</TabsTrigger>
      </TabsList>

      <TabsContent value="linha" className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.06} />
            <XAxis dataKey="month" stroke="currentColor" fontSize={11} tickLine={false} opacity={0.4} />
            <YAxis stroke="currentColor" fontSize={11} tickFormatter={(v) => `R$ ${v}`} tickLine={false} opacity={0.4} />
            <Tooltip content={<CustomTooltip />} />
            <Legend formatter={(value) => <span className="text-foreground text-xs">{value}</span>} />
            <Line type="monotone" dataKey="servicos" stroke={COLORS.servicos} strokeWidth={2.5} name="Serviços" dot={{ fill: COLORS.servicos, r: 3 }} />
            <Line type="monotone" dataKey="instalacoes" stroke={COLORS.instalacoes} strokeWidth={2.5} name="Instalações" dot={{ fill: COLORS.instalacoes, r: 3 }} />
            <Line type="monotone" dataKey="despesas" stroke={COLORS.despesas} strokeWidth={2.5} name="Despesas" dot={{ fill: COLORS.despesas, r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </TabsContent>

      <TabsContent value="pizza" className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: R$ ${Number(value).toFixed(0)}`} outerRadius={90} dataKey="value">
              {pieData.map((_, index) => <Cell key={`cell-${index}`} fill={pieColors[index]} />)}
            </Pie>
            <Tooltip formatter={(v) => `R$ ${Number(v).toFixed(2)}`} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
            <Legend formatter={(value) => <span className="text-foreground text-xs">{value}</span>} />
          </PieChart>
        </ResponsiveContainer>
      </TabsContent>

      <TabsContent value="barra" className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.06} />
            <XAxis dataKey="month" stroke="currentColor" fontSize={11} tickLine={false} opacity={0.4} />
            <YAxis stroke="currentColor" fontSize={11} tickFormatter={(v) => `R$ ${v}`} tickLine={false} opacity={0.4} />
            <Tooltip content={<CustomTooltip />} />
            <Legend formatter={(value) => <span className="text-foreground text-xs">{value}</span>} />
            <Bar dataKey="servicos" fill={COLORS.servicos} name="Serviços" radius={[6, 6, 0, 0]} />
            <Bar dataKey="instalacoes" fill={COLORS.instalacoes} name="Instalações" radius={[6, 6, 0, 0]} />
            <Bar dataKey="despesas" fill={COLORS.despesas} name="Despesas" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </TabsContent>
    </Tabs>
  );
};
