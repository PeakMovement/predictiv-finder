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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      availability_slots: {
        Row: {
          calendar_integration_id: string | null
          created_at: string
          end_time: string
          event_title: string | null
          external_event_id: string | null
          id: string
          is_available: boolean
          practitioner_id: string
          start_time: string
          sync_source: string
          updated_at: string
        }
        Insert: {
          calendar_integration_id?: string | null
          created_at?: string
          end_time: string
          event_title?: string | null
          external_event_id?: string | null
          id?: string
          is_available?: boolean
          practitioner_id: string
          start_time: string
          sync_source: string
          updated_at?: string
        }
        Update: {
          calendar_integration_id?: string | null
          created_at?: string
          end_time?: string
          event_title?: string | null
          external_event_id?: string | null
          id?: string
          is_available?: boolean
          practitioner_id?: string
          start_time?: string
          sync_source?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_slots_calendar_integration_id_fkey"
            columns: ["calendar_integration_id"]
            isOneToOne: false
            referencedRelation: "calendar_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          appointment_date: string
          created_at: string
          id: string
          notes: string | null
          plan_id: string | null
          practitioner_name: string
          service_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_date: string
          created_at?: string
          id?: string
          notes?: string | null
          plan_id?: string | null
          practitioner_name: string
          service_type: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_date?: string
          created_at?: string
          id?: string
          notes?: string | null
          plan_id?: string | null
          practitioner_name?: string
          service_type?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "health_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_integrations: {
        Row: {
          api_credentials: Json
          calendar_id: string | null
          created_at: string
          id: string
          integration_type: string
          last_sync_at: string | null
          practitioner_id: string
          sync_enabled: boolean
          updated_at: string
        }
        Insert: {
          api_credentials: Json
          calendar_id?: string | null
          created_at?: string
          id?: string
          integration_type: string
          last_sync_at?: string | null
          practitioner_id: string
          sync_enabled?: boolean
          updated_at?: string
        }
        Update: {
          api_credentials?: Json
          calendar_id?: string | null
          created_at?: string
          id?: string
          integration_type?: string
          last_sync_at?: string | null
          practitioner_id?: string
          sync_enabled?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      health_plans: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          plan_type: string
          services: Json | null
          time_frame: string | null
          total_cost: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          plan_type: string
          services?: Json | null
          time_frame?: string | null
          total_cost?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          plan_type?: string
          services?: Json | null
          time_frame?: string | null
          total_cost?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      search_history: {
        Row: {
          budget: number | null
          created_at: string
          health_issue: string
          id: string
          location: string | null
          results_count: number
          user_id: string
        }
        Insert: {
          budget?: number | null
          created_at?: string
          health_issue: string
          id?: string
          location?: string | null
          results_count?: number
          user_id: string
        }
        Update: {
          budget?: number | null
          created_at?: string
          health_issue?: string
          id?: string
          location?: string | null
          results_count?: number
          user_id?: string
        }
        Relationships: []
      }
      user_physician_preferences: {
        Row: {
          created_at: string
          id: string
          last_selected_at: string
          physician_location: string
          physician_name: string
          physician_title: string
          selection_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_selected_at?: string
          physician_location: string
          physician_name: string
          physician_title: string
          selection_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_selected_at?: string
          physician_location?: string
          physician_name?: string
          physician_title?: string
          selection_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          budget_range: string | null
          communication_preferences: Json | null
          created_at: string
          id: string
          preferred_location: string | null
          service_categories: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          budget_range?: string | null
          communication_preferences?: Json | null
          created_at?: string
          id?: string
          preferred_location?: string | null
          service_categories?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          budget_range?: string | null
          communication_preferences?: Json | null
          created_at?: string
          id?: string
          preferred_location?: string | null
          service_categories?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
