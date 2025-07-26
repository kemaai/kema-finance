
import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Instalacao {
  id: string;
  numeroPedido: string;
  dataInstalacao: string;
  arquitetoNome: string;
  ambiente: string;
  endereco: string;
  valorTotal: number;
  status: 'Agendado' | 'Em Andamento' | 'Concluído' | 'Cancelado';
}

interface InstalacaoFormProps {
  onSave: (instalacao: Instalacao) => void;
  onCancel: () => void;
  instalacao?: Instalacao;
}

export const InstalacaoForm: React.FC<InstalacaoFormProps> = ({
  onSave,
  onCancel,
  instalacao
}) => {
  const [formData, setFormData] = useState({
    numeroPedido: instalacao?.numeroPedido || '',
    dataInstalacao: instalacao?.dataInstalacao || '',
    arquitetoNome: instalacao?.arquitetoNome || '',
    ambiente: instalacao?.ambiente || '',
    endereco: instalacao?.endereco || '',
    metragem: instalacao ? instalacao.valorTotal / 20 : 0, // Assumindo R$ 20 por m²
    status: instalacao?.status || 'Agendado' as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const instalacaoData: Instalacao = {
      id: instalacao?.id || `inst_${Date.now()}`,
      numeroPedido: formData.numeroPedido,
      dataInstalacao: formData.dataInstalacao,
      arquitetoNome: formData.arquitetoNome,
      ambiente: formData.ambiente,
      endereco: formData.endereco,
      valorTotal: formData.metragem * 20, // R$ 20 por m²
      status: formData.status
    };

    onSave(instalacaoData);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <Card className="w-full max-w-2xl mx-auto">
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
                <Label htmlFor="numeroPedido">Número do Pedido</Label>
                <Input
                  id="numeroPedido"
                  type="text"
                  placeholder="Ex: PED-2024-001"
                  value={formData.numeroPedido}
                  onChange={(e) => handleInputChange('numeroPedido', e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataInstalacao">Data da Instalação</Label>
                <Input
                  id="dataInstalacao"
                  type="date"
                  value={formData.dataInstalacao}
                  onChange={(e) => handleInputChange('dataInstalacao', e.target.value)}
                  required
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="arquitetoNome">Nome do Arquiteto</Label>
              <Input
                id="arquitetoNome"
                type="text"
                placeholder="Digite o nome do arquiteto"
                value={formData.arquitetoNome}
                onChange={(e) => handleInputChange('arquitetoNome', e.target.value)}
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
                value={formData.metragem}
                onChange={(e) => handleInputChange('metragem', parseFloat(e.target.value) || 0)}
                required
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Valor: R$ {(formData.metragem * 20).toFixed(2)} (R$ 20,00 por m²)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                required
              >
                <option value="Agendado">Agendado</option>
                <option value="Em Andamento">Em Andamento</option>
                <option value="Concluído">Concluído</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button type="submit" className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1 sm:flex-none">
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
