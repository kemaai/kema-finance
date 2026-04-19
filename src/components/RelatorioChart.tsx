import React from 'react';
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  AreaChart,
  Area,
  ComposedChart,
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
  primary: '#F97316',      // Laranja principal
  secondary: '#F59E0B',    // Amber
  tertiary: '#FB923C',     // Laranja claro
  success: '#22C55E',      // Verde
  danger: '#EF4444',       // Vermelho
  info: '#3B82F6',         // Azul
  background: '#1C1917',   // Fundo escuro
  grid: '#374151',         // Grid escuro
  text: '#D1D5DB',         // Texto claro
  textMuted: '#9CA3AF'     // Texto secundário
};

interface ChartDataPoint {
  periodo: string;
  receita?: number;
  receitaServicos?: number;
  receitaInstalacoes?: number;
  instalacoes?: number;
  metragem?: number;
  despesas?: number;
}

interface RelatorioChartProps {
  data: ChartDataPoint[];
  tipo?: 'linha' | 'barra' | 'area' | 'combinado';
  metricas?: ('receita' | 'instalacoes' | 'metragem' | 'despesas' | 'receitaServicos' | 'receitaInstalacoes')[];
  titulo?: string;
  showTabs?: boolean;
}

// Tooltip customizado com tema escuro
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-stone-900 border border-orange-500/50 rounded-lg p-3 shadow-lg">
        <p className="text-orange-400 font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => {
          let displayValue = '';
          if (entry.name === 'metragem') {
            displayValue = `${Number(entry.value).toFixed(0)} M²`;
          } else if (entry.name === 'instalacoes') {
            displayValue = `${entry.value} instalações`;
          } else {
            displayValue = `R$ ${Number(entry.value).toFixed(2)}`;
          }
          
          return (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {getMetricLabel(entry.name)}: {displayValue}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

const getMetricLabel = (metric: string): string => {
  const labels: Record<string, string> = {
    receita: 'Receita Total',
    receitaServicos: 'Receita Serviços',
    receitaInstalacoes: 'Receita Instalações',
    instalacoes: 'Instalações',
    metragem: 'Metragem',
    despesas: 'Despesas'
  };
  return labels[metric] || metric;
};

const getMetricColor = (metric: string): string => {
  const colors: Record<string, string> = {
    receita: COLORS.success,
    receitaServicos: COLORS.info,
    receitaInstalacoes: COLORS.primary,
    instalacoes: COLORS.secondary,
    metragem: COLORS.tertiary,
    despesas: COLORS.danger
  };
  return colors[metric] || COLORS.primary;
};

// Componente de Gráfico de Linha
const LineChartComponent: React.FC<{ data: ChartDataPoint[]; metricas: string[] }> = ({ data, metricas }) => (
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} opacity={0.3} />
      <XAxis 
        dataKey="periodo" 
        stroke={COLORS.textMuted}
        fontSize={12}
        tickLine={false}
      />
      <YAxis 
        stroke={COLORS.textMuted}
        fontSize={12}
        tickFormatter={(value) => `R$ ${value}`}
        tickLine={false}
      />
      <Tooltip content={<CustomTooltip />} />
      <Legend 
        formatter={(value) => <span style={{ color: COLORS.text }}>{getMetricLabel(value)}</span>}
      />
      {metricas.map((metrica) => (
        <Line 
          key={metrica}
          type="monotone" 
          dataKey={metrica} 
          stroke={getMetricColor(metrica)}
          strokeWidth={3}
          name={metrica}
          dot={{ fill: getMetricColor(metrica), strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, fill: getMetricColor(metrica) }}
        />
      ))}
    </LineChart>
  </ResponsiveContainer>
);

// Componente de Gráfico de Barras
const BarChartComponent: React.FC<{ data: ChartDataPoint[]; metricas: string[] }> = ({ data, metricas }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} opacity={0.3} />
      <XAxis 
        dataKey="periodo" 
        stroke={COLORS.textMuted}
        fontSize={12}
        tickLine={false}
      />
      <YAxis 
        stroke={COLORS.textMuted}
        fontSize={12}
        tickFormatter={(value) => metricas.includes('instalacoes') ? value.toString() : `R$ ${value}`}
        tickLine={false}
      />
      <Tooltip content={<CustomTooltip />} />
      <Legend 
        formatter={(value) => <span style={{ color: COLORS.text }}>{getMetricLabel(value)}</span>}
      />
      {metricas.map((metrica) => (
        <Bar 
          key={metrica}
          dataKey={metrica} 
          fill={getMetricColor(metrica)}
          name={metrica}
          radius={[8, 8, 0, 0]}
        />
      ))}
    </BarChart>
  </ResponsiveContainer>
);

