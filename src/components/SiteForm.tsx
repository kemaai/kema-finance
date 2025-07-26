
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
  cliente_id: string;
  cliente_nome: string;
  data_inicio: string;
  tipo_plano: 'assinatura-70' | 'assinatura-85' | 'venda-1400';
  status: 'Ativo' | 'Suspenso' | 'Cancelado';
  data_vencimento: string;
  valor_mensal: number;
  descricao_projeto: string;
  url_site?: string;
  observacoes?: string;
  hospedagem: boolean;
  instalacao: boolean;
  created_at: string;
}

interface SiteFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (siteData: Omit<Site, 'id' | 'created_at'>) => void;
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
    cliente_id: '',
    cliente_nome: '',
    data_inicio: '',
    tipo_plano: 'assinatura-70' as Site['tipo_plano'],
    data_vencimento: '',
    status: 'Ativo' as Site['status'],
    descricao_projeto: '',
    url_site: '',
    observacoes: '',
    hospedagem: false,
    instalacao: false
  });

  // useEffect para atualizar o formulário quando o site muda
  useEffect(() => {
    if (site) {
      setFormData({
        cliente_id: site.cliente_id || '',
        cliente_nome: site.cliente_nome || '',
        data_inicio: site.data_inicio || '',
        tipo_plano: site.tipo_plano || 'assinatura-70',
        data_vencimento: site.data_vencimento || '',
        status: site.status || 'Ativo',
        descricao_projeto: site.descricao_projeto || '',
        url_site: site.url_site || '',
        observacoes: site.observacoes || '',
        hospedagem: site.hospedagem || false,
        instalacao: site.instalacao || false
      });
    } else {
      // Reset form quando não há site (novo site)
      setFormData({
        cliente_id: '',
        cliente_nome: '',
        data_inicio: '',
        tipo_plano: 'assinatura-70',
        data_vencimento: '',
        status: 'Ativo',
        descricao_projeto: '',
        url_site: '',
        observacoes: '',
        hospedagem: false,
        instalacao: false
      });
    }
  }, [site]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedCliente = clientes.find(c => c.id === formData.cliente_id);
    
    let valorMensal = planoValues[formData.tipo_plano];
    
    // Adicionar valores de hospedagem e instalação
    if (formData.hospedagem) {
      valorMensal += 40;
    }
    if (formData.instalacao) {
      valorMensal += 120;
    }
    
    const siteData = {
      cliente_id: formData.cliente_id,
      cliente_nome: selectedCliente?.nome || formData.cliente_nome,
      data_inicio: formData.data_inicio,
      tipo_plano: formData.tipo_plano,
      status: formData.status,
      data_vencimento: formData.data_vencimento,
      valor_mensal: valorMensal,
      descricao_projeto: formData.descricao_projeto,
      url_site: formData.url_site,
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
      
      // Atualizar nome do cliente quando cliente_id muda
      if (field === 'cliente_id') {
        const selectedCliente = clientes.find(c => c.id === value);
        updated.cliente_nome = selectedCliente?.nome || '';
      }
      
      return updated;
    });
  };

  const getValorTotal = () => {
    let total = planoValues[formData.tipo_plano];
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
                <Label htmlFor="cliente_id">Cliente</Label>
                <select
                  id="cliente_id"
                  value={formData.cliente_id}
                  onChange={(e) => handleInputChange('cliente_id', e.target.value)}
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
                <Label htmlFor="data_inicio">Data de Início</Label>
                <Input
                  id="data_inicio"
                  type="date"
                  value={formData.data_inicio}
                  onChange={(e) => handleInputChange('data_inicio', e.target.value)}
                  required
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao_projeto">Descrição do Projeto</Label>
              <Input
                id="descricao_projeto"
                type="text"
                placeholder="Descreva o projeto do site"
                value={formData.descricao_projeto}
                onChange={(e) => handleInputChange('descricao_projeto', e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo_plano">Tipo de Plano</Label>
                <select
                  id="tipo_plano"
                  value={formData.tipo_plano}
                  onChange={(e) => handleInputChange('tipo_plano', e.target.value)}
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
                <Label htmlFor="data_vencimento">Data de Vencimento</Label>
                <Input
                  id="data_vencimento"
                  type="date"
                  value={formData.data_vencimento}
                  onChange={(e) => handleInputChange('data_vencimento', e.target.value)}
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
                <Label htmlFor="url_site">URL do Site</Label>
                <Input
                  id="url_site"
                  type="url"
                  placeholder="https://exemplo.com"
                  value={formData.url_site}
                  onChange={(e) => handleInputChange('url_site', e.target.value)}
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
                {(formData.tipo_plano.includes('assinatura') || formData.hospedagem) ? '/mês' : ''}
              </p>
              <div className="text-xs text-muted-foreground mt-1 space-y-1">
                <div>Plano: R$ {planoValues[formData.tipo_plano]}</div>
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
