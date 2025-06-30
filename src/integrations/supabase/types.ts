export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      conversation_events: {
        Row: {
          conversation_id: string
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          sentiment_score: number | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          sentiment_score?: number | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          sentiment_score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      conversation_monitor: {
        Row: {
          avg_sentiment_score: number | null
          conversation_id: string
          created_at: string
          graceful_exit: boolean | null
          id: string
          inactivity_hours: number | null
          last_message_time: string | null
          last_nudge_time: string | null
          message_count: number | null
          nudge_count: number | null
          response_balance_score: number | null
          updated_at: string
        }
        Insert: {
          avg_sentiment_score?: number | null
          conversation_id: string
          created_at?: string
          graceful_exit?: boolean | null
          id?: string
          inactivity_hours?: number | null
          last_message_time?: string | null
          last_nudge_time?: string | null
          message_count?: number | null
          nudge_count?: number | null
          response_balance_score?: number | null
          updated_at?: string
        }
        Update: {
          avg_sentiment_score?: number | null
          conversation_id?: string
          created_at?: string
          graceful_exit?: boolean | null
          id?: string
          inactivity_hours?: number | null
          last_message_time?: string | null
          last_nudge_time?: string | null
          message_count?: number | null
          nudge_count?: number | null
          response_balance_score?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      conversation_tracker: {
        Row: {
          ai_concierge_triggered: boolean | null
          conversation_id: string
          created_at: string
          id: string
          last_activity: string | null
          match_user_id: string
          message_count: number | null
          mutual_engagement_score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_concierge_triggered?: boolean | null
          conversation_id: string
          created_at?: string
          id?: string
          last_activity?: string | null
          match_user_id: string
          message_count?: number | null
          mutual_engagement_score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_concierge_triggered?: boolean | null
          conversation_id?: string
          created_at?: string
          id?: string
          last_activity?: string | null
          match_user_id?: string
          message_count?: number | null
          mutual_engagement_score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      date_journal: {
        Row: {
          created_at: string
          date_activity: string
          date_completed: string | null
          date_proposal_id: string | null
          date_title: string
          id: string
          learned_insights: string | null
          partner_name: string
          rating: number | null
          reflection_notes: string | null
          tags: string[] | null
          updated_at: string
          user_id: string
          would_repeat: boolean | null
        }
        Insert: {
          created_at?: string
          date_activity: string
          date_completed?: string | null
          date_proposal_id?: string | null
          date_title: string
          id?: string
          learned_insights?: string | null
          partner_name: string
          rating?: number | null
          reflection_notes?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
          would_repeat?: boolean | null
        }
        Update: {
          created_at?: string
          date_activity?: string
          date_completed?: string | null
          date_proposal_id?: string | null
          date_title?: string
          id?: string
          learned_insights?: string | null
          partner_name?: string
          rating?: number | null
          reflection_notes?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
          would_repeat?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "date_journal_date_proposal_id_fkey"
            columns: ["date_proposal_id"]
            isOneToOne: false
            referencedRelation: "date_proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      date_proposals: {
        Row: {
          activity: string
          ai_generated: boolean | null
          conversation_id: string
          created_at: string
          creator_user_id: string
          id: string
          location_type: string | null
          proposal_data: Json | null
          rationale: string | null
          recipient_user_id: string
          status: string | null
          time_suggestion: string | null
          title: string
          updated_at: string
          vibe: string | null
        }
        Insert: {
          activity: string
          ai_generated?: boolean | null
          conversation_id: string
          created_at?: string
          creator_user_id: string
          id?: string
          location_type?: string | null
          proposal_data?: Json | null
          rationale?: string | null
          recipient_user_id: string
          status?: string | null
          time_suggestion?: string | null
          title: string
          updated_at?: string
          vibe?: string | null
        }
        Update: {
          activity?: string
          ai_generated?: boolean | null
          conversation_id?: string
          created_at?: string
          creator_user_id?: string
          id?: string
          location_type?: string | null
          proposal_data?: Json | null
          rationale?: string | null
          recipient_user_id?: string
          status?: string | null
          time_suggestion?: string | null
          title?: string
          updated_at?: string
          vibe?: string | null
        }
        Relationships: []
      }
      nudge_library: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          nudge_type: string
          prompt_text: string
          response_options: Json | null
          trigger_context: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          nudge_type: string
          prompt_text: string
          response_options?: Json | null
          trigger_context: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          nudge_type?: string
          prompt_text?: string
          response_options?: Json | null
          trigger_context?: string
        }
        Relationships: []
      }
      partner_email_submissions: {
        Row: {
          email: string
          id: string
          ip_address: string | null
          source_page: string | null
          submitted_at: string
          user_agent: string | null
        }
        Insert: {
          email: string
          id?: string
          ip_address?: string | null
          source_page?: string | null
          submitted_at?: string
          user_agent?: string | null
        }
        Update: {
          email?: string
          id?: string
          ip_address?: string | null
          source_page?: string | null
          submitted_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rif_event_log: {
        Row: {
          event_data: Json | null
          event_type: string
          id: string
          timestamp: string
          user_id: string
        }
        Insert: {
          event_data?: Json | null
          event_type: string
          id?: string
          timestamp?: string
          user_id: string
        }
        Update: {
          event_data?: Json | null
          event_type?: string
          id?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      rif_feedback: {
        Row: {
          created_at: string
          data: Json
          feedback_type: string
          id: string
          processed: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string
          data: Json
          feedback_type: string
          id?: string
          processed?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          feedback_type?: string
          id?: string
          processed?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      rif_insights: {
        Row: {
          content: string
          delivered: boolean | null
          engaged: boolean | null
          generated_at: string
          id: string
          insight_type: string
          title: string
          user_id: string
        }
        Insert: {
          content: string
          delivered?: boolean | null
          engaged?: boolean | null
          generated_at?: string
          id?: string
          insight_type: string
          title: string
          user_id: string
        }
        Update: {
          content?: string
          delivered?: boolean | null
          engaged?: boolean | null
          generated_at?: string
          id?: string
          insight_type?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      rif_profiles: {
        Row: {
          boundary_respect: number | null
          created_at: string
          emotional_readiness: number | null
          id: string
          intent_clarity: number | null
          is_active: boolean | null
          pacing_preferences: number | null
          post_date_alignment: number | null
          profile_version: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          boundary_respect?: number | null
          created_at?: string
          emotional_readiness?: number | null
          id?: string
          intent_clarity?: number | null
          is_active?: boolean | null
          pacing_preferences?: number | null
          post_date_alignment?: number | null
          profile_version?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          boundary_respect?: number | null
          created_at?: string
          emotional_readiness?: number | null
          id?: string
          intent_clarity?: number | null
          is_active?: boolean | null
          pacing_preferences?: number | null
          post_date_alignment?: number | null
          profile_version?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rif_prompts: {
        Row: {
          category: string | null
          created_at: string
          id: string
          is_active: boolean | null
          prompt_text: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          prompt_text: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          prompt_text?: string
        }
        Relationships: []
      }
      rif_recommendations: {
        Row: {
          content: Json
          created_at: string
          delivered: boolean | null
          engaged: boolean | null
          id: string
          recommendation_type: string
          user_id: string
        }
        Insert: {
          content: Json
          created_at?: string
          delivered?: boolean | null
          engaged?: boolean | null
          id?: string
          recommendation_type: string
          user_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          delivered?: boolean | null
          engaged?: boolean | null
          id?: string
          recommendation_type?: string
          user_id?: string
        }
        Relationships: []
      }
      rif_reflections: {
        Row: {
          created_at: string
          id: string
          prompt_id: string | null
          prompt_text: string | null
          response_text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          prompt_id?: string | null
          prompt_text?: string | null
          response_text: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          prompt_id?: string | null
          prompt_text?: string | null
          response_text?: string
          user_id?: string
        }
        Relationships: []
      }
      rif_settings: {
        Row: {
          ai_personalization_enabled: boolean | null
          created_at: string
          crisis_resources_shown: boolean | null
          data_sharing_consent: boolean | null
          id: string
          last_consent_update: string | null
          reflection_prompts_enabled: boolean | null
          rif_enabled: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_personalization_enabled?: boolean | null
          created_at?: string
          crisis_resources_shown?: boolean | null
          data_sharing_consent?: boolean | null
          id?: string
          last_consent_update?: string | null
          reflection_prompts_enabled?: boolean | null
          rif_enabled?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_personalization_enabled?: boolean | null
          created_at?: string
          crisis_resources_shown?: boolean | null
          data_sharing_consent?: boolean | null
          id?: string
          last_consent_update?: string | null
          reflection_prompts_enabled?: boolean | null
          rif_enabled?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          age: number | null
          age_verification_timestamp: string | null
          age_verified: boolean | null
          bio: string | null
          created_at: string
          date_of_birth: string | null
          date_preferences: Json | null
          discovery_privacy_mode: string | null
          gender_identity: Database["public"]["Enums"]["gender_identity"] | null
          gender_identity_custom: string | null
          id: string
          identity_visibility: boolean | null
          interests: string[] | null
          is_profile_complete: boolean | null
          last_preference_update: string | null
          location: string | null
          location_consent: boolean | null
          location_data: Json | null
          photos: string[] | null
          preference_to_be_seen_by: string[] | null
          preference_to_see: string[] | null
          sexual_orientation:
            | Database["public"]["Enums"]["sexual_orientation"]
            | null
          sexual_orientation_custom: string | null
          show_location_on_profile: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age?: number | null
          age_verification_timestamp?: string | null
          age_verified?: boolean | null
          bio?: string | null
          created_at?: string
          date_of_birth?: string | null
          date_preferences?: Json | null
          discovery_privacy_mode?: string | null
          gender_identity?:
            | Database["public"]["Enums"]["gender_identity"]
            | null
          gender_identity_custom?: string | null
          id?: string
          identity_visibility?: boolean | null
          interests?: string[] | null
          is_profile_complete?: boolean | null
          last_preference_update?: string | null
          location?: string | null
          location_consent?: boolean | null
          location_data?: Json | null
          photos?: string[] | null
          preference_to_be_seen_by?: string[] | null
          preference_to_see?: string[] | null
          sexual_orientation?:
            | Database["public"]["Enums"]["sexual_orientation"]
            | null
          sexual_orientation_custom?: string | null
          show_location_on_profile?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number | null
          age_verification_timestamp?: string | null
          age_verified?: boolean | null
          bio?: string | null
          created_at?: string
          date_of_birth?: string | null
          date_preferences?: Json | null
          discovery_privacy_mode?: string | null
          gender_identity?:
            | Database["public"]["Enums"]["gender_identity"]
            | null
          gender_identity_custom?: string | null
          id?: string
          identity_visibility?: boolean | null
          interests?: string[] | null
          is_profile_complete?: boolean | null
          last_preference_update?: string | null
          location?: string | null
          location_consent?: boolean | null
          location_data?: Json | null
          photos?: string[] | null
          preference_to_be_seen_by?: string[] | null
          preference_to_see?: string[] | null
          sexual_orientation?:
            | Database["public"]["Enums"]["sexual_orientation"]
            | null
          sexual_orientation_custom?: string | null
          show_location_on_profile?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_rif_state: {
        Row: {
          color_palette: Json | null
          created_at: string
          current_state: string
          id: string
          last_updated: string
          state_description: string | null
          user_id: string
        }
        Insert: {
          color_palette?: Json | null
          created_at?: string
          current_state?: string
          id?: string
          last_updated?: string
          state_description?: string | null
          user_id: string
        }
        Update: {
          color_palette?: Json | null
          created_at?: string
          current_state?: string
          id?: string
          last_updated?: string
          state_description?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_age: {
        Args: { birth_date: string }
        Returns: number
      }
      verify_age_18_plus: {
        Args: { birth_date: string }
        Returns: boolean
      }
    }
    Enums: {
      gender_identity:
        | "Man"
        | "Woman"
        | "Nonbinary"
        | "Genderfluid"
        | "Agender"
        | "Demigender"
        | "Two-Spirit"
        | "Questioning"
        | "Custom"
      sexual_orientation:
        | "Straight"
        | "Gay"
        | "Lesbian"
        | "Bisexual"
        | "Pansexual"
        | "Queer"
        | "Asexual"
        | "Demisexual"
        | "Questioning"
        | "Custom"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      gender_identity: [
        "Man",
        "Woman",
        "Nonbinary",
        "Genderfluid",
        "Agender",
        "Demigender",
        "Two-Spirit",
        "Questioning",
        "Custom",
      ],
      sexual_orientation: [
        "Straight",
        "Gay",
        "Lesbian",
        "Bisexual",
        "Pansexual",
        "Queer",
        "Asexual",
        "Demisexual",
        "Questioning",
        "Custom",
      ],
    },
  },
} as const
