
import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

interface Cliente {
  id: string;
  nome: string;
}

interface Site {
  id: string;
  clienteId: string;
  clienteNome: string;
  dataInicio: string;
  tipoPlano: 'assinatura-70' | 'assinatura-85' | 'venda-1400';
  status: 'Ativo' | 'Suspenso' | 'Cancelado';
  dataVencimento: string;
  valorMensal: number;
  descricaoProjeto: string;
  urlSite?: string;
  observacoes?: string;
  hospedagem: boolean;
  instalacao: boolean;
  createdAt: string;
}

interface SiteFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (siteData: Omit<Site, 'id' | 'createdAt'>) => void;
  site?: Site;
  clientes: Cliente[];
}

const planoValues: Record<string, number> = {
  'assinatura-70': 70,
  'assinatura-85': 85,
  'venda-1400': 1400
};

const planoLabels: Record<string, string> = {
  'assinatura-70': 'Assinatura R$70/mês',
  'assinatura-85': 'Assinatura R$85/mês',
  'venda-1400': 'Venda R$1.400'
};

export const SiteForm: React.FC<SiteFormProps> = ({
  isOpen,
  onClose,
  onSave,
  site,
  clientes
}) => {
  const [formData, setFormData] = useState({
    clienteId: '',
    clienteNome: '',
    dataInicio: '',
    tipoPlano: 'assinatura-70' as Site['tipoPlano'],
    dataVencimento: '',
    status: 'Ativo' as Site['status'],
    descricaoProjeto: '',
    urlSite: '',
    observacoes: '',
    hospedagem: false,
    instalacao: false
  });

  // useEffect para atualizar o formulário quando o site muda
  useEffect(() => {
    if (site) {
      setFormData({
        clienteId: site.clienteId || '',
        clienteNome: site.clienteNome || '',
        dataInicio: site.dataInicio || '',
        tipoPlano: site.tipoPlano || 'assinatura-70',
        dataVencimento: site.dataVencimento || '',
        status: site.status || 'Ativo',
        descricaoProjeto: site.descricaoProjeto || '',
        urlSite: site.urlSite || '',
        observacoes: site.observacoes || '',
        hospedagem: site.hospedagem || false,
        instalacao: site.instalacao || false
      });
    } else {
      // Reset form quando não há site (novo site)
      setFormData({
        clienteId: '',
        clienteNome: '',
        dataInicio: '',
        tipoPlano: 'assinatura-70',
        dataVencimento: '',
        status: 'Ativo',
        descricaoProjeto: '',
        urlSite: '',
        observacoes: '',
        hospedagem: false,
        instalacao: false
      });
    }
  }, [site]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedCliente = clientes.find(c => c.id === formData.clienteId);
    
    let valorMensal = planoValues[formData.tipoPlano];
    
    // Adicionar valores de hospedagem e instalação
    if (formData.hospedagem) {
      valorMensal += 40;
    }
    if (formData.instalacao) {
      valorMensal += 120;
    }
    
    const siteData = {
      clienteId: formData.clienteId,
      clienteNome: selectedCliente?.nome || formData.clienteNome,
      dataInicio: formData.dataInicio,
      tipoPlano: formData.tipoPlano,
      status: formData.status,
      dataVencimento: formData.dataVencimento,
      valorMensal: valorMensal,
      descricaoProjeto: formData.descricaoProjeto,
      urlSite: formData.urlSite,
      observacoes: formData.observacoes,
      hospedagem: formData.hospedagem,
      instalacao: formData.instalacao
    };

    onSave(siteData);
    onClose();
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Atualizar nome do cliente quando clienteId muda
      if (field === 'clienteId') {
        const selectedCliente = clientes.find(c => c.id === value);
        updated.clienteNome = selectedCliente?.nome || '';
      }
      
      return updated;
    });
  };

  const getValorTotal = () => {
    let total = planoValues[formData.tipoPlano];
    if (formData.hospedagem) total += 40;
    if (formData.instalacao) total += 120;
    return total;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md md:max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg md:text-xl font-semibold">
            {site ? 'Editar Site' : 'Novo Site'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clienteId">Cliente</Label>
                <select
                  id="clienteId"
                  value={formData.clienteId}
                  onChange={(e) => handleInputChange('clienteId', e.target.value)}
                  className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  required
                >
                  <option value="">Selecione um cliente</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataInicio">Data de Início</Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={formData.dataInicio}
                  onChange={(e) => handleInputChange('dataInicio', e.target.value)}
                  required
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricaoProjeto">Descrição do Projeto</Label>
              <Input
                id="descricaoProjeto"
                type="text"
                placeholder="Descreva o projeto do site"
                value={formData.descricaoProjeto}
                onChange={(e) => handleInputChange('descricaoProjeto', e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipoPlano">Tipo de Plano</Label>
                <select
                  id="tipoPlano"
                  value={formData.tipoPlano}
                  onChange={(e) => handleInputChange('tipoPlano', e.target.value)}
                  className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  required
                >
                  {Object.entries(planoLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataVencimento">Data de Vencimento</Label>
                <Input
                  id="dataVencimento"
                  type="date"
                  value={formData.dataVencimento}
                  onChange={(e) => handleInputChange('dataVencimento', e.target.value)}
                  required
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Serviços Adicionais</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hospedagem"
                    checked={formData.hospedagem}
                    onCheckedChange={(checked) => handleInputChange('hospedagem', checked as boolean)}
                  />
                  <Label htmlFor="hospedagem" className="text-sm font-normal">
                    Hospedagem R$40/mês
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="instalacao"
                    checked={formData.instalacao}
                    onCheckedChange={(checked) => handleInputChange('instalacao', checked as boolean)}
                  />
                  <Label htmlFor="instalacao" className="text-sm font-normal">
                    Instalação R$120
                  </Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  required
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Suspenso">Suspenso</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="urlSite">URL do Site</Label>
                <Input
                  id="urlSite"
                  type="url"
                  placeholder="https://exemplo.com"
                  value={formData.urlSite}
                  onChange={(e) => handleInputChange('urlSite', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                placeholder="Observações adicionais (opcional)"
                value={formData.observacoes}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                className="w-full min-h-[80px]"
              />
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Valor Total: <span className="font-semibold text-foreground">R$ {getValorTotal()}</span>
                {(formData.tipoPlano.includes('assinatura') || formData.hospedagem) ? '/mês' : ''}
              </p>
              <div className="text-xs text-muted-foreground mt-1 space-y-1">
                <div>Plano: R$ {planoValues[formData.tipoPlano]}</div>
                {formData.hospedagem && <div>+ Hospedagem: R$ 40/mês</div>}
                {formData.instalacao && <div>+ Instalação: R$ 120</div>}
              </div>
            </div>

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
