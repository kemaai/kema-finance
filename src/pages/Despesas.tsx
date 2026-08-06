import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Calculator, Clock, CheckCircle, XCircle } from 'lucide-react';
import { DespesaCard } from '@/components/DespesaCard';
import { DespesaForm } from '@/components/DespesaForm';
import { useDespesas } from '@/hooks/useSupabaseData';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { format, isSameMonth, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Despesa {
  id: string;
  nome: string;
  valor: number;
  data_vencimento: string;
  anotacao?: string;
  paga: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export default function Despesas() {
  const { user } = useAuth();
  const { data: despesas = [], isLoading } = useDespesas();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDespesa, setEditingDespesa] = useState<Despesa | null>(null);
  const [mesAtual, setMesAtual] = useState(new Date());

  // Contas pré-definidas
  const contasPreDefinidas = [
    // Vencimento dia 05
    { nome: 'Água', valor: 75.43, vencimento: 5, anotacao: '' },
    { nome: 'Luz', valor: 254.24, vencimento: 5, anotacao: '' },
    { nome: 'Compra', valor: 0, vencimento: 5, anotacao: '' },
    { nome: 'IPVA', valor: 0, vencimento: 16, anotacao: '' },
    { nome: 'Inter', valor: 55.00, vencimento: 5, anotacao: '' },
    { nome: 'Santander 123', valor: 1890.98, vencimento: 5, anotacao: '' },
    { nome: 'Convênio', valor: 0, vencimento: 5, anotacao: '' },
    // Vencimento dia 20
    { nome: 'Wifi', valor: 129.90, vencimento: 20, anotacao: '' },
    { nome: 'Jazigo', valor: 604.21, vencimento: 20, anotacao: '-R$393,00' },
    { nome: 'MEI', valor: 75.60, vencimento: 20, anotacao: '' },
    { nome: 'NUBANK', valor: 459.64, vencimento: 20, anotacao: '' },
    { nome: 'BLACK Flávia', valor: 200.00, vencimento: 20, anotacao: '' },
    { nome: 'Porto Seguro', valor: 602.06, vencimento: 20, anotacao: '' },
    { nome: 'Nubank PJ', valor: 1134.50, vencimento: 20, anotacao: '' },
    { nome: 'MBA 2°', valor: 147.00, vencimento: 18, anotacao: '' },
  ];

  // Filtrar despesas do mês atual
  const despesasDoMes = useMemo(() => {
    return despesas.filter(despesa => 
      isSameMonth(new Date(despesa.data_vencimento), mesAtual)
    );
  }, [despesas, mesAtual]);

  // Calcular estatísticas
  const estatisticas = useMemo(() => {
    const total = despesasDoMes.reduce((acc, despesa) => acc + despesa.valor, 0);
    const pagas = despesasDoMes.filter(d => d.paga).reduce((acc, despesa) => acc + despesa.valor, 0);
    const pendentes = total - pagas;
    const vencidas = despesasDoMes.filter(d => !d.paga && new Date(d.data_vencimento) < new Date()).length;
    
    return { total, pagas, pendentes, vencidas, totalContas: despesasDoMes.length };
  }, [despesasDoMes]);

  // Separar despesas por vencimento
  const despesasPorVencimento = useMemo(() => {
    const dia05 = despesasDoMes.filter(d => new Date(d.data_vencimento).getDate() <= 10);
    const dia20 = despesasDoMes.filter(d => new Date(d.data_vencimento).getDate() > 10);
    
    return { dia05, dia20 };
  }, [despesasDoMes]);

  const handleCreateOrUpdate = async (data: Omit<Despesa, 'id'>) => {
    if (!user) return;

    try {
      if (editingDespesa) {
        const { error } = await supabase
          .from('despesas')
          .update({
            nome: data.nome,
            valor: data.valor,
            data_vencimento: data.data_vencimento,
            anotacao: data.anotacao,
            paga: data.paga,
          })
          .eq('id', editingDespesa.id)
          .eq('user_id', user.id);

        if (error) throw error;
        toast({ title: 'Despesa atualizada com sucesso!' });
      } else {
        const { error } = await supabase
          .from('despesas')
          .insert({
            nome: data.nome,
            valor: data.valor,
            data_vencimento: data.data_vencimento,
            anotacao: data.anotacao,
            paga: data.paga,
            user_id: user.id,
          });

        if (error) throw error;
        toast({ title: 'Despesa criada com sucesso!' });
      }

      queryClient.invalidateQueries({ queryKey: ['despesas'] });
      setEditingDespesa(null);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar despesa',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('despesas')
        .delete()
        .eq('id', id)
        .eq('user_id', user!.id);

      if (error) throw error;
      
      toast({ title: 'Despesa excluída com sucesso!' });
      queryClient.invalidateQueries({ queryKey: ['despesas'] });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir despesa',
        variant: 'destructive',
      });
    }
  };

  const handleDuplicate = (despesa: Despesa) => {
    const proximoMes = addMonths(new Date(despesa.data_vencimento), 1);
    const novaData = format(proximoMes, 'yyyy-MM-dd');
    
    handleCreateOrUpdate({
      nome: despesa.nome,
      valor: despesa.valor,
      data_vencimento: novaData,
      anotacao: despesa.anotacao,
      paga: false,
      user_id: despesa.user_id,
      created_at: despesa.created_at,
      updated_at: despesa.updated_at,
    });
  };

  const handleTogglePaga = async (id: string, paga: boolean) => {
    try {
      const { error } = await supabase
        .from('despesas')
        .update({ paga })
        .eq('id', id)
        .eq('user_id', user!.id);

      if (error) throw error;
      
      toast({ 
        title: paga ? 'Conta marcada como paga!' : 'Conta marcada como pendente!' 
      });
      queryClient.invalidateQueries({ queryKey: ['despesas'] });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar status da conta',
        variant: 'destructive',
      });
    }
  };

  const criarContasDoMes = async () => {
    if (!user) return;

    try {
      const ano = mesAtual.getFullYear();
      const mes = mesAtual.getMonth();
      
      const novasContas = contasPreDefinidas.map(conta => ({
        nome: conta.nome,
        valor: conta.valor,
        data_vencimento: format(new Date(ano, mes, conta.vencimento), 'yyyy-MM-dd'),
        anotacao: conta.anotacao,
        paga: false,
        user_id: user.id,
      }));

      const { error } = await supabase
        .from('despesas')
        .insert(novasContas);

      if (error) throw error;
      
      toast({ title: 'Contas do mês criadas com sucesso!' });
      queryClient.invalidateQueries({ queryKey: ['despesas'] });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao criar contas do mês',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (despesa: Despesa) => {
    setEditingDespesa(despesa);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingDespesa(null);
  };

  if (isLoading) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title">Controle de Despesas</h1>
          <p className="text-muted-foreground">
            {format(mesAtual, 'MMMM yyyy', { locale: ptBR })}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setMesAtual(addMonths(mesAtual, -1))}
          >
            Mês Anterior
          </Button>
          <Button
            variant="outline"
            onClick={() => setMesAtual(new Date())}
          >
            Mês Atual
          </Button>
          <Button
            variant="outline"
            onClick={() => setMesAtual(addMonths(mesAtual, 1))}
          >
            Próximo Mês
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="card-tech">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total do Mês</CardTitle>
            <Calculator className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-orange-500 text-xl">
              R$ {estatisticas.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="card-tech">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-green-500 text-xl">
              R$ {estatisticas.pagas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="card-tech">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-yellow-500 text-xl">
              R$ {estatisticas.pendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="card-tech">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-red-500 text-xl">
              {estatisticas.vencidas}
            </div>
          </CardContent>
        </Card>

        <Card className="card-tech">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-foreground text-xl">
              {estatisticas.totalContas}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botões de ação */}
      <div className="flex gap-2 flex-wrap">
        <Button onClick={() => setIsFormOpen(true)} className="btn-tech">
          <Plus className="h-4 w-4 mr-2" />
          Nova Despesa
        </Button>
        
        {despesasDoMes.length === 0 && (
          <Button variant="outline" onClick={criarContasDoMes} className="border-orange-500/30 hover:bg-orange-500/10">
            Criar Contas do Mês
          </Button>
        )}
      </div>

      {/* Lista de despesas por vencimento */}
      <Tabs defaultValue="dia05" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dia05">
            Vencimento dia 05 ({despesasPorVencimento.dia05.length})
          </TabsTrigger>
          <TabsTrigger value="dia20">
            Vencimento dia 20 ({despesasPorVencimento.dia20.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dia05" className="space-y-4">
          {despesasPorVencimento.dia05.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {despesasPorVencimento.dia05.map((despesa) => (
                <DespesaCard
                  key={despesa.id}
                  despesa={despesa}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onDuplicate={handleDuplicate}
                  onTogglePaga={handleTogglePaga}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma conta com vencimento dia 05 encontrada.
            </p>
          )}
        </TabsContent>
        
        <TabsContent value="dia20" className="space-y-4">
          {despesasPorVencimento.dia20.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {despesasPorVencimento.dia20.map((despesa) => (
                <DespesaCard
                  key={despesa.id}
                  despesa={despesa}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onDuplicate={handleDuplicate}
                  onTogglePaga={handleTogglePaga}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma conta com vencimento dia 20 encontrada.
            </p>
          )}
        </TabsContent>
      </Tabs>

      <DespesaForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleCreateOrUpdate}
        despesa={editingDespesa}
      />
    </div>
  );
}