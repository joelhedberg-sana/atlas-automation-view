export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      api_keys: {
        Row: {
          connector_id: string
          created_at: string
          encrypted_value: string
          expires_at: string | null
          id: string
          key_name: string
          updated_at: string
        }
        Insert: {
          connector_id: string
          created_at?: string
          encrypted_value: string
          expires_at?: string | null
          id?: string
          key_name: string
          updated_at?: string
        }
        Update: {
          connector_id?: string
          created_at?: string
          encrypted_value?: string
          expires_at?: string | null
          id?: string
          key_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_connector_id_fkey"
            columns: ["connector_id"]
            isOneToOne: false
            referencedRelation: "connectors"
            referencedColumns: ["id"]
          },
        ]
      }
      connectors: {
        Row: {
          api_usage_limit: number | null
          api_usage_reset_date: string | null
          api_usage_used: number | null
          avg_response_time: number | null
          created_at: string
          error_count: number | null
          id: string
          last_sync: string | null
          monthly_executions: number | null
          name: string
          organization_id: string
          platform: string
          status: Database["public"]["Enums"]["connector_status"]
          sync_frequency: Database["public"]["Enums"]["sync_frequency"]
          total_flows: number | null
          updated_at: string
        }
        Insert: {
          api_usage_limit?: number | null
          api_usage_reset_date?: string | null
          api_usage_used?: number | null
          avg_response_time?: number | null
          created_at?: string
          error_count?: number | null
          id?: string
          last_sync?: string | null
          monthly_executions?: number | null
          name: string
          organization_id: string
          platform: string
          status?: Database["public"]["Enums"]["connector_status"]
          sync_frequency?: Database["public"]["Enums"]["sync_frequency"]
          total_flows?: number | null
          updated_at?: string
        }
        Update: {
          api_usage_limit?: number | null
          api_usage_reset_date?: string | null
          api_usage_used?: number | null
          avg_response_time?: number | null
          created_at?: string
          error_count?: number | null
          id?: string
          last_sync?: string | null
          monthly_executions?: number | null
          name?: string
          organization_id?: string
          platform?: string
          status?: Database["public"]["Enums"]["connector_status"]
          sync_frequency?: Database["public"]["Enums"]["sync_frequency"]
          total_flows?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "connectors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      execution_logs: {
        Row: {
          cost: number | null
          created_at: string
          data_processed: number | null
          duration: number | null
          end_time: string | null
          error_message: string | null
          external_execution_id: string | null
          flow_id: string
          id: string
          start_time: string
          status: string
        }
        Insert: {
          cost?: number | null
          created_at?: string
          data_processed?: number | null
          duration?: number | null
          end_time?: string | null
          error_message?: string | null
          external_execution_id?: string | null
          flow_id: string
          id?: string
          start_time: string
          status: string
        }
        Update: {
          cost?: number | null
          created_at?: string
          data_processed?: number | null
          duration?: number | null
          end_time?: string | null
          error_message?: string | null
          external_execution_id?: string | null
          flow_id?: string
          id?: string
          start_time?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "execution_logs_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "flows"
            referencedColumns: ["id"]
          },
        ]
      }
      flows: {
        Row: {
          actions: Json | null
          ai_documentation: string | null
          ai_insights: Json | null
          avg_execution_time: number | null
          avg_response_time: number | null
          business_value: Database["public"]["Enums"]["business_value"] | null
          connector_id: string
          cost_per_execution: number | null
          created_at: string
          department: Database["public"]["Enums"]["department_type"] | null
          description: string | null
          duplicate_of: string | null
          error_count: number | null
          external_id: string
          frequency: Database["public"]["Enums"]["sync_frequency"]
          id: string
          last_run: string | null
          monthly_cost: number | null
          monthly_executions: number | null
          name: string
          next_run: string | null
          organization_id: string
          orphan: boolean | null
          owner_id: string | null
          status: Database["public"]["Enums"]["flow_status"]
          success_rate: number | null
          summary: string | null
          tags: string[] | null
          tool: string
          total_executions: number | null
          trigger_config: Json | null
          trigger_type: Database["public"]["Enums"]["trigger_type"]
          updated_at: string
          warning_count: number | null
        }
        Insert: {
          actions?: Json | null
          ai_documentation?: string | null
          ai_insights?: Json | null
          avg_execution_time?: number | null
          avg_response_time?: number | null
          business_value?: Database["public"]["Enums"]["business_value"] | null
          connector_id: string
          cost_per_execution?: number | null
          created_at?: string
          department?: Database["public"]["Enums"]["department_type"] | null
          description?: string | null
          duplicate_of?: string | null
          error_count?: number | null
          external_id: string
          frequency?: Database["public"]["Enums"]["sync_frequency"]
          id?: string
          last_run?: string | null
          monthly_cost?: number | null
          monthly_executions?: number | null
          name: string
          next_run?: string | null
          organization_id: string
          orphan?: boolean | null
          owner_id?: string | null
          status?: Database["public"]["Enums"]["flow_status"]
          success_rate?: number | null
          summary?: string | null
          tags?: string[] | null
          tool: string
          total_executions?: number | null
          trigger_config?: Json | null
          trigger_type: Database["public"]["Enums"]["trigger_type"]
          updated_at?: string
          warning_count?: number | null
        }
        Update: {
          actions?: Json | null
          ai_documentation?: string | null
          ai_insights?: Json | null
          avg_execution_time?: number | null
          avg_response_time?: number | null
          business_value?: Database["public"]["Enums"]["business_value"] | null
          connector_id?: string
          cost_per_execution?: number | null
          created_at?: string
          department?: Database["public"]["Enums"]["department_type"] | null
          description?: string | null
          duplicate_of?: string | null
          error_count?: number | null
          external_id?: string
          frequency?: Database["public"]["Enums"]["sync_frequency"]
          id?: string
          last_run?: string | null
          monthly_cost?: number | null
          monthly_executions?: number | null
          name?: string
          next_run?: string | null
          organization_id?: string
          orphan?: boolean | null
          owner_id?: string | null
          status?: Database["public"]["Enums"]["flow_status"]
          success_rate?: number | null
          summary?: string | null
          tags?: string[] | null
          tool?: string
          total_executions?: number | null
          trigger_config?: Json | null
          trigger_type?: Database["public"]["Enums"]["trigger_type"]
          updated_at?: string
          warning_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "flows_connector_id_fkey"
            columns: ["connector_id"]
            isOneToOne: false
            referencedRelation: "connectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flows_duplicate_of_fkey"
            columns: ["duplicate_of"]
            isOneToOne: false
            referencedRelation: "flows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flows_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flows_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          domain: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          domain?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          domain?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          department: Database["public"]["Enums"]["department_type"] | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          organization_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department?: Database["public"]["Enums"]["department_type"] | null
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          organization_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department?: Database["public"]["Enums"]["department_type"] | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          organization_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_organization_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      business_value: "high" | "medium" | "low"
      connector_status: "connected" | "disconnected" | "error" | "syncing"
      department_type:
        | "sales"
        | "marketing"
        | "support"
        | "operations"
        | "revops"
      flow_status: "active" | "disabled" | "error"
      sync_frequency: "realtime" | "hourly" | "daily" | "weekly"
      trigger_type: "webhook" | "schedule" | "manual" | "event"
      user_role: "admin" | "editor" | "viewer"
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
    Enums: {
      business_value: ["high", "medium", "low"],
      connector_status: ["connected", "disconnected", "error", "syncing"],
      department_type: [
        "sales",
        "marketing",
        "support",
        "operations",
        "revops",
      ],
      flow_status: ["active", "disabled", "error"],
      sync_frequency: ["realtime", "hourly", "daily", "weekly"],
      trigger_type: ["webhook", "schedule", "manual", "event"],
      user_role: ["admin", "editor", "viewer"],
    },
  },
} as const
