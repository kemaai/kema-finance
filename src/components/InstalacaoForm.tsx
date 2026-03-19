
import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Instalacao {
  id: string;
  user_id: string;
  numero_pedido: string;
  endereco: string;
  ambiente: string;
  arquiteto_nome: string;
  data_instalacao: string;
  valor_total: number;
  status: string;
  pedido_recebido: boolean;
  created_at: string;
  updated_at: string;
}

interface InstalacaoFormProps {
  instalacao?: Instalacao | null;
  onSubmit: (instalacao: Instalacao | Omit<Instalacao, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const InstalacaoForm: React.FC<InstalacaoFormProps> = ({
  instalacao,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    numero_pedido: '',
    data_instalacao: '',
    arquiteto_nome: '',
    ambiente: '',
    endereco: '',
    valor_total: 0,
    status: 'Agendado',
    pedido_recebido: false
  });

  useEffect(() => {
    if (instalacao) {
      setFormData({
        numero_pedido: instalacao.numero_pedido || '',
        data_instalacao: instalacao.data_instalacao || '',
        arquiteto_nome: instalacao.arquiteto_nome || '',
        ambiente: instalacao.ambiente || '',
        endereco: instalacao.endereco || '',
        valor_total: instalacao.valor_total || 0,
        status: instalacao.status || 'Agendado',
        pedido_recebido: instalacao.pedido_recebido || false
      });
    } else {
      setFormData({
        numero_pedido: '',
        data_instalacao: '',
        arquiteto_nome: '',
        ambiente: '',
        endereco: '',
        valor_total: 0,
        status: 'Agendado',
        pedido_recebido: false
      });
    }
  }, [instalacao]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (instalacao) {
      // Editing existing instalacao
      onSubmit({
        ...instalacao,
        ...formData
      });
    } else {
      // Creating new instalacao
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const metragem = formData.valor_total / 24;

  return (
    <Card className="card-tech w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg md:text-xl font-semibold">
          {instalacao ? 'Editar Instalação' : 'Nova Instalação'}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numero_pedido">Número do Pedido</Label>
              <Input
                id="numero_pedido"
                type="text"
                placeholder="Ex: PED-2024-001"
                value={formData.numero_pedido}
                onChange={(e) => handleInputChange('numero_pedido', e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_instalacao">Data da Instalação</Label>
              <Input
                id="data_instalacao"
                type="date"
                value={formData.data_instalacao}
                onChange={(e) => handleInputChange('data_instalacao', e.target.value)}
                required
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="arquiteto_nome">Nome do Arquiteto</Label>
            <Input
              id="arquiteto_nome"
              type="text"
              placeholder="Digite o nome do arquiteto"
              value={formData.arquiteto_nome}
              onChange={(e) => handleInputChange('arquiteto_nome', e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ambiente">Ambiente</Label>
            <Input
              id="ambiente"
              type="text"
              placeholder="Ex: Sala de estar, Quarto, etc."
              value={formData.ambiente}
              onChange={(e) => handleInputChange('ambiente', e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              type="text"
              placeholder="Digite o endereço completo da instalação"
              value={formData.endereco}
              onChange={(e) => handleInputChange('endereco', e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="metragem">Metragem (m²)</Label>
            <Input
              id="metragem"
              type="number"
              step="0.1"
              min="0"
              placeholder="0.0"
              value={metragem}
              onChange={(e) => handleInputChange('valor_total', (parseFloat(e.target.value) || 0) * 24)}
              required
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Valor: R$ {formData.valor_total.toFixed(2)} (R$ 24,00 por m²)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="input-tech w-full h-10 px-3 py-2 text-sm rounded-md"
              required
            >
              <option value="Agendado">Agendado</option>
              <option value="Em Andamento">Em Andamento</option>
              <option value="Concluído">Concluído</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button type="submit" className="btn-tech flex-1" disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1 sm:flex-none">
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
