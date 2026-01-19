import React, { useState } from 'react';
import { Sparkles, Loader2, Check, AlertCircle, Target, CreditCard, PiggyBank, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DiagnosticoFinanceiro } from '@/hooks/useKemaFinanceAI';
import { MetasGeradas, useMetasFinanceiras } from '@/hooks/useMetasFinanceiras';
import { toast } from 'sonner';

interface GerarMetasButtonProps {
  diagnostico: DiagnosticoFinanceiro;
}

export function GerarMetasButton({ diagnostico }: GerarMetasButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [metasGeradas, setMetasGeradas] = useState<MetasGeradas | null>(null);
  const { saveMetasGeradas } = useMetasFinanceiras();

  const motivationalMessages = [
    'Analisando sua situação financeira...',
    'Calculando melhor distribuição de recursos...',
    'Identificando prioridades...',
    'Criando plano personalizado...',
    'Finalizando suas metas...',
  ];

  const [currentMessage, setCurrentMessage] = useState(0);

  const generateMetas = async () => {
    setIsGenerating(true);
    setCurrentMessage(0);

    // Rotate messages while generating
    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % motivationalMessages.length);
    }, 1500);

    try {
      // Generate metas based on diagnostico
      const metas = gerarMetasInteligentes(diagnostico);
      setMetasGeradas(metas);
      setShowPreview(true);
    } catch (error) {
      console.error('Error generating metas:', error);
      toast.error('Erro ao gerar metas. Tente novamente.');
    } finally {
      clearInterval(messageInterval);
      setIsGenerating(false);
    }
  };

  const handleConfirm = async () => {
    if (!metasGeradas) return;

    try {
      await saveMetasGeradas(metasGeradas);
      setShowPreview(false);
      setMetasGeradas(null);
    } catch (error) {
      console.error('Error saving metas:', error);
      toast.error('Erro ao salvar metas. Tente novamente.');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getMetaIcon = (tipo: string) => {
    switch (tipo) {
      case 'reserva_emergencia':
        return <PiggyBank className="w-5 h-5 text-emerald-500" />;
      case 'quitar_divida':
        return <CreditCard className="w-5 h-5 text-red-500" />;
      case 'economia_mensal':
        return <TrendingUp className="w-5 h-5 text-blue-500" />;
      default:
        return <Target className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <>
      <Button
        onClick={generateMetas}
        disabled={isGenerating}
        className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-medium py-6 text-lg rounded-xl shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
      >
        {isGenerating ? (
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{motivationalMessages[currentMessage]}</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5" />
            <span>Gerar Metas Inteligentes</span>
          </div>
        )}
      </Button>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="w-5 h-5 text-primary" />
              Plano Financeiro Gerado
            </DialogTitle>
          </DialogHeader>

          {metasGeradas && (
            <div className="space-y-6 py-4">
              {/* Distribution Summary */}
              <div className="p-4 bg-muted/50 rounded-xl">
                <h4 className="font-medium text-foreground mb-3">Distribuição Sugerida</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Essenciais:</span>
                    <span className="font-medium">{metasGeradas.planoDistribuicao.despesasEssenciaisPercent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dívidas:</span>
                    <span className="font-medium">{metasGeradas.planoDistribuicao.paraDividasPercent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reserva:</span>
                    <span className="font-medium">{metasGeradas.planoDistribuicao.paraReservaPercent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Economia:</span>
                    <span className="font-medium">{metasGeradas.planoDistribuicao.paraEconomiaPercent}%</span>
                  </div>
                </div>
              </div>

              {/* Metas List */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">Metas Propostas</h4>
                {metasGeradas.metas.filter(m => m.tipo_meta !== 'distribuicao').map((meta, index) => (
                  <div
                    key={index}
                    className="p-4 border border-border rounded-xl hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {getMetaIcon(meta.tipo_meta)}
                      <div className="flex-1">
                        <h5 className="font-medium text-foreground">{meta.nome}</h5>
                        {meta.descricao && (
                          <p className="text-sm text-muted-foreground mt-1">{meta.descricao}</p>
                        )}
                        <div className="flex flex-wrap gap-4 mt-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Meta: </span>
                            <span className="font-medium text-foreground">
                              {formatCurrency(meta.valor_meta)}
                            </span>
                          </div>
                          {meta.valor_mensal_sugerido > 0 && (
                            <div>
                              <span className="text-muted-foreground">Mensal: </span>
                              <span className="font-medium text-primary">
                                {formatCurrency(meta.valor_mensal_sugerido)}
                              </span>
                            </div>
                          )}
                          {meta.prazo_meses && (
                            <div>
                              <span className="text-muted-foreground">Prazo: </span>
                              <span className="font-medium text-foreground">
                                {meta.prazo_meses} meses
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Warning */}
              <div className="flex items-start gap-3 p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="text-sm text-foreground font-medium">Importante</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ao confirmar, suas metas anteriores geradas por IA serão substituídas.
                    Metas personalizadas serão mantidas.
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm} className="bg-primary hover:bg-primary/90">
              <Check className="w-4 h-4 mr-2" />
              Confirmar Metas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function gerarMetasInteligentes(diagnostico: DiagnosticoFinanceiro): MetasGeradas {
  const receita = diagnostico.receitaTotal;
  const temDividas = diagnostico.totalDividas > 0;
  const saldoPositivo = diagnostico.saldoReal > 0;
  
  let planoDistribuicao;
  const metas: MetasGeradas['metas'] = [];

  if (temDividas) {
    // Com dívidas: 60% essenciais, 30% dívidas, 10% reserva
    planoDistribuicao = {
      despesasEssenciais: receita * 0.6,
      despesasEssenciaisPercent: 60,
      paraDividas: receita * 0.3,
      paraDividasPercent: 30,
      paraReserva: receita * 0.1,
      paraReservaPercent: 10,
      paraEconomia: 0,
      paraEconomiaPercent: 0,
    };

    // Meta: Quitar dívidas
    const valorMensalDivida = receita * 0.3;
    const prazoQuitacao = Math.ceil(diagnostico.totalDividas / valorMensalDivida);
    
    metas.push({
      tipo_meta: 'quitar_divida',
      nome: 'Quitar Dívidas',
      descricao: `Elimine suas dívidas usando o método Avalanche (priorizar juros mais altos). Total atual: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(diagnostico.totalDividas)}`,
      valor_meta: diagnostico.totalDividas,
      valor_atual: 0,
      valor_mensal_sugerido: valorMensalDivida,
      prazo_meses: prazoQuitacao,
      data_inicio: new Date().toISOString().split('T')[0],
      data_fim: null,
      progresso: 0,
      ativa: true,
      prioridade: 1,
      criada_por_ai: true,
      metadata: { metodologia: 'avalanche' },
    });

    // Meta: Reserva mínima (mesmo com dívidas)
    const reservaMinima = diagnostico.despesaTotal * 2; // 2 meses enquanto quita dívidas
    const valorMensalReservaMin = receita * 0.1;
    const prazoReservaMin = Math.ceil(reservaMinima / valorMensalReservaMin);

    metas.push({
      tipo_meta: 'reserva_emergencia',
      nome: 'Reserva Mínima de Segurança',
      descricao: 'Enquanto quita dívidas, mantenha uma reserva mínima de 2 meses para emergências.',
      valor_meta: reservaMinima,
      valor_atual: 0,
      valor_mensal_sugerido: valorMensalReservaMin,
      prazo_meses: prazoReservaMin,
      data_inicio: new Date().toISOString().split('T')[0],
      data_fim: null,
      progresso: 0,
      ativa: true,
      prioridade: 2,
      criada_por_ai: true,
      metadata: {},
    });
  } else {
    // Sem dívidas: 50-30-20
    planoDistribuicao = {
      despesasEssenciais: receita * 0.5,
      despesasEssenciaisPercent: 50,
      paraDividas: 0,
      paraDividasPercent: 0,
      paraReserva: receita * 0.2,
      paraReservaPercent: 20,
      paraEconomia: receita * 0.3,
      paraEconomiaPercent: 30,
    };

    // Meta: Reserva de emergência completa
    const valorMensalReserva = receita * 0.2;
    
    metas.push({
      tipo_meta: 'reserva_emergencia',
      nome: 'Reserva de Emergência Completa',
      descricao: 'Construa uma reserva de 6 meses de despesas para garantir segurança financeira.',
      valor_meta: diagnostico.metaReservaEmergencia,
      valor_atual: 0,
      valor_mensal_sugerido: valorMensalReserva,
      prazo_meses: diagnostico.prazoReserva,
      data_inicio: new Date().toISOString().split('T')[0],
      data_fim: null,
      progresso: 0,
      ativa: true,
      prioridade: 1,
      criada_por_ai: true,
      metadata: {},
    });

    // Meta: Economia mensal
    metas.push({
      tipo_meta: 'economia_mensal',
      nome: 'Economia para Investimentos',
      descricao: 'Após completar a reserva de emergência, destine este valor para investimentos de longo prazo.',
      valor_meta: receita * 0.3 * 12, // Meta anual
      valor_atual: 0,
      valor_mensal_sugerido: receita * 0.3,
      prazo_meses: 12,
      data_inicio: new Date().toISOString().split('T')[0],
      data_fim: null,
      progresso: 0,
      ativa: true,
      prioridade: 2,
      criada_por_ai: true,
      metadata: {},
    });
  }

  // Meta de distribuição (para referência)
  metas.push({
    tipo_meta: 'distribuicao',
    nome: 'Plano de Distribuição',
    descricao: 'Distribuição sugerida de recursos mensais baseada na sua situação financeira.',
    valor_meta: receita,
    valor_atual: 0,
    valor_mensal_sugerido: 0,
    prazo_meses: null,
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim: null,
    progresso: 0,
    ativa: true,
    prioridade: 3,
    criada_por_ai: true,
    metadata: { planoDistribuicao },
  });

  return { planoDistribuicao, metas };
}
