import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CATEGORIAS_GASTO, FORMAS_PAGAMENTO, getCategoria } from '@/lib/gastosCategorias';
import type { GastoDiario } from '@/hooks/useSupabaseData';

const formSchema = z.object({
  descricao: z.string().trim().min(1, 'Descreva o gasto').max(120, 'Máximo de 120 caracteres'),
  valor: z.string().min(1, 'Informe o valor'),
  data_gasto: z.string().min(1, 'Informe a data'),
  categoria: z.string().min(1, 'Selecione a categoria'),
  forma_pagamento: z.string().min(1, 'Selecione a forma de pagamento'),
  essencial: z.boolean().default(true),
  observacao: z.string().max(500).optional(),
});

type FormData = z.infer<typeof formSchema>;

export interface GastoDiarioInput {
  descricao: string;
  valor: number;
  data_gasto: string;
  categoria: string;
  forma_pagamento: string;
  essencial: boolean;
  observacao?: string;
}

interface GastoDiarioFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GastoDiarioInput) => void;
  gasto?: GastoDiario | null;
}

export const GastoDiarioForm: React.FC<GastoDiarioFormProps> = ({ isOpen, onClose, onSubmit, gasto }) => {
  const hoje = format(new Date(), 'yyyy-MM-dd');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      descricao: '',
      valor: '',
      data_gasto: hoje,
      categoria: 'Alimentação',
      forma_pagamento: 'Pix',
      essencial: true,
      observacao: '',
    },
  });

  React.useEffect(() => {
    if (!isOpen) return;
    if (gasto) {
      form.reset({
        descricao: gasto.descricao,
        valor: String(gasto.valor),
        data_gasto: gasto.data_gasto,
        categoria: gasto.categoria,
        forma_pagamento: gasto.forma_pagamento,
        essencial: gasto.essencial,
        observacao: gasto.observacao || '',
      });
    } else {
      form.reset({
        descricao: '',
        valor: '',
        data_gasto: hoje,
        categoria: 'Alimentação',
        forma_pagamento: 'Pix',
        essencial: true,
        observacao: '',
      });
    }
  }, [gasto, isOpen, form, hoje]);

  const handleSubmit = (data: FormData) => {
    onSubmit({
      descricao: data.descricao.trim(),
      valor: parseFloat(data.valor.replace(',', '.')) || 0,
      data_gasto: data.data_gasto,
      categoria: data.categoria,
      forma_pagamento: data.forma_pagamento,
      essencial: data.essencial,
      observacao: data.observacao?.trim() || undefined,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[460px] max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{gasto ? 'Editar gasto diário' : 'Novo gasto diário'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form id="gasto-diario-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Com o que você gastou?</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Almoço, Uber, Padaria..." autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" inputMode="decimal" step="0.01" placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data_gasto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="categoria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(v) => {
                      field.onChange(v);
                      form.setValue('essencial', getCategoria(v).essencialPadrao);
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-64">
                      {CATEGORIAS_GASTO.map(c => (
                        <SelectItem key={c.nome} value={c.nome}>
                          {c.emoji} {c.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="forma_pagamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forma de pagamento</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {FORMAS_PAGAMENTO.map(f => (
                        <SelectItem key={f} value={f}>{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="essencial"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
                  <div className="min-w-0">
                    <FormLabel>Gasto essencial</FormLabel>
                    <FormDescription className="text-xs">
                      Desligue para marcar como supérfluo — o KEMA AI usa isso para sugerir cortes.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observação (opcional)</FormLabel>
                  <FormControl>
                    <Textarea rows={2} placeholder="Detalhes do gasto..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              <Button type="submit" data-testid="salvar-gasto">{gasto ? 'Atualizar' : 'Salvar gasto'}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
