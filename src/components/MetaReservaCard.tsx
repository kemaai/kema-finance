import React, { useState } from 'react';
import { Shield, TrendingUp, Calendar, Target, Edit3, Check, X, Sparkles } from 'lucide-react';
import { DiagnosticoFinanceiro } from '@/hooks/useKemaFinanceAI';
import { MetaFinanceira, useMetasFinanceiras } from '@/hooks/useMetasFinanceiras';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface MetaReservaCardProps {
  diagnostico: DiagnosticoFinanceiro;
  metaReserva?: MetaFinanceira | null;
  onUpdate?: () => void;
}

export function MetaReservaCard({ diagnostico, metaReserva, onUpdate }: MetaReservaCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const { updateMeta } = useMetasFinanceiras();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const parseCurrency = (value: string): number => {
    const cleaned = value.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  };

  const metaValor = metaReserva?.valor_meta || diagnostico.metaReservaEmergencia;
  const valorAtual = metaReserva?.valor_atual || 0;
  const progresso = metaValor > 0 ? (valorAtual / metaValor) * 100 : 0;
  
  // Recalcula sugestão mensal considerando o valor já acumulado
  const calcularSugestaoMensal = () => {
    const restante = Math.max(0, metaValor - valorAtual);
    const prazoIdeal = 12; // 12 meses como prazo ideal
    
    // Considera a capacidade real de economia do usuário
    const capacidadeMaxima = diagnostico.capacidadeEconomia;
    const valorIdealMensal = restante / prazoIdeal;
    
    // Sugere o menor valor entre o ideal e a capacidade máxima
    return Math.min(valorIdealMensal, capacidadeMaxima);
  };

  const valorMensalSugerido = metaReserva?.valor_mensal_sugerido || calcularSugestaoMensal();
  
  // Calcula prazo baseado no valor mensal sugerido
  const calcularPrazoRestante = () => {
    if (valorMensalSugerido <= 0) return 0;
    const restante = Math.max(0, metaValor - valorAtual);
    return Math.ceil(restante / valorMensalSugerido);
  };

  const prazoMeses = calcularPrazoRestante();
  const valorMensal = valorMensalSugerido;

  const getProgressColor = () => {
    if (progresso >= 100) return 'from-emerald-500 to-green-400';
    if (progresso >= 50) return 'from-amber-500 to-yellow-400';
    return 'from-orange-500 to-red-400';
  };

  const getMesesRestantes = () => {
    if (valorMensal <= 0) return 'Sem capacidade atual';
    const restante = metaValor - valorAtual;
    if (restante <= 0) return 'Meta atingida!';
    return `${prazoMeses} meses restantes`;
  };

  const handleStartEdit = () => {
    setEditValue(valorAtual.toFixed(2).replace('.', ','));
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditValue('');
  };

  const handleSaveEdit = async () => {
    if (!metaReserva) {
      toast.error('Gere as metas primeiro para poder atualizar');
      return;
    }

    const novoValor = parseCurrency(editValue);
    const novoProgresso = metaValor > 0 ? Math.min((novoValor / metaValor) * 100, 100) : 0;
    
    // Recalcula sugestão mensal com novo valor
    const restante = Math.max(0, metaValor - novoValor);
    const novaSugestaoMensal = Math.min(restante / 12, diagnostico.capacidadeEconomia);

    try {
      await updateMeta.mutateAsync({
        id: metaReserva.id,
        valor_atual: novoValor,
        progresso: novoProgresso,
        valor_mensal_sugerido: novaSugestaoMensal,
      });
      
      toast.success('Valor da reserva atualizado!');
      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      toast.error('Erro ao atualizar valor');
    }
  };

  return (
    <div className="card-tech p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-2xl" />
      
      <div className="relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25 shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Reserva de Emergência</h3>
              <p className="text-sm text-muted-foreground">6 meses de despesas</p>
            </div>
          </div>
          
          {/* Edit button - visible on all screen sizes */}
          {!isEditing && metaReserva && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartEdit}
              className="text-emerald-600 border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-700 w-full sm:w-auto"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Atualizar Valor
            </Button>
          )}
        </div>

        {/* Progress Ring / Bar */}
        <div className="mb-6">
          {isEditing ? (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-xl border border-primary/20">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Quanto você já tem guardado?
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                    <Input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="pl-10 text-lg font-semibold"
                      placeholder="0,00"
                      autoFocus
                    />
                  </div>
                  <Button
                    size="icon"
                    variant="default"
                    onClick={handleSaveEdit}
                    disabled={updateMeta.isPending}
                    className="bg-emerald-500 hover:bg-emerald-600"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleCancelEdit}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Preview do novo progresso */}
                <div className="mt-4 p-3 bg-background/50 rounded-lg">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Sparkles className="w-3 h-3 text-primary" />
                    <span>Preview do progresso</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Novo progresso:</span>
                    <span className="font-semibold text-emerald-500">
                      {metaValor > 0 ? ((parseCurrency(editValue) / metaValor) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span>Falta para meta:</span>
                    <span className="font-medium">
                      {formatCurrency(Math.max(0, metaValor - parseCurrency(editValue)))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-end mb-2">
                <div 
                  className={`cursor-pointer hover:opacity-80 transition-opacity ${metaReserva ? '' : 'cursor-default'}`}
                  onClick={metaReserva ? handleStartEdit : undefined}
                >
                  <p className="text-2xl md:text-3xl font-bold text-foreground">
                    {formatCurrency(valorAtual)}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    acumulado
                    {metaReserva && <Edit3 className="w-3 h-3 opacity-50" />}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-emerald-500">
                    {progresso.toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground">do objetivo</p>
                </div>
              </div>

              <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getProgressColor()} rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min(progresso, 100)}%` }}
                />
              </div>

              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>R$ 0</span>
                <span>Meta: {formatCurrency(metaValor)}</span>
              </div>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-muted/30 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Contribuição Mensal</span>
            </div>
            <p className="text-lg font-semibold text-foreground">
              {formatCurrency(valorMensal)}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-primary" />
              sugerido pela IA
            </p>
          </div>

          <div className="p-4 bg-muted/30 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Prazo Estimado</span>
            </div>
            <p className="text-lg font-semibold text-foreground">
              {prazoMeses > 0 ? `${prazoMeses} meses` : '-'}
            </p>
            <p className="text-xs text-muted-foreground">{getMesesRestantes()}</p>
          </div>
        </div>

        {/* AI Analysis info */}
        <div className="mt-4 p-3 bg-primary/5 rounded-xl border border-primary/10">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-primary mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Análise IA:</span> Considerando sua capacidade de economia de {formatCurrency(diagnostico.capacidadeEconomia)}/mês, 
                {valorAtual > 0 
                  ? ` com ${formatCurrency(valorAtual)} já acumulados, você pode atingir a meta em ${prazoMeses} meses.`
                  : ' você pode começar a construir sua reserva gradualmente.'}
              </p>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-4 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-emerald-500 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">
                Por que 6 meses?
              </h4>
              <p className="text-xs text-muted-foreground">
                Uma reserva de 6 meses cobre imprevistos como perda de renda, 
                despesas médicas ou reparos urgentes, dando tempo para se reorganizar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
