import React, { useState } from 'react';
import { Settings, Save, RotateCcw, Ruler } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useM2Price, DEFAULT_M2_PRICE } from '@/hooks/useM2Price';

const Configuracoes: React.FC = () => {
  const { price, setPrice } = useM2Price();
  const { toast } = useToast();
  const [valor, setValor] = useState<string>(price.toString());

  React.useEffect(() => {
    setValor(price.toString());
  }, [price]);

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(valor.replace(',', '.'));
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast({
        title: 'Valor inválido',
        description: 'Informe um valor numérico maior que zero.',
        variant: 'destructive',
      });
      return;
    }
    setPrice(parsed);
    toast({
      title: 'Configuração salva',
      description: `Valor do m² atualizado para R$ ${parsed.toFixed(2)}.`,
    });
  };

  const handleRestaurar = () => {
    setPrice(DEFAULT_M2_PRICE);
    setValor(DEFAULT_M2_PRICE.toString());
    toast({
      title: 'Valor restaurado',
      description: `Valor do m² voltou ao padrão (R$ ${DEFAULT_M2_PRICE.toFixed(2)}).`,
    });
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
      <header className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
          <Settings className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="page-title">Configurações</h1>
          <p className="text-sm text-muted-foreground">
            Ajuste parâmetros do sistema sem precisar mexer no código.
          </p>
        </div>
      </header>

      <Card className="card-tech">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-accent" />
            <CardTitle className="text-lg">Valor do metro quadrado (m²)</CardTitle>
          </div>
          <CardDescription>
            Esse valor é usado em toda a área de Instalações, Dashboard e Relatórios
            para calcular metragem a partir do valor total (e vice-versa).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSalvar} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="m2-price">Valor por m² (R$)</Label>
              <Input
                id="m2-price"
                type="number"
                step="0.01"
                min="0.01"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="Ex: 20.00"
                className="max-w-xs"
                required
              />
              <p className="text-xs text-muted-foreground">
                Valor atual em uso: <span className="text-foreground font-medium">R$ {price.toFixed(2)}</span>
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="submit" className="gap-2">
                <Save className="w-4 h-4" />
                Salvar
              </Button>
              <Button type="button" variant="outline" onClick={handleRestaurar} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Restaurar padrão (R$ {DEFAULT_M2_PRICE.toFixed(2)})
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Configuracoes;