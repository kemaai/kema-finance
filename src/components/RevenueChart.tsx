import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Paleta de cores KemaAI
const COLORS = {
  sites: '#F97316',        // Laranja KemaAI
  instalacoes: '#F59E0B',  // Amber
};

interface Site {
  id: string;
  status: string;
  valor_mensal: number;
  tipo_plano: string;
  data_vencimento: string;
  cliente_nome: string;
  descricao_projeto: string;
  data_inicio: string;
}

interface Instalacao {
  id: string;
  numero_pedido: string;
  data_instalacao: string;
  valor_total: number;
  status: string;
  arquiteto_nome: string;
  ambiente: string;
  pedido_recebido: boolean;
}

interface RevenueChartProps {
  sites?: Site[];
  instalacoes?: Instalacao[];
}

// Tooltip customizado adaptativo
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-primary/50 rounded-lg p-3 shadow-lg">
        <p className="text-primary font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm text-foreground" style={{ color: entry.color }}>
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

  // Gerar dados dos últimos 6 meses baseados nos dados reais
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
          return site.status === 'Ativo' && 
                 startDate <= monthDate &&
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

      chartData.push({
        month: monthName,
        sites: sitesRevenue,
        instalacoes: instalacoesRevenue
      });
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

  // Use CSS-aware colors for grid/text
  const gridColor = 'hsl(var(--border))';
  const textColor = 'hsl(var(--muted-foreground))';

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-3 mb-4 bg-muted/50 border border-border">
        <TabsTrigger 
          value="linha"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          Linha
        </TabsTrigger>
        <TabsTrigger 
          value="pizza"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          Pizza
        </TabsTrigger>
        <TabsTrigger 
          value="barra"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          Barra
        </TabsTrigger>
      </TabsList>

      <TabsContent value="linha" className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
            <XAxis 
              dataKey="month" 
              stroke="currentColor"
              fontSize={12}
              tickLine={false}
              opacity={0.5}
            />
            <YAxis 
              stroke="currentColor"
              fontSize={12}
              tickFormatter={(value) => `R$ ${value}`}
              tickLine={false}
              opacity={0.5}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              formatter={(value) => <span className="text-foreground">{value}</span>}
            />
            <Line 
              type="monotone" 
              dataKey="sites" 
              stroke={COLORS.sites}
              strokeWidth={3}
              name="Sites"
              dot={{ fill: COLORS.sites, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: COLORS.sites }}
            />
            <Line 
              type="monotone" 
              dataKey="instalacoes" 
              stroke={COLORS.instalacoes}
              strokeWidth={3}
              name="Instalações"
              dot={{ fill: COLORS.instalacoes, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: COLORS.instalacoes }}
            />
          </LineChart>
        </ResponsiveContainer>
      </TabsContent>

      <TabsContent value="pizza" className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: R$ ${value.toFixed(2)}`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={pieColors[index]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => `R$ ${Number(value).toFixed(2)}`}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--primary) / 0.5)',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))'
              }}
            />
            <Legend 
              formatter={(value) => <span className="text-foreground">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </TabsContent>

      <TabsContent value="barra" className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
            <XAxis 
              dataKey="month" 
              stroke="currentColor"
              fontSize={12}
              tickLine={false}
              opacity={0.5}
            />
            <YAxis 
              stroke="currentColor"
              fontSize={12}
              tickFormatter={(value) => `R$ ${value}`}
              tickLine={false}
              opacity={0.5}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              formatter={(value) => <span className="text-foreground">{value}</span>}
            />
            <Bar 
              dataKey="sites" 
              fill={COLORS.sites}
              name="Sites"
              radius={[8, 8, 0, 0]}
            />
            <Bar 
              dataKey="instalacoes" 
              fill={COLORS.instalacoes}
              name="Instalações"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </TabsContent>
    </Tabs>
  );
};
