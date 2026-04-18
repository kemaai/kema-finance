import { z } from 'zod';

// CPF/CNPJ validation with check digits
export const validateCpfCnpj = (value: string): boolean => {
  const cleaned = value.replace(/[^\d]/g, '');
  
  if (cleaned.length === 11) {
    // CPF validation
    if (/^(\d)\1{10}$/.test(cleaned)) return false;
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleaned.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cleaned.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleaned.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    return digit === parseInt(cleaned.charAt(10));
  } else if (cleaned.length === 14) {
    // CNPJ validation
    if (/^(\d)\1{13}$/.test(cleaned)) return false;
    
    let sum = 0;
    let weights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleaned.charAt(i)) * weights[i];
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cleaned.charAt(12))) return false;
    
    sum = 0;
    weights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cleaned.charAt(i)) * weights[i];
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    return digit === parseInt(cleaned.charAt(13));
  }
  
  return false;
};

// Cliente validation schema
export const clienteSchema = z.object({
  nome: z.string()
    .trim()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(200, 'Nome deve ter no máximo 200 caracteres'),
  cpf_cnpj: z.string()
    .trim()
    .refine((val) => {
      const cleaned = val.replace(/[^\d]/g, '');
      return cleaned.length === 11 || cleaned.length === 14;
    }, 'CPF deve ter 11 dígitos ou CNPJ 14 dígitos')
    .refine(validateCpfCnpj, 'CPF/CNPJ inválido'),
  email: z.string()
    .trim()
    .email('Email inválido')
    .max(255, 'Email deve ter no máximo 255 caracteres'),
  telefone: z.string()
    .trim()
    .regex(/^[\d\s\(\)\-]{10,15}$/, 'Telefone inválido')
    .max(20, 'Telefone deve ter no máximo 20 caracteres'),
  cep: z.string()
    .trim()
    .regex(/^\d{5}-?\d{3}$/, 'CEP inválido (formato: 00000-000)'),
  endereco: z.string()
    .trim()
    .min(5, 'Endereço deve ter pelo menos 5 caracteres')
    .max(500, 'Endereço deve ter no máximo 500 caracteres'),
  cidade: z.string()
    .trim()
    .min(2, 'Cidade deve ter pelo menos 2 caracteres')
    .max(100, 'Cidade deve ter no máximo 100 caracteres'),
  estado: z.string()
    .length(2, 'Estado deve ter 2 letras')
    .regex(/^[A-Z]{2}$/, 'Use sigla do estado em maiúsculas (ex: SP, RJ)'),
  observacoes: z.string()
    .max(1000, 'Observações devem ter no máximo 1000 caracteres')
    .optional()
});

// Site validation schema
export const siteSchema = z.object({
  cliente_id: z.string().uuid('Cliente inválido'),
  cliente_nome: z.string().min(1, 'Nome do cliente é obrigatório'),
  data_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  tipo_plano: z.enum(['assinatura-70', 'assinatura-85', 'venda-1400'], {
    errorMap: () => ({ message: 'Tipo de plano inválido' })
  }),
  status: z.enum(['Ativo', 'Suspenso', 'Cancelado'], {
    errorMap: () => ({ message: 'Status inválido' })
  }),
  data_vencimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  valor_mensal: z.number()
    .min(0, 'Valor mensal deve ser positivo')
    .max(100000, 'Valor mensal deve ser menor que R$ 100.000'),
  descricao_projeto: z.string()
    .trim()
    .min(3, 'Descrição deve ter pelo menos 3 caracteres')
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres'),
  url_site: z.string()
    .trim()
    .url('URL inválida')
    .max(500, 'URL deve ter no máximo 500 caracteres')
    .optional()
    .or(z.literal('')),
  observacoes: z.string()
    .max(1000, 'Observações devem ter no máximo 1000 caracteres')
    .optional(),
  hospedagem: z.boolean(),
  instalacao: z.boolean()
});

// Instalacao validation schema
export const instalacaoSchema = z.object({
  numero_pedido: z.string()
    .trim()
    .min(3, 'Número do pedido deve ter pelo menos 3 caracteres')
    .max(50, 'Número do pedido deve ter no máximo 50 caracteres'),
  data_instalacao: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  arquiteto_nome: z.string()
    .trim()
    .min(3, 'Nome do arquiteto deve ter pelo menos 3 caracteres')
    .max(200, 'Nome do arquiteto deve ter no máximo 200 caracteres'),
  ambiente: z.string()
    .trim()
    .min(2, 'Ambiente deve ter pelo menos 2 caracteres')
    .max(200, 'Ambiente deve ter no máximo 200 caracteres'),
  endereco: z.string()
    .trim()
    .min(5, 'Endereço deve ter pelo menos 5 caracteres')
    .max(500, 'Endereço deve ter no máximo 500 caracteres'),
  valor_total: z.number()
    .min(0, 'Valor total deve ser positivo')
    .max(1000000, 'Valor total deve ser menor que R$ 1.000.000'),
  status: z.string()
    .min(1, 'Status é obrigatório')
    .max(50, 'Status deve ter no máximo 50 caracteres'),
  pedido_recebido: z.boolean()
});

// Pagamento emprestimo validation
export const pagamentoEmprestimoSchema = z.object({
  valor_pago: z.number()
    .positive('Valor deve ser positivo')
    .max(1000000, 'Valor deve ser menor que R$ 1.000.000'),
  data_pagamento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida')
});

export const profileSchema = z.object({
  full_name: z.string()
    .trim()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
});

export const emailUpdateSchema = z.object({
  email: z.string()
    .trim()
    .email('Email inválido')
    .max(255, 'Email deve ter no máximo 255 caracteres'),
});

export const passwordUpdateSchema = z.object({
  password: z.string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .max(72, 'Senha deve ter no máximo 72 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter ao menos uma letra maiúscula')
    .regex(/[0-9]/, 'Senha deve conter ao menos um número'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

export type ClienteFormData = z.infer<typeof clienteSchema>;
export type SiteFormData = z.infer<typeof siteSchema>;
export type InstalacaoFormData = z.infer<typeof instalacaoSchema>;
export type PagamentoEmprestimoFormData = z.infer<typeof pagamentoEmprestimoSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type EmailUpdateFormData = z.infer<typeof emailUpdateSchema>;
export type PasswordUpdateFormData = z.infer<typeof passwordUpdateSchema>;
