
import React from 'react';
import { Edit, Trash2, Mail, Phone, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Cliente {
  id: string;
  nome: string;
  cpf_cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface ClienteCardProps {
  cliente: Cliente;
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: string) => void;
}

export const ClienteCard: React.FC<ClienteCardProps> = ({ cliente, onEdit, onDelete }) => {
  return (
    <Card className="card-tech">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-foreground mb-1">{cliente.nome}</h3>
            <p className="text-sm text-muted-foreground">
              {cliente.cpf_cnpj.length > 4 
                ? '•'.repeat(cliente.cpf_cnpj.length - 4) + cliente.cpf_cnpj.slice(-4)
                : cliente.cpf_cnpj}
            </p>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(cliente)}
              className="p-2 text-orange-500 hover:bg-orange-500/10 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(cliente.id)}
              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">{cliente.email}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{cliente.telefone}</span>
          </div>
          <div className="flex items-start text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2">
              {cliente.endereco}, {cliente.cidade} - {cliente.estado}, {cliente.cep}
            </span>
          </div>
        </div>

        {cliente.observacoes && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-sm text-muted-foreground line-clamp-2">
              <strong>Obs:</strong> {cliente.observacoes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
