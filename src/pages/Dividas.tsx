
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';
import { useEmprestimos, usePagamentosEmprestimo, useDividasNegativadas } from '@/hooks/useSupabaseData';
import { EmprestimoCard } from '@/components/EmprestimoCard';
import { DividaNegativadaCard } from '@/components/DividaNegativadaCard';
import { EmprestimoForm } from '@/components/EmprestimoForm';
import { DividaNegativadaForm } from '@/components/DividaNegativadaForm';

export const Dividas = () => {
  const [isEmprestimoFormOpen, setIsEmprestimoFormOpen] = useState(false);
  const [isDividaFormOpen, setIsDividaFormOpen] = useState(false);

  const { data: emprestimos = [], refetch: refetchEmprestimos } = useEmprestimos();
  const { data: pagamentos = [], refetch: refetchPagamentos } = usePagamentosEmprestimo();
  const { data: dividasNegativadas = [], refetch: refetchDividas } = useDividasNegativadas();

  const handleUpdate = () => {
    refetchEmprestimos();
    refetchPagamentos();
    refetchDividas();
  };

  // Cálculos para empréstimos
  const totalEmprestimos = emprestimos.reduce((sum, emp) => sum + Number(emp.valor_original), 0);
  const totalPagoEmprestimos = pagamentos.reduce((sum, pag) => sum + Number(pag.valor_pago), 0);
  const totalRestanteEmprestimos = emprestimos.reduce((sum, emp) => {
    const emprestimoPayments = pagamentos.filter(p => p.emprestimo_id === emp.id);
    const totalPago = emprestimoPayments.reduce((s, p) => s + Number(p.valor_pago), 0);
    return sum + (Number(emp.valor_original) - totalPago);
  }, 0);

  // Cálculos para dívidas negativadas
  const totalDividasNegativadas = dividasNegativadas.reduce((sum, div) => sum + Number(div.valor_original), 0);
  const dividasPagas = dividasNegativadas.filter(div => div.pago);
  const dividasPendentes = dividasNegativadas.filter(div => !div.pago);
  const totalDividasPendentes = dividasPendentes.reduce((sum, div) => sum + Number(div.valor_atual), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dívidas</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus empréstimos e dívidas negativadas
          </p>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="card-tech">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Empréstimos</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              R$ {totalEmprestimos.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {emprestimos.length} empréstimo(s)
            </p>
          </CardContent>
        </Card>

        <Card className="card-tech">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Restante Empréstimos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              R$ {totalRestanteEmprestimos.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Pago: R$ {totalPagoEmprestimos.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="card-tech">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dívidas Negativadas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              R$ {totalDividasPendentes.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {dividasPendentes.length} pendente(s)
            </p>
          </CardContent>
        </Card>

        <Card className="card-tech">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dívidas Quitadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {dividasPagas.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Total: {dividasNegativadas.length} dívida(s)
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="emprestimos" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="emprestimos">Empréstimos</TabsTrigger>
          <TabsTrigger value="dividas">Dívidas Negativadas</TabsTrigger>
        </TabsList>

        <TabsContent value="emprestimos" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-foreground">Empréstimos</h2>
            <Button onClick={() => setIsEmprestimoFormOpen(true)} className="btn-tech">
              <Plus className="w-4 h-4 mr-2" />
              Empréstimo
            </Button>
          </div>

          {emprestimos.length === 0 ? (
            <Card className="card-tech">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <DollarSign className="h-12 w-12 text-orange-500 mb-4" />
                <h3 className="text-lg font-medium mb-2 text-foreground">Nenhum empréstimo cadastrado</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Comece adicionando seu primeiro empréstimo para acompanhar os pagamentos.
                </p>
                <Button onClick={() => setIsEmprestimoFormOpen(true)} className="btn-tech">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Empréstimo
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {emprestimos.map((emprestimo) => (
                <EmprestimoCard
                  key={emprestimo.id}
                  emprestimo={emprestimo}
                  pagamentos={pagamentos}
                  onUpdate={handleUpdate}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="dividas" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-foreground">Dívidas Negativadas</h2>
            <Button onClick={() => setIsDividaFormOpen(true)} className="btn-tech">
              <Plus className="w-4 h-4 mr-2" />
              Nova Dívida
            </Button>
          </div>

          {dividasNegativadas.length === 0 ? (
            <Card className="card-tech">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <AlertTriangle className="h-12 w-12 text-orange-500 mb-4" />
                <h3 className="text-lg font-medium mb-2 text-foreground">Nenhuma dívida cadastrada</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Adicione suas dívidas negativadas para acompanhar os pagamentos.
                </p>
                <Button onClick={() => setIsDividaFormOpen(true)} className="btn-tech">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Dívida
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dividasNegativadas.map((divida) => (
                <DividaNegativadaCard
                  key={divida.id}
                  divida={divida}
                  onUpdate={handleUpdate}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Formulários */}
      <EmprestimoForm
        isOpen={isEmprestimoFormOpen}
        onClose={() => setIsEmprestimoFormOpen(false)}
        onSuccess={handleUpdate}
      />

      <DividaNegativadaForm
        isOpen={isDividaFormOpen}
        onClose={() => setIsDividaFormOpen(false)}
        onSuccess={handleUpdate}
      />
    </div>
  );
};
