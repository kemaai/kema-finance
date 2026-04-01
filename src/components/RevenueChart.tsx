import React, { useState } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const COLORS = {
  sites: '#F97316',
  instalacoes: '#6366F1',
};

interface Site {
  id: string; status: string; valor_mensal: number; tipo_plano: string;
  data_vencimento: string; cliente_nome: string; descricao_projeto: string; data_inicio: string;
}

interface Instalacao {
  id: string; numero_pedido: string; data_instalacao: string; valor_total: number;
  status: string; arquiteto_nome: string; ambiente: string; pedido_recebido: boolean;
}

interface RevenueChartProps {
  sites?: Site[];
  instalacoes?: Instalacao[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="text-primary font-medium mb-2 text-sm">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs text-foreground" style={{ color: entry.color }}>
            {entry.name}: R$ {Number(entry.value).toFixed(2)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const RevenueChart: React.FC<RevenueChartProps> = ({ sites = [], instalacoes = [] }) => {
  const [activeTab, setActiveTab] = useState('linha');

  const generateChartData = () => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentDate = new Date();
    const chartData = [];

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = months[monthDate.getMonth()];
      
      const sitesRevenue = sites
        .filter(site => {
          const startDate = new Date(site.data_inicio);
          return site.status === 'Ativo' && startDate <= monthDate &&
                 (site.tipo_plano.includes('assinatura') || site.tipo_plano.includes('hospedagem'));
        })
        .reduce((total, site) => total + site.valor_mensal, 0);

      const instalacoesRevenue = instalacoes
        .filter(instalacao => {
          const installDate = new Date(instalacao.data_instalacao);
          return instalacao.status === 'Concluído' &&
                 installDate.getMonth() === monthDate.getMonth() &&
                 installDate.getFullYear() === monthDate.getFullYear();
        })
        .reduce((total, instalacao) => total + instalacao.valor_total, 0);

      chartData.push({ month: monthName, sites: sitesRevenue, instalacoes: instalacoesRevenue });
    }
    return chartData;
  };

  const data = generateChartData();
  const totalSites = data.reduce((sum, item) => sum + item.sites, 0);
  const totalInstalacoes = data.reduce((sum, item) => sum + item.instalacoes, 0);
  const pieData = [
    { name: 'Sites', value: totalSites },
    { name: 'Instalações', value: totalInstalacoes }
  ];
  const pieColors = [COLORS.sites, COLORS.instalacoes];

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
            <Line type="monotone" dataKey="sites" stroke={COLORS.sites} strokeWidth={2.5} name="Sites" dot={{ fill: COLORS.sites, r: 3 }} />
            <Line type="monotone" dataKey="instalacoes" stroke={COLORS.instalacoes} strokeWidth={2.5} name="Instalações" dot={{ fill: COLORS.instalacoes, r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </TabsContent>

      <TabsContent value="pizza" className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: R$ ${value.toFixed(0)}`} outerRadius={90} dataKey="value">
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
            <Bar dataKey="sites" fill={COLORS.sites} name="Sites" radius={[6, 6, 0, 0]} />
            <Bar dataKey="instalacoes" fill={COLORS.instalacoes} name="Instalações" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </TabsContent>
    </Tabs>
  );
};
