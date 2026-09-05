import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Wallet, TrendingDown, PiggyBank, CalendarDays, Edit, Trash2, ChevronLeft, ChevronRight, History } from 'lucide-react';
import { format, addMonths, isSameMonth, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useGastosDiarios, type GastoDiario } from '@/hooks/useSupabaseData';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { parseLocalDate } from '@/lib/utils';
import { GastoDiarioForm, type GastoDiarioInput } from '@/components/GastoDiarioForm';
import { GastoHistoricoDialog } from '@/components/GastoHistoricoDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { KemaInsightsPanel } from '@/components/kema/KemaInsightsPanel';
import { StatusBadge } from '@/components/ui/status-badge';
import { corDaCategoria, getCategoria } from '@/lib/gastosCategorias';


const brl = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });

export default function GastosDiarios() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: gastos = [], isLoading } = useGastosDiarios();

  const [mesAtual, setMesAtual] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<GastoDiario | null>(null);
  const [historico, setHistorico] = useState<{ open: boolean; gasto?: GastoDiario | null }>({ open: false });
  const [confirmDelete, setConfirmDelete] = useState<GastoDiario | null>(null);


  const gastosDoMes = useMemo(
    () => gastos.filter(g => isSameMonth(parseLocalDate(g.data_gasto), mesAtual)),
    [gastos, mesAtual]
  );

  const resumo = useMemo(() => {
    const total = gastosDoMes.reduce((t, g) => t + Number(g.valor), 0);
    const essenciais = gastosDoMes.filter(g => g.essencial).reduce((t, g) => t + Number(g.valor), 0);
    const superfluos = total - essenciais;
    const hoje = new Date();
    const noMesCorrente = isSameMonth(hoje, mesAtual);
    const diasDecorridos = noMesCorrente
      ? hoje.getDate()
      : new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0).getDate();
    const diasNoMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0).getDate();
    const mediaDiaria = diasDecorridos > 0 ? total / diasDecorridos : 0;
    const projecao = mediaDiaria * diasNoMes;
    const gastoHoje = gastos
      .filter(g => isSameDay(parseLocalDate(g.data_gasto), hoje))
      .reduce((t, g) => t + Number(g.valor), 0);

    return { total, essenciais, superfluos, mediaDiaria, projecao, gastoHoje, qtd: gastosDoMes.length };
  }, [gastosDoMes, gastos, mesAtual]);

  const porCategoria = useMemo(() => {
    const map = new Map<string, number>();
    gastosDoMes.forEach(g => map.set(g.categoria, (map.get(g.categoria) || 0) + Number(g.valor)));
    return [...map.entries()]
      .map(([categoria, valor]) => ({ categoria, valor }))
      .sort((a, b) => b.valor - a.valor);
  }, [gastosDoMes]);

  const porDia = useMemo(() => {
    const map = new Map<string, GastoDiario[]>();
    [...gastosDoMes]
      .sort((a, b) => b.data_gasto.localeCompare(a.data_gasto))
      .forEach(g => {
        const arr = map.get(g.data_gasto) || [];
        arr.push(g);
        map.set(g.data_gasto, arr);
      });
    return [...map.entries()];
  }, [gastosDoMes]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['gastos_diarios'] });
    queryClient.invalidateQueries({ queryKey: ['gastos_diarios_historico'] });
  };


  const handleSubmit = async (data: GastoDiarioInput) => {
    if (!user) return;
    try {
      if (editing) {
        const { error } = await supabase
          .from('gastos_diarios')
          .update(data)
          .eq('id', editing.id)
          .eq('user_id', user.id);
        if (error) throw error;
        toast({ title: 'Gasto atualizado!' });
      } else {
        const { error } = await supabase
          .from('gastos_diarios')
          .insert({ ...data, user_id: user.id });
        if (error) throw error;
        toast({ title: 'Gasto registrado!' });
      }
      setEditing(null);
      invalidate();
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível salvar o gasto.', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('gastos_diarios')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
      toast({ title: 'Gasto excluído!' });
      invalidate();
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível excluir o gasto.', variant: 'destructive' });
    }
  };

  if (isLoading) return <div className="p-6">Carregando...</div>;

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="page-title">Gastos Diários</h1>
          <p className="text-muted-foreground capitalize">
            {format(mesAtual, "MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="icon" aria-label="Mês anterior" onClick={() => setMesAtual(addMonths(mesAtual, -1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={() => setMesAtual(new Date())}>Mês atual</Button>
          <Button variant="outline" size="icon" aria-label="Próximo mês" onClick={() => setMesAtual(addMonths(mesAtual, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            aria-label="Ver histórico de alterações"
            data-testid="historico-gastos"
            onClick={() => setHistorico({ open: true, gasto: null })}
          >
            <History className="w-4 h-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Histórico</span>
          </Button>

          <Button className="btn-tech" data-testid="novo-gasto" onClick={() => { setEditing(null); setIsFormOpen(true); }}>
            <Plus className="w-4 h-4 mr-1.5" />
            Novo gasto
          </Button>
        </div>
      </div>

      <KemaInsightsPanel max={2} />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="card-tech border-l-4 border-l-[hsl(var(--accent-orange))]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Total do mês</CardTitle>
            <Wallet className="w-4 h-4 text-[hsl(var(--accent-orange))]" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-xl font-bold num truncate">{brl(resumo.total)}</div>
            <p className="text-[11px] text-muted-foreground">{resumo.qtd} lançamento(s)</p>
          </CardContent>
        </Card>

        <Card className="card-tech border-l-4 border-l-[hsl(var(--accent-blue))]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Média por dia</CardTitle>
            <CalendarDays className="w-4 h-4 text-[hsl(var(--accent-blue))]" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-xl font-bold num truncate">{brl(resumo.mediaDiaria)}</div>
            <p className="text-[11px] text-muted-foreground">Hoje: {brl(resumo.gastoHoje)}</p>
          </CardContent>
        </Card>

        <Card className="card-tech border-l-4 border-l-[hsl(var(--accent-pink))]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Supérfluos</CardTitle>
            <TrendingDown className="w-4 h-4 text-[hsl(var(--accent-pink))]" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-xl font-bold num truncate">{brl(resumo.superfluos)}</div>
            <p className="text-[11px] text-muted-foreground">
              {resumo.total > 0 ? `${((resumo.superfluos / resumo.total) * 100).toFixed(0)}% do total` : 'Sem gastos'}
            </p>
          </CardContent>
        </Card>

        <Card className="card-tech border-l-4 border-l-[hsl(var(--accent-green))]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Projeção do mês</CardTitle>
            <PiggyBank className="w-4 h-4 text-[hsl(var(--accent-green))]" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-xl font-bold num truncate">{brl(resumo.projecao)}</div>
            <p className="text-[11px] text-muted-foreground">Ritmo atual de gastos</p>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por categoria */}
      <Card className="card-tech">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Onde o dinheiro está indo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {porCategoria.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum gasto registrado neste mês.</p>
          ) : (
            porCategoria.map(({ categoria, valor }) => {
              const pct = resumo.total > 0 ? (valor / resumo.total) * 100 : 0;
              const cat = getCategoria(categoria);
              return (
                <div key={categoria} className="min-w-0">
                  <div className="flex items-center justify-between gap-2 text-sm mb-1">
                    <span className="truncate">{cat.emoji} {categoria}</span>
                    <span className="font-semibold num flex-shrink-0">
                      {brl(valor)} <span className="text-muted-foreground font-normal">({pct.toFixed(0)}%)</span>
                    </span>
                  </div>
                  <div className="track">
                    <span style={{ width: `${pct}%`, background: corDaCategoria(categoria) }} />
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Lista por dia */}
      <div className="space-y-4">
        {porDia.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhum gasto neste mês. Registre o primeiro para o KEMA AI começar a orientar seus cortes.
          </p>
        ) : (
          porDia.map(([dia, itens]) => {
            const totalDia = itens.reduce((t, g) => t + Number(g.valor), 0);
            return (
              <div key={dia} className="space-y-2">
                <div className="flex items-center justify-between gap-2 px-1">
                  <h2 className="text-sm font-semibold text-foreground capitalize">
                    {format(parseLocalDate(dia), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                  </h2>
                  <span className="text-sm font-bold num text-muted-foreground">{brl(totalDia)}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {itens.map(gasto => (
                    <Card
                      key={gasto.id}
                      className="card-tech border-l-4"
                      style={{ borderLeftColor: corDaCategoria(gasto.categoria) }}
                    >
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate">{gasto.descricao}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {getCategoria(gasto.categoria).emoji} {gasto.categoria} · {gasto.forma_pagamento}
                            </p>
                          </div>
                          <span className="text-lg font-bold num flex-shrink-0">{brl(Number(gasto.valor))}</span>
                        </div>

                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <StatusBadge tone={gasto.essencial ? 'info' : 'warning'}>
                            {gasto.essencial ? 'Essencial' : 'Supérfluo'}
                          </StatusBadge>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label="Ver histórico deste gasto"
                              onClick={() => setHistorico({ open: true, gasto })}
                            >
                              <History className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label="Editar gasto"
                              onClick={() => { setEditing(gasto); setIsFormOpen(true); }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label="Excluir gasto"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setConfirmDelete(gasto)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {gasto.observacao && (
                          <p className="text-xs text-muted-foreground break-words">{gasto.observacao}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      <GastoDiarioForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditing(null); }}
        onSubmit={handleSubmit}
        gasto={editing}
      />

      <GastoHistoricoDialog
        isOpen={historico.open}
        onClose={() => setHistorico({ open: false })}
        gastoId={historico.gasto?.id}
        titulo={historico.gasto?.descricao}
      />

      <AlertDialog open={!!confirmDelete} onOpenChange={(v) => !v && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir este gasto?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDelete
                ? `"${confirmDelete.descricao}" de ${brl(Number(confirmDelete.valor))} será removido dos seus totais. A exclusão fica registrada no histórico.`
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (confirmDelete) handleDelete(confirmDelete.id);
                setConfirmDelete(null);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>

  );
}
