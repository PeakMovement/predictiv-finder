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
      ai_interactions: {
        Row: {
          ai_response: string
          context: Json | null
          created_at: string | null
          id: string
          user_id: string
          user_message: string
        }
        Insert: {
          ai_response: string
          context?: Json | null
          created_at?: string | null
          id?: string
          user_id: string
          user_message: string
        }
        Update: {
          ai_response?: string
          context?: Json | null
          created_at?: string | null
          id?: string
          user_id?: string
          user_message?: string
        }
        Relationships: []
      }
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
      professionals: {
        Row: {
          calendly_url: string
          created_at: string
          google_reviews_url: string | null
          id: string
          is_approved: boolean
          location: string | null
          name: string
          photo_url: string | null
          price_max: number | null
          price_min: number | null
          profession: string
          specialities: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          calendly_url: string
          created_at?: string
          google_reviews_url?: string | null
          id?: string
          is_approved?: boolean
          location?: string | null
          name: string
          photo_url?: string | null
          price_max?: number | null
          price_min?: number | null
          profession: string
          specialities?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          calendly_url?: string
          created_at?: string
          google_reviews_url?: string | null
          id?: string
          is_approved?: boolean
          location?: string | null
          name?: string
          photo_url?: string | null
          price_max?: number | null
          price_min?: number | null
          profession?: string
          specialities?: string[]
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
      symptom_checks: {
        Row: {
          associated_symptoms: string[] | null
          completed_at: string | null
          created_at: string | null
          id: string
          interpretation_ready: boolean | null
          medical_history_flags: string[] | null
          overall_severity:
            | Database["public"]["Enums"]["symptom_severity"]
            | null
          primary_complaint: string | null
          red_flag_reasons: string[] | null
          red_flag_status: Database["public"]["Enums"]["red_flag_status"] | null
          session_status: string
          symptom_duration_hours: number | null
          symptom_onset: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          associated_symptoms?: string[] | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          interpretation_ready?: boolean | null
          medical_history_flags?: string[] | null
          overall_severity?:
            | Database["public"]["Enums"]["symptom_severity"]
            | null
          primary_complaint?: string | null
          red_flag_reasons?: string[] | null
          red_flag_status?:
            | Database["public"]["Enums"]["red_flag_status"]
            | null
          session_status?: string
          symptom_duration_hours?: number | null
          symptom_onset?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          associated_symptoms?: string[] | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          interpretation_ready?: boolean | null
          medical_history_flags?: string[] | null
          overall_severity?:
            | Database["public"]["Enums"]["symptom_severity"]
            | null
          primary_complaint?: string | null
          red_flag_reasons?: string[] | null
          red_flag_status?:
            | Database["public"]["Enums"]["red_flag_status"]
            | null
          session_status?: string
          symptom_duration_hours?: number | null
          symptom_onset?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      symptom_entries: {
        Row: {
          associated_symptoms: string[] | null
          body_region: string | null
          created_at: string | null
          duration_hours: number | null
          frequency: string | null
          id: string
          is_primary: boolean | null
          matched_rule_id: string | null
          relieving_factors: string[] | null
          severity: Database["public"]["Enums"]["symptom_severity"]
          severity_score: number | null
          symptom_check_id: string
          symptom_text: string
          triggers: string[] | null
          user_id: string
        }
        Insert: {
          associated_symptoms?: string[] | null
          body_region?: string | null
          created_at?: string | null
          duration_hours?: number | null
          frequency?: string | null
          id?: string
          is_primary?: boolean | null
          matched_rule_id?: string | null
          relieving_factors?: string[] | null
          severity?: Database["public"]["Enums"]["symptom_severity"]
          severity_score?: number | null
          symptom_check_id: string
          symptom_text: string
          triggers?: string[] | null
          user_id: string
        }
        Update: {
          associated_symptoms?: string[] | null
          body_region?: string | null
          created_at?: string | null
          duration_hours?: number | null
          frequency?: string | null
          id?: string
          is_primary?: boolean | null
          matched_rule_id?: string | null
          relieving_factors?: string[] | null
          severity?: Database["public"]["Enums"]["symptom_severity"]
          severity_score?: number | null
          symptom_check_id?: string
          symptom_text?: string
          triggers?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "symptom_entries_matched_rule_id_fkey"
            columns: ["matched_rule_id"]
            isOneToOne: false
            referencedRelation: "symptom_severity_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "symptom_entries_symptom_check_id_fkey"
            columns: ["symptom_check_id"]
            isOneToOne: false
            referencedRelation: "symptom_checks"
            referencedColumns: ["id"]
          },
        ]
      }
      symptom_red_flags: {
        Row: {
          created_at: string | null
          flag_reason: string
          flag_type: string
          id: string
          recommendation: string | null
          severity_level: Database["public"]["Enums"]["red_flag_status"]
          symptom_check_id: string
          triggered_by_rule_id: string | null
          triggered_by_symptom_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          flag_reason: string
          flag_type: string
          id?: string
          recommendation?: string | null
          severity_level: Database["public"]["Enums"]["red_flag_status"]
          symptom_check_id: string
          triggered_by_rule_id?: string | null
          triggered_by_symptom_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          flag_reason?: string
          flag_type?: string
          id?: string
          recommendation?: string | null
          severity_level?: Database["public"]["Enums"]["red_flag_status"]
          symptom_check_id?: string
          triggered_by_rule_id?: string | null
          triggered_by_symptom_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "symptom_red_flags_symptom_check_id_fkey"
            columns: ["symptom_check_id"]
            isOneToOne: false
            referencedRelation: "symptom_checks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "symptom_red_flags_triggered_by_rule_id_fkey"
            columns: ["triggered_by_rule_id"]
            isOneToOne: false
            referencedRelation: "symptom_severity_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "symptom_red_flags_triggered_by_symptom_id_fkey"
            columns: ["triggered_by_symptom_id"]
            isOneToOne: false
            referencedRelation: "symptom_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      symptom_severity_rules: {
        Row: {
          base_severity: Database["public"]["Enums"]["symptom_severity"]
          body_region: string | null
          created_at: string | null
          duration_hours_threshold: number | null
          escalation_severity:
            | Database["public"]["Enums"]["symptom_severity"]
            | null
          id: string
          is_active: boolean | null
          red_flag_triggers: string[] | null
          symptom_keyword: string
          updated_at: string | null
        }
        Insert: {
          base_severity?: Database["public"]["Enums"]["symptom_severity"]
          body_region?: string | null
          created_at?: string | null
          duration_hours_threshold?: number | null
          escalation_severity?:
            | Database["public"]["Enums"]["symptom_severity"]
            | null
          id?: string
          is_active?: boolean | null
          red_flag_triggers?: string[] | null
          symptom_keyword: string
          updated_at?: string | null
        }
        Update: {
          base_severity?: Database["public"]["Enums"]["symptom_severity"]
          body_region?: string | null
          created_at?: string | null
          duration_hours_threshold?: number | null
          escalation_severity?:
            | Database["public"]["Enums"]["symptom_severity"]
            | null
          id?: string
          is_active?: boolean | null
          red_flag_triggers?: string[] | null
          symptom_keyword?: string
          updated_at?: string | null
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
      is_owner: { Args: { _user_id: string }; Returns: boolean }
      max_severity: {
        Args: { severities: Database["public"]["Enums"]["symptom_severity"][] }
        Returns: Database["public"]["Enums"]["symptom_severity"]
      }
      score_to_severity: {
        Args: { score: number }
        Returns: Database["public"]["Enums"]["symptom_severity"]
      }
    }
    Enums: {
      red_flag_status: "none" | "monitor" | "urgent" | "emergency"
      symptom_severity: "mild" | "moderate" | "severe" | "critical"
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
      red_flag_status: ["none", "monitor", "urgent", "emergency"],
      symptom_severity: ["mild", "moderate", "severe", "critical"],
    },
  },
} as const
