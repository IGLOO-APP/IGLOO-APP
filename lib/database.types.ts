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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      contracts: {
        Row: {
          contract_number: string | null
          created_at: string
          end_date: string
          history: Json | null
          id: string
          monthly_value: number
          owner_id: string
          payment_day: number | null
          pdf_url: string | null
          property_id: string
          signers: Json | null
          start_date: string
          status: string | null
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          contract_number?: string | null
          created_at?: string
          end_date: string
          history?: Json | null
          id?: string
          monthly_value: number
          owner_id: string
          payment_day?: number | null
          pdf_url?: string | null
          property_id: string
          signers?: Json | null
          start_date: string
          status?: string | null
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          contract_number?: string | null
          created_at?: string
          end_date?: string
          history?: Json | null
          id?: string
          monthly_value?: number
          owner_id?: string
          payment_day?: number | null
          pdf_url?: string | null
          property_id?: string
          signers?: Json | null
          start_date?: string
          status?: string | null
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string
          id: string
          is_read: boolean | null
          sender_id: string | null
          sender_role: string | null
          type: string | null
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_id?: string | null
          sender_role?: string | null
          type?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_id?: string | null
          sender_role?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          category: string | null
          created_at: string
          id: string
          last_message: string | null
          last_message_at: string | null
          owner_id: string | null
          property_id: string | null
          tenant_id: string | null
          unread_count_owner: number | null
          unread_count_tenant: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          owner_id?: string | null
          property_id?: string | null
          tenant_id?: string | null
          unread_count_owner?: number | null
          unread_count_tenant?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          owner_id?: string | null
          property_id?: string | null
          tenant_id?: string | null
          unread_count_owner?: number | null
          unread_count_tenant?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          created_at: string
          id: string
          is_active: boolean | null
          order: number | null
          question: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          order?: number | null
          question: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          order?: number | null
          question?: string
        }
        Relationships: []
      }
      financial_transactions: {
        Row: {
          amount: number
          attachment_url: string | null
          category: string | null
          created_at: string | null
          date: string
          description: string | null
          id: string
          is_recurring: boolean | null
          owner_id: string
          property_id: string | null
          status: string
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          attachment_url?: string | null
          category?: string | null
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          is_recurring?: boolean | null
          owner_id: string
          property_id?: string | null
          status?: string
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          attachment_url?: string | null
          category?: string | null
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          is_recurring?: boolean | null
          owner_id?: string
          property_id?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_items: {
        Row: {
          created_at: string | null
          entry_photo_url: string | null
          exit_photo_url: string | null
          id: string
          inspection_id: string | null
          item_name: string
          notes: string | null
          owner_resolution_status: string | null
          room_name: string
          status: string | null
          tenant_feedback_at: string | null
          tenant_feedback_comment: string | null
          tenant_feedback_status: string | null
        }
        Insert: {
          created_at?: string | null
          entry_photo_url?: string | null
          exit_photo_url?: string | null
          id?: string
          inspection_id?: string | null
          item_name: string
          notes?: string | null
          owner_resolution_status?: string | null
          room_name: string
          status?: string | null
          tenant_feedback_at?: string | null
          tenant_feedback_comment?: string | null
          tenant_feedback_status?: string | null
        }
        Update: {
          created_at?: string | null
          entry_photo_url?: string | null
          exit_photo_url?: string | null
          id?: string
          inspection_id?: string | null
          item_name?: string
          notes?: string | null
          owner_resolution_status?: string | null
          room_name?: string
          status?: string | null
          tenant_feedback_at?: string | null
          tenant_feedback_comment?: string | null
          tenant_feedback_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspection_items_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      inspections: {
        Row: {
          created_at: string | null
          date: string | null
          id: string
          property_id: string | null
          status: string | null
          type: string
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          id?: string
          property_id?: string | null
          status?: string | null
          type: string
        }
        Update: {
          created_at?: string | null
          date?: string | null
          id?: string
          property_id?: string | null
          status?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspections_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          request_id: string
          sender_id: string
          sender_role: string | null
          type: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          request_id: string
          sender_id: string
          sender_role?: string | null
          type?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          request_id?: string
          sender_id?: string
          sender_role?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "maintenance_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_requests: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          priority: string | null
          property_id: string
          status: string | null
          tenant_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          priority?: string | null
          property_id: string
          status?: string | null
          tenant_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          priority?: string | null
          property_id?: string
          status?: string | null
          tenant_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          contract_id: string
          created_at: string
          due_date: string
          id: string
          notes: string | null
          paid_date: string | null
          payment_method: string | null
          status: string | null
        }
        Insert: {
          amount: number
          contract_id: string
          created_at?: string
          due_date: string
          id?: string
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          status?: string | null
        }
        Update: {
          amount?: number
          contract_id?: string
          created_at?: string
          due_date?: string
          id?: string
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          admin_type: string | null
          avatar_url: string | null
          converted_at: string | null
          cpf: string | null
          created_at: string
          email: string
          id: string
          is_pending: boolean | null
          is_suspended: boolean | null
          last_login_at: string | null
          last_login_ip: string | null
          managed_by_admin_id: string | null
          name: string | null
          permissions: Json | null
          phone: string | null
          plan: string | null
          role: string | null
          suspended_at: string | null
          suspended_reason: string | null
          trial_end_date: string | null
          trial_started_at: string | null
          updated_at: string
        }
        Insert: {
          admin_type?: string | null
          avatar_url?: string | null
          converted_at?: string | null
          cpf?: string | null
          created_at?: string
          email: string
          id: string
          is_pending?: boolean | null
          is_suspended?: boolean | null
          last_login_at?: string | null
          last_login_ip?: string | null
          managed_by_admin_id?: string | null
          name?: string | null
          permissions?: Json | null
          phone?: string | null
          plan?: string | null
          role?: string | null
          suspended_at?: string | null
          suspended_reason?: string | null
          trial_end_date?: string | null
          trial_started_at?: string | null
          updated_at?: string
        }
        Update: {
          admin_type?: string | null
          avatar_url?: string | null
          converted_at?: string | null
          cpf?: string | null
          created_at?: string
          email?: string
          id?: string
          is_pending?: boolean | null
          is_suspended?: boolean | null
          last_login_at?: string | null
          last_login_ip?: string | null
          managed_by_admin_id?: string | null
          name?: string | null
          permissions?: Json | null
          phone?: string | null
          plan?: string | null
          role?: string | null
          suspended_at?: string | null
          suspended_reason?: string | null
          trial_end_date?: string | null
          trial_started_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          area: number | null
          bathrooms: number | null
          bedrooms: number | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          market_value: number | null
          name: string
          owner_id: string
          parking: number | null
          price: number
          status: string | null
          updated_at: string
        }
        Insert: {
          address: string
          area?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          market_value?: number | null
          name: string
          owner_id: string
          parking?: number | null
          price: number
          status?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          area?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          market_value?: number | null
          name?: string
          owner_id?: string
          parking?: number | null
          price?: number
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      property_documents: {
        Row: {
          category: string
          created_at: string | null
          id: string
          name: string
          property_id: string | null
          size: string | null
          status: string | null
          type: string
          url: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          name: string
          property_id?: string | null
          size?: string | null
          status?: string | null
          type: string
          url?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          name?: string
          property_id?: string | null
          size?: string | null
          status?: string | null
          type?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      support_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          sender_id: string | null
          sender_role: string
          ticket_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_id?: string | null
          sender_role: string
          ticket_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_id?: string | null
          sender_role?: string | null
          ticket_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string | null
          created_at: string | null
          id: string
          priority: string
          status: string
          subject: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          priority?: string
          status?: string
          subject: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          priority?: string
          status?: string
          subject?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_announcements: {
        Row: {
          clicks: number | null
          content: string
          created_at: string | null
          created_by_admin_id: string | null
          id: string
          link: string | null
          show_until: string | null
          status: string
          target_audience: string
          title: string
          type: string
          views: number | null
        }
        Insert: {
          clicks?: number | null
          content: string
          created_at?: string | null
          created_by_admin_id?: string | null
          id?: string
          link?: string | null
          show_until?: string | null
          status?: string
          target_audience?: string
          title: string
          type?: string
          views?: number | null
        }
        Update: {
          clicks?: number | null
          content?: string
          created_at?: string | null
          id?: string
          link?: string | null
          show_until?: string | null
          status?: string
          target_audience?: string
          title?: string
          type?: string
          views?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_tenant_profile: {
        Args: {
          p_avatar_url?: string
          p_name?: string
          p_new_id: string
          p_old_id: string
        }
        Returns: Json
      }
      is_admin: { Args: never; Returns: boolean }
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
