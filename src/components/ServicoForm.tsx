import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface Cliente {
  id: string;
  nome: string;
}

export interface Servico {
  id: string;
  user_id: string;
  cliente_id: string;
  cliente_nome: string;
  nome_servico: string;
  valor: number;
  data_servico: string;
  descricao: string;
  status: string;
  pago: boolean;
  recorrente: boolean;
  created_at: string;
  updated_at: string;
}

export type ServicoInput = Omit<Servico, 'id' | 'created_at' | 'updated_at' | 'user_id'>;

interface ServicoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ServicoInput) => void;
  servico?: Servico;
  clientes: Cliente[];
}

export const ServicoForm: React.FC<ServicoFormProps> = ({ isOpen, onClose, onSave, servico, clientes }) => {
  const [formData, setFormData] = useState<ServicoInput>({
    cliente_id: '',
    cliente_nome: '',
    nome_servico: '',
    valor: 0,
    data_servico: new Date().toISOString().split('T')[0],
    descricao: '',
    status: 'Pendente',
    pago: false,
    recorrente: false,
  });

  useEffect(() => {
    if (servico) {
      setFormData({
        cliente_id: servico.cliente_id,
        cliente_nome: servico.cliente_nome,
        nome_servico: servico.nome_servico,
        valor: Number(servico.valor),
        data_servico: servico.data_servico,
        descricao: servico.descricao,
        status: servico.status,
        pago: servico.pago,
        recorrente: servico.recorrente ?? false,
      });
    } else {
      setFormData({
        cliente_id: '',
        cliente_nome: '',
        nome_servico: '',
        valor: 0,
        data_servico: new Date().toISOString().split('T')[0],
        descricao: '',
        status: 'Pendente',
        pago: false,
        recorrente: false,
      });
    }
  }, [servico, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: keyof ServicoInput, value: string | number | boolean) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'cliente_id') {
        const c = clientes.find(c => c.id === value);
        updated.cliente_nome = c?.nome || '';
      }
      if (field === 'status') {
        updated.pago = value === 'Pago';
      }
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cliente_id || !formData.nome_servico || !formData.descricao.trim()) return;
    onSave({ ...formData, valor: Number(formData.valor) });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md md:max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg md:text-xl font-semibold">
            {servico ? 'Editar Serviço' : 'Novo Serviço'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cliente_id">Cliente *</Label>
                <select
                  id="cliente_id"
                  value={formData.cliente_id}
                  onChange={(e) => handleChange('cliente_id', e.target.value)}
                  className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                >
                  <option value="">Selecione um cliente</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_servico">Data do Serviço *</Label>
                <Input
                  id="data_servico"
                  type="date"
                  value={formData.data_servico}
                  onChange={(e) => handleChange('data_servico', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nome_servico">Nome do Serviço *</Label>
              <Input
                id="nome_servico"
                placeholder="Ex: Criação de site, Pintura de sala, Aplicação de papel de parede..."
                value={formData.nome_servico}
                onChange={(e) => handleChange('nome_servico', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valor">Valor cobrado (R$) *</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valor}
                  onChange={(e) => handleChange('valor', parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                >
                  <option value="Pendente">Pendente</option>
                  <option value="Pago">Pago</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição *</Label>
              <Textarea
                id="descricao"
                placeholder="Descreva o serviço realizado"
                value={formData.descricao}
                onChange={(e) => handleChange('descricao', e.target.value)}
                required
                className="min-h-[100px]"
              />
            </div>

            <label className="flex items-center gap-3 p-3 border border-input rounded-md cursor-pointer hover:bg-accent/30 transition-colors">
              <input
                type="checkbox"
                checked={formData.recorrente}
                onChange={(e) => handleChange('recorrente', e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">Serviço recorrente (mensal)</div>
                <div className="text-xs text-muted-foreground">Marque para serviços contínuos como hospedagem, manutenção, etc.</div>
              </div>
            </label>

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button type="submit" className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 sm:flex-none">
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
