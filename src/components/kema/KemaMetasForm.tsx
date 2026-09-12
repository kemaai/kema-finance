import React, { useState } from 'react';
import { Target, Scissors, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useKemaAgent } from '@/contexts/KemaAgentContext';
import { formatBRL } from '@/lib/format';

const parse = (v: string): number | null => {
  const n = Number(String(v).replace(/\./g, '').replace(',', '.').replace(/[^0-9.-]/g, ''));
  return isNaN(n) || n <= 0 ? null : n;
};

export const KemaMetasForm: React.FC = () => {
  const { metas, metasDefinidas, salvarMetas, pedirPlanoDeCortes } = useKemaAgent();
  const [editando, setEditando] = useState(!metasDefinidas);
  const [receita, setReceita] = useState(metas.metaReceita ? String(metas.metaReceita) : '');
  const [custo, setCusto] = useState(metas.metaCusto ? String(metas.metaCusto) : '');

  const salvar = (e: React.FormEvent) => {
    e.preventDefault();
    const r = parse(receita);
    const c = parse(custo);
    if (r === null && c === null) return;
    salvarMetas(r, c);
    setEditando(false);
    pedirPlanoDeCortes();
  };

  if (!editando && metasDefinidas) {
    return (
      <div className="rounded-xl border border-primary/30 bg-primary/[0.06] p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-primary flex-shrink-0" />
          <p className="text-xs text-foreground min-w-0">
            Meta de receita:{' '}
            <strong>{metas.metaReceita ? formatBRL(metas.metaReceita) : 'não definida'}</strong> · Teto de custo:{' '}
            <strong>{metas.metaCusto ? formatBRL(metas.metaCusto) : 'não definido'}</strong>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" className="h-7 rounded-full text-xs" onClick={pedirPlanoDeCortes}>
            <Scissors className="w-3 h-3 mr-1" />
            Plano de cortes
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 rounded-full text-xs"
            onClick={() => setEditando(true)}
          >
            <Pencil className="w-3 h-3 mr-1" />
            Alterar metas
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={salvar} className="rounded-xl border border-border bg-muted/30 p-3 space-y-2.5">
      <div className="flex items-center gap-2">
        <Target className="w-4 h-4 text-primary flex-shrink-0" />
        <p className="text-xs font-semibold text-foreground">Quais são suas metas do mês?</p>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Com elas eu calculo quanto falta de receita e quanto cortar, em reais.
      </p>
      <div className="grid grid-cols-1 gap-2">
        <label className="text-[11px] text-muted-foreground">
          Meta de receita mensal (R$)
          <Input
            inputMode="decimal"
            value={receita}
            onChange={e => setReceita(e.target.value)}
            placeholder="Ex: 15000"
            data-testid="kema-meta-receita"
            className="mt-1 input-tech h-9"
          />
        </label>
        <label className="text-[11px] text-muted-foreground">
          Teto de custo mensal (R$)
          <Input
            inputMode="decimal"
            value={custo}
            onChange={e => setCusto(e.target.value)}
            placeholder="Ex: 8000"
            data-testid="kema-meta-custo"
            className="mt-1 input-tech h-9"
          />
        </label>
      </div>
      <Button
        type="submit"
        size="sm"
        className="w-full h-8 rounded-full text-xs"
        data-testid="kema-meta-salvar"
        disabled={parse(receita) === null && parse(custo) === null}
      >
        Salvar metas e ver cortes sugeridos
      </Button>
    </form>
  );
};
