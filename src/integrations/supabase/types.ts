export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      clientes: {
        Row: {
          cep: string
          cidade: string
          cpf_cnpj: string
          created_at: string
          email: string
          endereco: string
          estado: string
          id: string
          nome: string
          observacoes: string | null
          telefone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cep: string
          cidade: string
          cpf_cnpj: string
          created_at?: string
          email: string
          endereco: string
          estado: string
          id?: string
          nome: string
          observacoes?: string | null
          telefone: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cep?: string
          cidade?: string
          cpf_cnpj?: string
          created_at?: string
          email?: string
          endereco?: string
          estado?: string
          id?: string
          nome?: string
          observacoes?: string | null
          telefone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      despesas: {
        Row: {
          anotacao: string | null
          created_at: string
          data_vencimento: string
          id: string
          nome: string
          paga: boolean
          updated_at: string
          user_id: string
          valor: number
        }
        Insert: {
          anotacao?: string | null
          created_at?: string
          data_vencimento: string
          id?: string
          nome: string
          paga?: boolean
          updated_at?: string
          user_id: string
          valor?: number
        }
        Update: {
          anotacao?: string | null
          created_at?: string
          data_vencimento?: string
          id?: string
          nome?: string
          paga?: boolean
          updated_at?: string
          user_id?: string
          valor?: number
        }
        Relationships: []
      }
      dividas_negativadas: {
        Row: {
          created_at: string
          data_pagamento: string | null
          id: string
          nome: string
          pago: boolean
          updated_at: string
          user_id: string
          valor_atual: number
          valor_original: number
        }
        Insert: {
          created_at?: string
          data_pagamento?: string | null
          id?: string
          nome: string
          pago?: boolean
          updated_at?: string
          user_id: string
          valor_atual?: number
          valor_original?: number
        }
        Update: {
          created_at?: string
          data_pagamento?: string | null
          id?: string
          nome?: string
          pago?: boolean
          updated_at?: string
          user_id?: string
          valor_atual?: number
          valor_original?: number
        }
        Relationships: []
      }
      emprestimos: {
        Row: {
          created_at: string
          id: string
          nome: string
          updated_at: string
          user_id: string
          valor_atual: number
          valor_original: number
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
          user_id: string
          valor_atual?: number
          valor_original?: number
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
          user_id?: string
          valor_atual?: number
          valor_original?: number
        }
        Relationships: []
      }
      instalacoes: {
        Row: {
          ambiente: string
          arquiteto_nome: string
          created_at: string
          data_instalacao: string
          endereco: string
          id: string
          numero_pedido: string
          status: string
          updated_at: string
          user_id: string
          valor_total: number
        }
        Insert: {
          ambiente: string
          arquiteto_nome: string
          created_at?: string
          data_instalacao: string
          endereco: string
          id?: string
          numero_pedido: string
          status: string
          updated_at?: string
          user_id: string
          valor_total: number
        }
        Update: {
          ambiente?: string
          arquiteto_nome?: string
          created_at?: string
          data_instalacao?: string
          endereco?: string
          id?: string
          numero_pedido?: string
          status?: string
          updated_at?: string
          user_id?: string
          valor_total?: number
        }
        Relationships: []
      }
      pagamentos_emprestimo: {
        Row: {
          created_at: string
          data_pagamento: string
          emprestimo_id: string
          id: string
          valor_pago: number
        }
        Insert: {
          created_at?: string
          data_pagamento: string
          emprestimo_id: string
          id?: string
          valor_pago?: number
        }
        Update: {
          created_at?: string
          data_pagamento?: string
          emprestimo_id?: string
          id?: string
          valor_pago?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_emprestimo_emprestimo_id_fkey"
            columns: ["emprestimo_id"]
            isOneToOne: false
            referencedRelation: "emprestimos"
            referencedColumns: ["id"]
          },
        ]
      }
      sites: {
        Row: {
          cliente_id: string
          cliente_nome: string
          created_at: string
          data_inicio: string
          data_vencimento: string
          descricao_projeto: string
          hospedagem: boolean
          id: string
          instalacao: boolean
          observacoes: string | null
          status: string
          tipo_plano: string
          updated_at: string
          url_site: string | null
          user_id: string
          valor_mensal: number
        }
        Insert: {
          cliente_id: string
          cliente_nome: string
          created_at?: string
          data_inicio: string
          data_vencimento: string
          descricao_projeto: string
          hospedagem?: boolean
          id?: string
          instalacao?: boolean
          observacoes?: string | null
          status: string
          tipo_plano: string
          updated_at?: string
          url_site?: string | null
          user_id: string
          valor_mensal: number
        }
        Update: {
          cliente_id?: string
          cliente_nome?: string
          created_at?: string
          data_inicio?: string
          data_vencimento?: string
          descricao_projeto?: string
          hospedagem?: boolean
          id?: string
          instalacao?: boolean
          observacoes?: string | null
          status?: string
          tipo_plano?: string
          updated_at?: string
          url_site?: string | null
          user_id?: string
          valor_mensal?: number
        }
        Relationships: [
          {
            foreignKeyName: "sites_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
