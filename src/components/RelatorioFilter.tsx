
import React from 'react';
import { Calendar, Filter, CalendarDays, CalendarRange, CalendarClock, CalendarSearch } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getTotalWeeksInYear, formatPeriodo, getStartOfWeek, getEndOfWeek, type PeriodoTipo, type PeriodoRange } from '@/lib/dateUtils';

interface RelatorioFilterProps {
  periodoRelatorio: PeriodoTipo;
  semanaEscolhida: number;
  mesEscolhido: number;
  anoEscolhido: number;
  tipoRelatorio: string;
  intervalo: PeriodoRange;
  onPeriodoChange: (periodo: PeriodoTipo) => void;
  onSemanaChange: (semana: number) => void;
  onMesChange: (mes: number) => void;
  onAnoChange: (ano: number) => void;
  onTipoChange: (tipo: string) => void;
  onIntervaloChange: (intervalo: PeriodoRange) => void;
  onResetFilter: () => void;
}

export const RelatorioFilter: React.FC<RelatorioFilterProps> = ({
  periodoRelatorio,
  semanaEscolhida,
  mesEscolhido,
  anoEscolhido,
  tipoRelatorio,
  intervalo,
  onPeriodoChange,
  onSemanaChange,
  onMesChange,
  onAnoChange,
  onTipoChange,
  onIntervaloChange,
  onResetFilter
}) => {
  const nomesMeses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const tiposRelatorio = [
    { value: 'todos', label: 'Todos os Dados' },
    { value: 'receita', label: 'Análise de Receita' },
    { value: 'servicos', label: 'Serviços' },
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

  const totalSemanas = getTotalWeeksInYear(anoEscolhido);
  const semanasDisponiveis = Array.from({ length: totalSemanas }, (_, i) => i + 1);

  // Gerar labels das semanas com datas
  const getSemanaLabel = (semana: number) => {
    const inicio = getStartOfWeek(anoEscolhido, semana);
    const fim = getEndOfWeek(anoEscolhido, semana);
    return `Semana ${semana} (${inicio.getDate()}/${inicio.getMonth() + 1} - ${fim.getDate()}/${fim.getMonth() + 1})`;
  };

  return (
    <Card className="card-tech mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm md:text-base">
          <Filter className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
          Filtros de Relatório
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Seletor de Período (Semanal, Mensal, Anual) */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Período:</label>
          <Tabs value={periodoRelatorio} onValueChange={(value) => onPeriodoChange(value as PeriodoTipo)} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-background/50 border border-border">
              <TabsTrigger 
                value="semanal" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <CalendarDays className="w-4 h-4" />
                <span className="hidden sm:inline">Semanal</span>
              </TabsTrigger>
              <TabsTrigger 
                value="mensal"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <CalendarRange className="w-4 h-4" />
                <span className="hidden sm:inline">Mensal</span>
              </TabsTrigger>
              <TabsTrigger 
                value="anual"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <CalendarClock className="w-4 h-4" />
                <span className="hidden sm:inline">Anual</span>
              </TabsTrigger>
              <TabsTrigger
                value="personalizado"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <CalendarSearch className="w-4 h-4" />
                <span className="hidden sm:inline">Intervalo</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Intervalo personalizado: de mês/ano até mês/ano */}
        {periodoRelatorio === 'personalizado' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 rounded-xl border border-border bg-background/40">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Mês inicial</label>
              <Select value={intervalo.mesInicio.toString()} onValueChange={(v) => onIntervaloChange({ ...intervalo, mesInicio: parseInt(v) })}>
                <SelectTrigger className="w-full input-tech"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {nomesMeses.map((nome, index) => (
                    <SelectItem key={index} value={index.toString()}>{nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Ano inicial</label>
              <Select value={intervalo.anoInicio.toString()} onValueChange={(v) => onIntervaloChange({ ...intervalo, anoInicio: parseInt(v) })}>
                <SelectTrigger className="w-full input-tech"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {anosDisponiveis.map((ano) => (
                    <SelectItem key={ano} value={ano.toString()}>{ano}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Mês final</label>
              <Select value={intervalo.mesFim.toString()} onValueChange={(v) => onIntervaloChange({ ...intervalo, mesFim: parseInt(v) })}>
                <SelectTrigger className="w-full input-tech"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {nomesMeses.map((nome, index) => (
                    <SelectItem key={index} value={index.toString()}>{nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Ano final</label>
              <Select value={intervalo.anoFim.toString()} onValueChange={(v) => onIntervaloChange({ ...intervalo, anoFim: parseInt(v) })}>
                <SelectTrigger className="w-full input-tech"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {anosDisponiveis.map((ano) => (
                    <SelectItem key={ano} value={ano.toString()}>{ano}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 md:col-span-4 flex flex-wrap gap-2">
              {[3, 6, 12].map((n) => (
                <Button
                  key={n}
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => {
                    const hoje = new Date();
                    const inicio = new Date(hoje.getFullYear(), hoje.getMonth() - (n - 1), 1);
                    onIntervaloChange({
                      mesInicio: inicio.getMonth(),
                      anoInicio: inicio.getFullYear(),
                      mesFim: hoje.getMonth(),
                      anoFim: hoje.getFullYear(),
                    });
                  }}
                >
                  Últimos {n} meses
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Seletor de Tipo */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Categoria:</label>
            <Select value={tipoRelatorio} onValueChange={onTipoChange}>
              <SelectTrigger className="w-full input-tech">
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

          {/* Seletor de Semana (apenas para período semanal) */}
          {periodoRelatorio === 'semanal' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Semana:</label>
              <Select value={semanaEscolhida.toString()} onValueChange={(value) => onSemanaChange(parseInt(value))}>
                <SelectTrigger className="w-full input-tech">
                  <SelectValue placeholder="Selecione a semana" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {semanasDisponiveis.map((semana) => (
                    <SelectItem key={semana} value={semana.toString()}>
                      {getSemanaLabel(semana)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Seletor de Mês (apenas para período mensal) */}
          {periodoRelatorio === 'mensal' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Mês:</label>
              <Select value={mesEscolhido.toString()} onValueChange={(value) => onMesChange(parseInt(value))}>
                <SelectTrigger className="w-full input-tech">
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
          )}

          {/* Seletor de Ano */}
          {periodoRelatorio !== 'personalizado' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Ano:</label>
            <Select value={anoEscolhido.toString()} onValueChange={(value) => onAnoChange(parseInt(value))}>
              <SelectTrigger className="w-full input-tech">
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
          )}

          {/* Botão Reset */}
          <div className="space-y-2 flex items-end">
            <Button 
              variant="outline" 
              onClick={onResetFilter}
              className="w-full border-border hover:bg-muted text-foreground"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Limpar
            </Button>
          </div>
        </div>

        {/* Indicador do período selecionado */}
        <div className="mt-4 p-3 bg-orange-500/10 border border-border rounded-lg">
          <p className="text-sm text-orange-400">
            <strong>Período:</strong> {formatPeriodo(periodoRelatorio, semanaEscolhida, mesEscolhido, anoEscolhido, intervalo)}
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
