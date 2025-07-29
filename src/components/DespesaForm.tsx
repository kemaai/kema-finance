import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const formSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  valor: z.string().min(1, 'Valor é obrigatório'),
  data_vencimento: z.string().min(1, 'Data de vencimento é obrigatória'),
  anotacao: z.string().optional(),
  paga: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

interface Despesa {
  id: string;
  nome: string;
  valor: number;
  data_vencimento: string;
  anotacao?: string;
  paga: boolean;
}

interface DespesaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Despesa, 'id'>) => void;
  despesa?: Despesa | null;
}

export const DespesaForm: React.FC<DespesaFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  despesa,
}) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: despesa?.nome || '',
      valor: despesa?.valor?.toString() || '',
      data_vencimento: despesa?.data_vencimento || '',
      anotacao: despesa?.anotacao || '',
      paga: despesa?.paga || false,
    },
  });

  React.useEffect(() => {
    if (despesa) {
      form.reset({
        nome: despesa.nome,
        valor: despesa.valor.toString(),
        data_vencimento: despesa.data_vencimento,
        anotacao: despesa.anotacao || '',
        paga: despesa.paga,
      });
    } else {
      form.reset({
        nome: '',
        valor: '',
        data_vencimento: '',
        anotacao: '',
        paga: false,
      });
    }
  }, [despesa, form]);

  const handleSubmit = (data: FormData) => {
    onSubmit({
      nome: data.nome,
      valor: parseFloat(data.valor),
      data_vencimento: data.data_vencimento,
      anotacao: data.anotacao,
      paga: data.paga,
    });
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {despesa ? 'Editar Despesa' : 'Nova Despesa'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Conta</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Água, Luz, Internet..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="valor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="data_vencimento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Vencimento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="anotacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Anotação (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observações adicionais..."
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paga"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Conta já paga</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                {despesa ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};