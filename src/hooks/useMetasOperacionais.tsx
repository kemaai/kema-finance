import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface MetasOperacionais {
  /** Meta de receita mensal (R$) */
  metaReceita: number | null;
  /** Teto de custo mensal (R$) — despesas fixas + gastos diários */
  metaCusto: number | null;
  /** ISO date da última atualização */
  atualizadoEm: string | null;
}

const STORAGE_KEY = 'kema_metas_operacionais';

const EMPTY: MetasOperacionais = { metaReceita: null, metaCusto: null, atualizadoEm: null };

export function useMetasOperacionais() {
  const [metas, setMetas] = useLocalStorage<MetasOperacionais>(STORAGE_KEY, EMPTY);

  const salvarMetas = useCallback(
    (metaReceita: number | null, metaCusto: number | null) => {
      setMetas({
        metaReceita: metaReceita && metaReceita > 0 ? metaReceita : null,
        metaCusto: metaCusto && metaCusto > 0 ? metaCusto : null,
        atualizadoEm: new Date().toISOString(),
      });
    },
    [setMetas]
  );

  const limparMetas = useCallback(() => setMetas(EMPTY), [setMetas]);

  const definidas = metas.metaReceita !== null || metas.metaCusto !== null;

  return { metas, definidas, salvarMetas, limparMetas };
}
