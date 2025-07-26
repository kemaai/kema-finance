
import React, { useState } from 'react';
import { Users, Edit, Trash2, ChevronDown, ChevronUp, Mail, Phone, MapPin, Calendar } from 'lucide-react';

interface Cliente {
  id: string;
  nome: string;
  cpfCnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  observacoes?: string;
  createdAt: string;
}

interface ClienteCardProps {
  cliente: Cliente;
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: string) => void;
}

export const ClienteCard: React.FC<ClienteCardProps> = ({ cliente, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
      {/* Card Header - Always Visible */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{cliente.nome}</h3>
            <p className="text-sm text-muted-foreground truncate">{cliente.cpfCnpj}</p>
          </div>
          <Users className="w-5 h-5 text-muted-foreground flex-shrink-0 ml-2" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-1">
              <Mail className="w-3 h-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground truncate">{cliente.email}</p>
            </div>
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{cliente.telefone}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-2">
            <button
              onClick={() => onEdit(cliente)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(cliente.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-border bg-gray-50">
          <div className="pt-3 space-y-3">
            <div>
              <div className="flex items-center gap-1 mb-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground text-sm font-medium">Endereço Completo:</span>
              </div>
              <p className="text-sm ml-5">{cliente.endereco}</p>
              <p className="text-sm ml-5">{cliente.cidade} - {cliente.estado}</p>
              <p className="text-sm ml-5">CEP: {cliente.cep}</p>
            </div>
            
            {cliente.observacoes && (
              <div>
                <span className="text-muted-foreground text-sm font-medium">Observações:</span>
                <p className="text-sm mt-1">{cliente.observacoes}</p>
              </div>
            )}
            
            <div>
              <div className="flex items-center gap-1 mb-1">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground text-sm font-medium">Cadastrado em:</span>
              </div>
              <p className="text-sm ml-5">{new Date(cliente.createdAt).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
