
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

const data = [
  { month: 'Jan', sites: 1200, instalacoes: 800 },
  { month: 'Fev', sites: 1350, instalacoes: 920 },
  { month: 'Mar', sites: 1400, instalacoes: 1100 },
  { month: 'Abr', sites: 1500, instalacoes: 950 },
  { month: 'Mai', sites: 1600, instalacoes: 1200 },
  { month: 'Jun', sites: 1750, instalacoes: 1050 },
];

export const RevenueChart = () => {
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
