
import React from 'react';
import { Calendar, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface RelatorioFilterProps {
  mesEscolhido: number;
  anoEscolhido: number;
  tipoRelatorio: string;
  onMesChange: (mes: number) => void;
  onAnoChange: (ano: number) => void;
  onTipoChange: (tipo: string) => void;
  onResetFilter: () => void;
}

export const RelatorioFilter: React.FC<RelatorioFilterProps> = ({
  mesEscolhido,
  anoEscolhido,
  tipoRelatorio,
  onMesChange,
  onAnoChange,
  onTipoChange,
  onResetFilter
}) => {
  const nomesMeses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const tiposRelatorio = [
    { value: 'todos', label: 'Todos os Dados' },
    { value: 'receita', label: 'Análise de Receita' },
    { value: 'sites', label: 'Sites e Contratos' },
    { value: 'instalacoes', label: 'Instalações' },
    { value: 'clientes', label: 'Base de Clientes' },
    { value: 'despesas', label: 'Despesas' },
    { value: 'dividas', label: 'Dívidas Negativadas' },
    { value: 'emprestimos', label: 'Empréstimos' }
  ];

  const anosDisponiveis = Array.from(
    { length: 10 }, 
    (_, i) => new Date().getFullYear() - 5 + i
  );

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm md:text-base">
          <Filter className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
          Filtros de Relatório
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Seletor de Tipo */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Categoria:</label>
            <Select value={tipoRelatorio} onValueChange={onTipoChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {tiposRelatorio.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Seletor de Mês */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Mês:</label>
            <Select value={mesEscolhido.toString()} onValueChange={(value) => onMesChange(parseInt(value))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                {nomesMeses.map((nome, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Seletor de Ano */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Ano:</label>
            <Select value={anoEscolhido.toString()} onValueChange={(value) => onAnoChange(parseInt(value))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o ano" />
              </SelectTrigger>
              <SelectContent>
                {anosDisponiveis.map((ano) => (
                  <SelectItem key={ano} value={ano.toString()}>
                    {ano}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Botão Reset */}
          <div className="space-y-2 flex items-end">
            <Button 
              variant="outline" 
              onClick={onResetFilter}
              className="w-full"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Limpar
            </Button>
          </div>
        </div>

        {/* Indicador do período selecionado */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Período:</strong> {nomesMeses[mesEscolhido]} de {anoEscolhido}
            {tipoRelatorio !== 'todos' && (
              <span className="ml-2">
                | <strong>Categoria:</strong> {tiposRelatorio.find(t => t.value === tipoRelatorio)?.label}
              </span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
