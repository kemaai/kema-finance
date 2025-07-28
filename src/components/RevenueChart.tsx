
import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

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
}

interface RevenueChartProps {
  sites?: Site[];
  instalacoes?: Instalacao[];
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ sites = [], instalacoes = [] }) => {
  // Gerar dados dos últimos 6 meses baseados nos dados reais
  const generateChartData = () => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentDate = new Date();
    const chartData = [];

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = months[monthDate.getMonth()];
      
      // Calcular receita de sites ativos nesse mês
      const sitesRevenue = sites
        .filter(site => {
          const startDate = new Date(site.data_inicio);
          return site.status === 'Ativo' && 
                 startDate <= monthDate &&
                 (site.tipo_plano.includes('assinatura') || site.tipo_plano.includes('hospedagem'));
        })
        .reduce((total, site) => total + site.valor_mensal, 0);

      // Calcular receita de instalações concluídas nesse mês
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

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="month" 
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            tickFormatter={(value) => `R$ ${value}`}
          />
          <Tooltip 
            formatter={(value) => [`R$ ${value}`, '']}
            labelStyle={{ color: '#374151' }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="sites" 
            stroke="#3b82f6" 
            strokeWidth={3}
            name="Sites"
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="instalacoes" 
            stroke="#10b981" 
            strokeWidth={3}
            name="Instalações"
            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