// Componente de Gráfico de Área
const AreaChartComponent: React.FC<{ data: ChartDataPoint[]; metricas: string[] }> = ({ data, metricas }) => (
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={data}>
      <defs>
        {metricas.map((metrica) => (
          <linearGradient key={`gradient-${metrica}`} id={`gradient-${metrica}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={getMetricColor(metrica)} stopOpacity={0.4}/>
            <stop offset="95%" stopColor={getMetricColor(metrica)} stopOpacity={0}/>
          </linearGradient>
        ))}
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} opacity={0.3} />
      <XAxis 
        dataKey="periodo" 
        stroke={COLORS.textMuted}
        fontSize={12}
        tickLine={false}
      />
      <YAxis 
        stroke={COLORS.textMuted}
        fontSize={12}
        tickFormatter={(value) => `R$ ${value}`}
        tickLine={false}
      />
      <Tooltip content={<CustomTooltip />} />
      <Legend 
        formatter={(value) => <span style={{ color: COLORS.text }}>{getMetricLabel(value)}</span>}
      />
      {metricas.map((metrica) => (
        <Area 
          key={metrica}
          type="monotone" 
          dataKey={metrica} 
          stroke={getMetricColor(metrica)}
          strokeWidth={2}
          fillOpacity={1}
          fill={`url(#gradient-${metrica})`}
          name={metrica}
        />
      ))}
    </AreaChart>
  </ResponsiveContainer>
);

// Componente de Gráfico Combinado (Barras + Linha)
const ComposedChartComponent: React.FC<{ data: ChartDataPoint[] }> = ({ data }) => (
  <ResponsiveContainer width="100%" height="100%">
    <ComposedChart data={data}>
      <defs>
        <linearGradient id="gradientReceita" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
          <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.3}/>
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} opacity={0.3} />
      <XAxis 
        dataKey="periodo" 
        stroke={COLORS.textMuted}
        fontSize={12}
        tickLine={false}
      />
      <YAxis 
        yAxisId="left"
        stroke={COLORS.textMuted}
        fontSize={12}
        tickFormatter={(value) => `R$ ${value}`}
        tickLine={false}
      />
      <YAxis 
        yAxisId="right"
        orientation="right"
        stroke={COLORS.textMuted}
        fontSize={12}
        tickFormatter={(value) => `${value} M²`}
        tickLine={false}
      />
      <Tooltip content={<CustomTooltip />} />
      <Legend 
        formatter={(value) => <span style={{ color: COLORS.text }}>{getMetricLabel(value)}</span>}
      />
      <Bar 
        yAxisId="left"
        dataKey="receitaInstalacoes" 
        fill="url(#gradientReceita)"
        name="receitaInstalacoes"
        radius={[8, 8, 0, 0]}
      />
      <Line 
        yAxisId="right"
        type="monotone" 
        dataKey="metragem" 
        stroke={COLORS.success}
        strokeWidth={3}
        name="metragem"
        dot={{ fill: COLORS.success, strokeWidth: 2, r: 4 }}
      />
    </ComposedChart>
  </ResponsiveContainer>
);

export const RelatorioChart: React.FC<RelatorioChartProps> = ({ 
  data, 
  tipo = 'linha',
  metricas = ['receita'],
  showTabs = false
}) => {
  const [activeTab, setActiveTab] = React.useState(tipo);

  if (showTabs) {
    return (
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as typeof tipo)} className="w-full h-full">
        <TabsList className="grid w-full max-w-md grid-cols-4 mb-4 bg-stone-900/50 border border-orange-500/30">
          <TabsTrigger 
            value="linha" 
            className="text-xs data-[state=active]:bg-orange-500 data-[state=active]:text-white"
          >
            Linha
          </TabsTrigger>
          <TabsTrigger 
            value="barra"
            className="text-xs data-[state=active]:bg-orange-500 data-[state=active]:text-white"
          >
            Barra
          </TabsTrigger>
          <TabsTrigger 
            value="area"
            className="text-xs data-[state=active]:bg-orange-500 data-[state=active]:text-white"
          >
            Área
          </TabsTrigger>
          <TabsTrigger 
            value="combinado"
            className="text-xs data-[state=active]:bg-orange-500 data-[state=active]:text-white"
          >
            Combinado
          </TabsTrigger>
        </TabsList>

        <div className="h-[calc(100%-48px)]">
          <TabsContent value="linha" className="h-full mt-0">
            <LineChartComponent data={data} metricas={metricas} />
          </TabsContent>

          <TabsContent value="barra" className="h-full mt-0">
            <BarChartComponent data={data} metricas={metricas} />
          </TabsContent>

          <TabsContent value="area" className="h-full mt-0">
            <AreaChartComponent data={data} metricas={metricas} />
          </TabsContent>

          <TabsContent value="combinado" className="h-full mt-0">
            <ComposedChartComponent data={data} />
          </TabsContent>
        </div>
      </Tabs>
    );
  }

  // Renderização simples sem tabs
  switch (tipo) {
    case 'linha':
      return <LineChartComponent data={data} metricas={metricas} />;
    case 'barra':
      return <BarChartComponent data={data} metricas={metricas} />;
    case 'area':
      return <AreaChartComponent data={data} metricas={metricas} />;
    case 'combinado':
      return <ComposedChartComponent data={data} />;
    default:
      return <LineChartComponent data={data} metricas={metricas} />;
  }
};

export default RelatorioChart;
