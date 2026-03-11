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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      adaptive_insights: {
        Row: {
          actionable_suggestions: Json | null
          confidence_level: number | null
          created_at: string
          delivered: boolean | null
          dismissed: boolean | null
          engaged: boolean | null
          id: string
          insight_content: string
          insight_title: string
          insight_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          actionable_suggestions?: Json | null
          confidence_level?: number | null
          created_at?: string
          delivered?: boolean | null
          dismissed?: boolean | null
          engaged?: boolean | null
          id?: string
          insight_content: string
          insight_title: string
          insight_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          actionable_suggestions?: Json | null
          confidence_level?: number | null
          created_at?: string
          delivered?: boolean | null
          dismissed?: boolean | null
          engaged?: boolean | null
          id?: string
          insight_content?: string
          insight_title?: string
          insight_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      behavior_analytics: {
        Row: {
          created_at: string
          event_data: Json
          event_type: string
          id: string
          session_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_data?: Json
          event_type: string
          id?: string
          session_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_data?: Json
          event_type?: string
          id?: string
          session_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      behavioral_patterns: {
        Row: {
          confidence_score: number | null
          detected_at: string
          id: string
          is_active: boolean | null
          pattern_data: Json
          pattern_type: string
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          detected_at?: string
          id?: string
          is_active?: boolean | null
          pattern_data: Json
          pattern_type: string
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          detected_at?: string
          id?: string
          is_active?: boolean | null
          pattern_data?: Json
          pattern_type?: string
          user_id?: string
        }
        Relationships: []
      }
      blocked_users: {
        Row: {
          blocked_user_id: string
          blocker_user_id: string
          created_at: string
          id: string
          reason: string | null
          updated_at: string
        }
        Insert: {
          blocked_user_id: string
          blocker_user_id: string
          created_at?: string
          id?: string
          reason?: string | null
          updated_at?: string
        }
        Update: {
          blocked_user_id?: string
          blocker_user_id?: string
          created_at?: string
          id?: string
          reason?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cities: {
        Row: {
          country: string
          created_at: string
          id: string
          lat: number
          lng: number
          metro_area: string | null
          name: string
          population: number | null
          state: string
          timezone: string | null
          transit_systems: Json | null
          updated_at: string
        }
        Insert: {
          country: string
          created_at?: string
          id?: string
          lat: number
          lng: number
          metro_area?: string | null
          name: string
          population?: number | null
          state: string
          timezone?: string | null
          transit_systems?: Json | null
          updated_at?: string
        }
        Update: {
          country?: string
          created_at?: string
          id?: string
          lat?: number
          lng?: number
          metro_area?: string | null
          name?: string
          population?: number | null
          state?: string
          timezone?: string | null
          transit_systems?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      contact_share_feedback: {
        Row: {
          comment: string | null
          contact_share_id: string
          conversation_id: string
          created_at: string
          did_meet: boolean
          id: string
          match_user_id: string
          notification_sent_at: string | null
          rating: number | null
          see_again: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          contact_share_id: string
          conversation_id: string
          created_at?: string
          did_meet: boolean
          id?: string
          match_user_id: string
          notification_sent_at?: string | null
          rating?: number | null
          see_again?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          contact_share_id?: string
          conversation_id?: string
          created_at?: string
          did_meet?: boolean
          id?: string
          match_user_id?: string
          notification_sent_at?: string | null
          rating?: number | null
          see_again?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_share_feedback_contact_share_id_fkey"
            columns: ["contact_share_id"]
            isOneToOne: false
            referencedRelation: "contact_shares"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_shares: {
        Row: {
          conversation_id: string
          feedback_notification_sent: boolean | null
          feedback_notification_sent_at: string | null
          id: string
          recipient_user_id: string
          shared_at: string
          sharer_user_id: string
          sms_sent: boolean | null
        }
        Insert: {
          conversation_id: string
          feedback_notification_sent?: boolean | null
          feedback_notification_sent_at?: string | null
          id?: string
          recipient_user_id: string
          shared_at?: string
          sharer_user_id: string
          sms_sent?: boolean | null
        }
        Update: {
          conversation_id?: string
          feedback_notification_sent?: boolean | null
          feedback_notification_sent_at?: string | null
          id?: string
          recipient_user_id?: string
          shared_at?: string
          sharer_user_id?: string
          sms_sent?: boolean | null
        }
        Relationships: []
      }
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
      curated_matches: {
        Row: {
          compatibility_score: number | null
          created_at: string
          curated_by: string | null
          curation_notes: string | null
          delivered_at: string | null
          id: string
          is_delivered: boolean | null
          match_reason: string | null
          matched_user_id: string
          responded_at: string | null
          status: string
          user_id: string
          week_start: string
        }
        Insert: {
          compatibility_score?: number | null
          created_at?: string
          curated_by?: string | null
          curation_notes?: string | null
          delivered_at?: string | null
          id?: string
          is_delivered?: boolean | null
          match_reason?: string | null
          matched_user_id: string
          responded_at?: string | null
          status?: string
          user_id: string
          week_start: string
        }
        Update: {
          compatibility_score?: number | null
          created_at?: string
          curated_by?: string | null
          curation_notes?: string | null
          delivered_at?: string | null
          id?: string
          is_delivered?: boolean | null
          match_reason?: string | null
          matched_user_id?: string
          responded_at?: string | null
          status?: string
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
      curation_queue: {
        Row: {
          assigned_admin: string | null
          created_at: string
          id: string
          last_curated_at: string | null
          needs_curation: boolean | null
          priority: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_admin?: string | null
          created_at?: string
          id?: string
          last_curated_at?: string | null
          needs_curation?: boolean | null
          priority?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_admin?: string | null
          created_at?: string
          id?: string
          last_curated_at?: string | null
          needs_curation?: boolean | null
          priority?: number | null
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
          dismissed_by_creator_at: string | null
          dismissed_by_recipient_at: string | null
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
          dismissed_by_creator_at?: string | null
          dismissed_by_recipient_at?: string | null
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
          dismissed_by_creator_at?: string | null
          dismissed_by_recipient_at?: string | null
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
      date_reflections: {
        Row: {
          created_at: string
          date_occurred: string
          different_energy_description: string | null
          feeling_during: string
          id: string
          next_preference: string
          partner_name: string
          standout_qualities: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_occurred?: string
          different_energy_description?: string | null
          feeling_during: string
          id?: string
          next_preference: string
          partner_name: string
          standout_qualities?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_occurred?: string
          different_energy_description?: string | null
          feeling_during?: string
          id?: string
          next_preference?: string
          partner_name?: string
          standout_qualities?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dating_pool: {
        Row: {
          compatibility_score: number | null
          created_at: string
          id: string
          pool_user_id: string
          responded_at: string | null
          status: string
          user_id: string
          week_start: string
        }
        Insert: {
          compatibility_score?: number | null
          created_at?: string
          id?: string
          pool_user_id: string
          responded_at?: string | null
          status?: string
          user_id: string
          week_start: string
        }
        Update: {
          compatibility_score?: number | null
          created_at?: string
          id?: string
          pool_user_id?: string
          responded_at?: string | null
          status?: string
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
      itineraries: {
        Row: {
          completed_at: string | null
          consent_nudge_shown: boolean
          counterpart_user_id: string | null
          created_at: string
          description: string | null
          id: string
          location_data: Json
          mode: string
          safety_sharing_enabled: boolean
          share_link: string | null
          sos_visible: boolean
          status: string
          time_window: Json
          title: string
          updated_at: string
          user_id: string
          weekly_option_id: string | null
        }
        Insert: {
          completed_at?: string | null
          consent_nudge_shown?: boolean
          counterpart_user_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          location_data: Json
          mode: string
          safety_sharing_enabled?: boolean
          share_link?: string | null
          sos_visible?: boolean
          status?: string
          time_window: Json
          title: string
          updated_at?: string
          user_id: string
          weekly_option_id?: string | null
        }
        Update: {
          completed_at?: string | null
          consent_nudge_shown?: boolean
          counterpart_user_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          location_data?: Json
          mode?: string
          safety_sharing_enabled?: boolean
          share_link?: string | null
          sos_visible?: boolean
          status?: string
          time_window?: Json
          title?: string
          updated_at?: string
          user_id?: string
          weekly_option_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "itineraries_weekly_option_id_fkey"
            columns: ["weekly_option_id"]
            isOneToOne: false
            referencedRelation: "weekly_options"
            referencedColumns: ["id"]
          },
        ]
      }
      itinerary_feedback: {
        Row: {
          action_taken: string
          close_message_sent: string | null
          created_at: string
          eq_adjustments: Json | null
          feeling: string
          id: string
          itinerary_id: string
          next_plan_suggested: Json | null
          user_id: string
        }
        Insert: {
          action_taken: string
          close_message_sent?: string | null
          created_at?: string
          eq_adjustments?: Json | null
          feeling: string
          id?: string
          itinerary_id: string
          next_plan_suggested?: Json | null
          user_id: string
        }
        Update: {
          action_taken?: string
          close_message_sent?: string | null
          created_at?: string
          eq_adjustments?: Json | null
          feeling?: string
          id?: string
          itinerary_id?: string
          next_plan_suggested?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "itinerary_feedback_itinerary_id_fkey"
            columns: ["itinerary_id"]
            isOneToOne: false
            referencedRelation: "itineraries"
            referencedColumns: ["id"]
          },
        ]
      }
      itinerary_vendors: {
        Row: {
          created_at: string
          id: string
          itinerary_id: string
          notes: string | null
          role: string | null
          vendor_profile_id: string | null
          venue_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          itinerary_id: string
          notes?: string | null
          role?: string | null
          vendor_profile_id?: string | null
          venue_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          itinerary_id?: string
          notes?: string | null
          role?: string | null
          vendor_profile_id?: string | null
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "itinerary_vendors_itinerary_id_fkey"
            columns: ["itinerary_id"]
            isOneToOne: false
            referencedRelation: "itineraries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itinerary_vendors_vendor_profile_id_fkey"
            columns: ["vendor_profile_id"]
            isOneToOne: false
            referencedRelation: "vendor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itinerary_vendors_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_snapshots: {
        Row: {
          active_users_daily: number | null
          active_users_monthly: number | null
          active_users_weekly: number | null
          created_at: string
          id: string
          match_to_date_rate: number | null
          snapshot_date: string
          total_users: number | null
          week2_retention_rate: number | null
          week4_retention_rate: number | null
          week8_retention_rate: number | null
          weekly_options_view_rate: number | null
        }
        Insert: {
          active_users_daily?: number | null
          active_users_monthly?: number | null
          active_users_weekly?: number | null
          created_at?: string
          id?: string
          match_to_date_rate?: number | null
          snapshot_date: string
          total_users?: number | null
          week2_retention_rate?: number | null
          week4_retention_rate?: number | null
          week8_retention_rate?: number | null
          weekly_options_view_rate?: number | null
        }
        Update: {
          active_users_daily?: number | null
          active_users_monthly?: number | null
          active_users_weekly?: number | null
          created_at?: string
          id?: string
          match_to_date_rate?: number | null
          snapshot_date?: string
          total_users?: number | null
          week2_retention_rate?: number | null
          week4_retention_rate?: number | null
          week8_retention_rate?: number | null
          weekly_options_view_rate?: number | null
        }
        Relationships: []
      }
      match_conversions: {
        Row: {
          conversation_id: string
          conversion_status: string
          created_at: string
          date_completed_at: string | null
          date_proposed_at: string | null
          first_message_at: string | null
          id: string
          match_user_id: string
          matched_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          conversion_status?: string
          created_at?: string
          date_completed_at?: string | null
          date_proposed_at?: string | null
          first_message_at?: string | null
          id?: string
          match_user_id: string
          matched_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          conversion_status?: string
          created_at?: string
          date_completed_at?: string | null
          date_proposed_at?: string | null
          first_message_at?: string | null
          id?: string
          match_user_id?: string
          matched_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      match_delivery_log: {
        Row: {
          created_at: string
          curated_count: number | null
          delivered_at: string
          delivery_method: string | null
          id: string
          pool_count: number | null
          user_id: string
          week_start: string
        }
        Insert: {
          created_at?: string
          curated_count?: number | null
          delivered_at?: string
          delivery_method?: string | null
          id?: string
          pool_count?: number | null
          user_id: string
          week_start: string
        }
        Update: {
          created_at?: string
          curated_count?: number | null
          delivered_at?: string
          delivery_method?: string | null
          id?: string
          pool_count?: number | null
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          created_at: string
          id: string
          is_mutual: boolean | null
          liked_user_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_mutual?: boolean | null
          liked_user_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_mutual?: boolean | null
          liked_user_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          message_type: string | null
          read_at: string | null
          recipient_user_id: string
          sender_user_id: string
          updated_at: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          message_type?: string | null
          read_at?: string | null
          recipient_user_id: string
          sender_user_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          message_type?: string | null
          read_at?: string | null
          recipient_user_id?: string
          sender_user_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      neighborhoods: {
        Row: {
          bounds: Json | null
          city: string
          country: string
          created_at: string
          id: string
          lat: number
          lng: number
          name: string
          population: number | null
          state: string
          transit_score: number | null
          updated_at: string
          walkability_score: number | null
        }
        Insert: {
          bounds?: Json | null
          city: string
          country: string
          created_at?: string
          id?: string
          lat: number
          lng: number
          name: string
          population?: number | null
          state: string
          transit_score?: number | null
          updated_at?: string
          walkability_score?: number | null
        }
        Update: {
          bounds?: Json | null
          city?: string
          country?: string
          created_at?: string
          id?: string
          lat?: number
          lng?: number
          name?: string
          population?: number | null
          state?: string
          transit_score?: number | null
          updated_at?: string
          walkability_score?: number | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          date_proposals: boolean
          date_reminders: boolean
          email_enabled: boolean
          id: string
          new_matches: boolean
          new_messages: boolean
          push_enabled: boolean
          rif_insights: boolean
          safety_alerts: boolean
          system_updates: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_proposals?: boolean
          date_reminders?: boolean
          email_enabled?: boolean
          id?: string
          new_matches?: boolean
          new_messages?: boolean
          push_enabled?: boolean
          rif_insights?: boolean
          safety_alerts?: boolean
          system_updates?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_proposals?: boolean
          date_reminders?: boolean
          email_enabled?: boolean
          id?: string
          new_matches?: boolean
          new_messages?: boolean
          push_enabled?: boolean
          rif_insights?: boolean
          safety_alerts?: boolean
          system_updates?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          data: Json | null
          id: string
          message: string
          read_at: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read_at?: string | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read_at?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
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
      rate_limits: {
        Row: {
          action_type: string
          created_at: string
          id: string
          ip_address: string | null
          request_count: number | null
          updated_at: string
          user_id: string | null
          window_start: string
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          ip_address?: string | null
          request_count?: number | null
          updated_at?: string
          user_id?: string | null
          window_start?: string
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          request_count?: number | null
          updated_at?: string
          user_id?: string | null
          window_start?: string
        }
        Relationships: []
      }
      relationship_outcomes: {
        Row: {
          created_at: string
          duration_days: number | null
          id: string
          lessons_learned: string | null
          match_user_id: string | null
          outcome: string
          outcome_date: string
          relationship_type: string
          satisfaction_rating: number | null
          user_id: string
          what_didnt_work: Json | null
          what_worked: Json | null
          would_date_similar: boolean | null
        }
        Insert: {
          created_at?: string
          duration_days?: number | null
          id?: string
          lessons_learned?: string | null
          match_user_id?: string | null
          outcome: string
          outcome_date?: string
          relationship_type: string
          satisfaction_rating?: number | null
          user_id: string
          what_didnt_work?: Json | null
          what_worked?: Json | null
          would_date_similar?: boolean | null
        }
        Update: {
          created_at?: string
          duration_days?: number | null
          id?: string
          lessons_learned?: string | null
          match_user_id?: string | null
          outcome?: string
          outcome_date?: string
          relationship_type?: string
          satisfaction_rating?: number | null
          user_id?: string
          what_didnt_work?: Json | null
          what_worked?: Json | null
          would_date_similar?: boolean | null
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
      security_audit_log: {
        Row: {
          action: string
          created_at: string
          error_message: string | null
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          success: boolean | null
          target_user_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          error_message?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          success?: boolean | null
          target_user_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          error_message?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          success?: boolean | null
          target_user_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_actions: {
        Row: {
          action_type: string
          admin_user_id: string
          created_at: string
          duration_hours: number | null
          expires_at: string | null
          id: string
          is_active: boolean
          reason: string
          target_user_id: string
          updated_at: string
        }
        Insert: {
          action_type: string
          admin_user_id: string
          created_at?: string
          duration_hours?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          reason: string
          target_user_id: string
          updated_at?: string
        }
        Update: {
          action_type?: string
          admin_user_id?: string
          created_at?: string
          duration_hours?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          reason?: string
          target_user_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_compatibility_feedback: {
        Row: {
          created_at: string
          feedback_score: number
          id: string
          interaction_context: string | null
          interaction_type: string
          target_user_id: string
          timestamp: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback_score: number
          id?: string
          interaction_context?: string | null
          interaction_type: string
          target_user_id: string
          timestamp?: string
          user_id: string
        }
        Update: {
          created_at?: string
          feedback_score?: number
          id?: string
          interaction_context?: string | null
          interaction_type?: string
          target_user_id?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      user_journey_stages: {
        Row: {
          created_at: string
          id: string
          stage: string
          stage_data: Json | null
          stage_end_date: string | null
          stage_start_date: string
          transition_reason: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          stage: string
          stage_data?: Json | null
          stage_end_date?: string | null
          stage_start_date?: string
          transition_reason?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          stage?: string
          stage_data?: Json | null
          stage_end_date?: string | null
          stage_start_date?: string
          transition_reason?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_ml_preferences: {
        Row: {
          activity_preference: string | null
          behavioral_weight: number | null
          confidence_level: number | null
          created_at: string
          id: string
          interaction_style: string | null
          interest_weight: number | null
          rif_weight: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_preference?: string | null
          behavioral_weight?: number | null
          confidence_level?: number | null
          created_at?: string
          id?: string
          interaction_style?: string | null
          interest_weight?: number | null
          rif_weight?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_preference?: string | null
          behavioral_weight?: number | null
          confidence_level?: number | null
          created_at?: string
          id?: string
          interaction_style?: string | null
          interest_weight?: number | null
          rif_weight?: number | null
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
          drinking_status: string | null
          education_level: string | null
          exercise_habits: string | null
          gender_identity: Database["public"]["Enums"]["gender_identity"] | null
          gender_identity_custom: string | null
          height_cm: number | null
          id: string
          identity_visibility: boolean | null
          interests: string[] | null
          is_profile_complete: boolean | null
          last_preference_update: string | null
          location: string | null
          location_consent: boolean | null
          location_data: Json | null
          occupation: string | null
          onboarding_step: number | null
          phone_number: string | null
          photos: string[] | null
          preference_to_be_seen_by: string[] | null
          preference_to_see: string[] | null
          relationship_goals: string[] | null
          rif_quiz_answers: Json | null
          sexual_orientation:
            | Database["public"]["Enums"]["sexual_orientation"]
            | null
          sexual_orientation_custom: string | null
          show_location_on_profile: boolean | null
          smoking_status: string | null
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
          drinking_status?: string | null
          education_level?: string | null
          exercise_habits?: string | null
          gender_identity?:
            | Database["public"]["Enums"]["gender_identity"]
            | null
          gender_identity_custom?: string | null
          height_cm?: number | null
          id?: string
          identity_visibility?: boolean | null
          interests?: string[] | null
          is_profile_complete?: boolean | null
          last_preference_update?: string | null
          location?: string | null
          location_consent?: boolean | null
          location_data?: Json | null
          occupation?: string | null
          onboarding_step?: number | null
          phone_number?: string | null
          photos?: string[] | null
          preference_to_be_seen_by?: string[] | null
          preference_to_see?: string[] | null
          relationship_goals?: string[] | null
          rif_quiz_answers?: Json | null
          sexual_orientation?:
            | Database["public"]["Enums"]["sexual_orientation"]
            | null
          sexual_orientation_custom?: string | null
          show_location_on_profile?: boolean | null
          smoking_status?: string | null
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
          drinking_status?: string | null
          education_level?: string | null
          exercise_habits?: string | null
          gender_identity?:
            | Database["public"]["Enums"]["gender_identity"]
            | null
          gender_identity_custom?: string | null
          height_cm?: number | null
          id?: string
          identity_visibility?: boolean | null
          interests?: string[] | null
          is_profile_complete?: boolean | null
          last_preference_update?: string | null
          location?: string | null
          location_consent?: boolean | null
          location_data?: Json | null
          occupation?: string | null
          onboarding_step?: number | null
          phone_number?: string | null
          photos?: string[] | null
          preference_to_be_seen_by?: string[] | null
          preference_to_see?: string[] | null
          relationship_goals?: string[] | null
          rif_quiz_answers?: Json | null
          sexual_orientation?:
            | Database["public"]["Enums"]["sexual_orientation"]
            | null
          sexual_orientation_custom?: string | null
          show_location_on_profile?: boolean | null
          smoking_status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_reports: {
        Row: {
          conversation_id: string | null
          created_at: string
          description: string | null
          id: string
          reason: string
          report_type: string
          reported_user_id: string
          reporter_user_id: string
          status: string
          updated_at: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          report_type: string
          reported_user_id: string
          reporter_user_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          report_type?: string
          reported_user_id?: string
          reporter_user_id?: string
          status?: string
          updated_at?: string
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
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_safety_settings: {
        Row: {
          allow_messages_from_strangers: boolean
          auto_decline_inappropriate_content: boolean
          created_at: string
          emergency_contacts: Json | null
          id: string
          location_sharing_enabled: boolean
          require_mutual_match_for_messaging: boolean
          show_online_status: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          allow_messages_from_strangers?: boolean
          auto_decline_inappropriate_content?: boolean
          created_at?: string
          emergency_contacts?: Json | null
          id?: string
          location_sharing_enabled?: boolean
          require_mutual_match_for_messaging?: boolean
          show_online_status?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          allow_messages_from_strangers?: boolean
          auto_decline_inappropriate_content?: boolean
          created_at?: string
          emergency_contacts?: Json | null
          id?: string
          location_sharing_enabled?: boolean
          require_mutual_match_for_messaging?: boolean
          show_online_status?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          device_type: string | null
          id: string
          session_end: string | null
          session_start: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_type?: string | null
          id?: string
          session_end?: string | null
          session_start?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_type?: string | null
          id?: string
          session_end?: string | null
          session_start?: string
          user_id?: string
        }
        Relationships: []
      }
      vendor_profiles: {
        Row: {
          category: string
          created_at: string
          description: string | null
          email: string | null
          id: string
          is_active: boolean | null
          is_lgbtq_friendly: boolean | null
          name: string
          phone: string | null
          photos: string[] | null
          price_level: number | null
          service_area_km: number | null
          updated_at: string
          vibe_tags: string[] | null
          website_url: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_lgbtq_friendly?: boolean | null
          name: string
          phone?: string | null
          photos?: string[] | null
          price_level?: number | null
          service_area_km?: number | null
          updated_at?: string
          vibe_tags?: string[] | null
          website_url?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_lgbtq_friendly?: boolean | null
          name?: string
          phone?: string | null
          photos?: string[] | null
          price_level?: number | null
          service_area_km?: number | null
          updated_at?: string
          vibe_tags?: string[] | null
          website_url?: string | null
        }
        Relationships: []
      }
      venue_care_scores: {
        Row: {
          accessibility_score: number
          created_at: string
          id: string
          last_updated: string
          lgbtq_friendly_score: number
          overall_score: number
          quality_score: number
          safety_score: number
          venue_id: string | null
        }
        Insert: {
          accessibility_score?: number
          created_at?: string
          id?: string
          last_updated?: string
          lgbtq_friendly_score?: number
          overall_score?: number
          quality_score?: number
          safety_score?: number
          venue_id?: string | null
        }
        Update: {
          accessibility_score?: number
          created_at?: string
          id?: string
          last_updated?: string
          lgbtq_friendly_score?: number
          overall_score?: number
          quality_score?: number
          safety_score?: number
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "venue_care_scores_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venue_types: {
        Row: {
          category: string
          created_at: string
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          category: string
          created_at?: string
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      venues: {
        Row: {
          address: string | null
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          is_lgbtq_friendly: boolean | null
          lat: number
          lng: number
          name: string
          neighborhood_id: string | null
          operating_hours: Json | null
          phone: string | null
          photos: string[] | null
          price_level: number | null
          rating: number | null
          updated_at: string
          venue_type_id: string | null
          vibe_tags: string[] | null
          website_url: string | null
        }
        Insert: {
          address?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_lgbtq_friendly?: boolean | null
          lat: number
          lng: number
          name: string
          neighborhood_id?: string | null
          operating_hours?: Json | null
          phone?: string | null
          photos?: string[] | null
          price_level?: number | null
          rating?: number | null
          updated_at?: string
          venue_type_id?: string | null
          vibe_tags?: string[] | null
          website_url?: string | null
        }
        Update: {
          address?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_lgbtq_friendly?: boolean | null
          lat?: number
          lng?: number
          name?: string
          neighborhood_id?: string | null
          operating_hours?: Json | null
          phone?: string | null
          photos?: string[] | null
          price_level?: number | null
          rating?: number | null
          updated_at?: string
          venue_type_id?: string | null
          vibe_tags?: string[] | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "venues_neighborhood_id_fkey"
            columns: ["neighborhood_id"]
            isOneToOne: false
            referencedRelation: "neighborhoods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venues_venue_type_id_fkey"
            columns: ["venue_type_id"]
            isOneToOne: false
            referencedRelation: "venue_types"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist_submissions: {
        Row: {
          accessibility_needs: string | null
          age_range: string | null
          approval_notes: string | null
          approval_status: string
          budget_band: string | null
          city: string | null
          conversation_style: string | null
          country: string | null
          crowd_tolerance: string | null
          drinking: string | null
          email: string
          email_opt_in: boolean | null
          first_name: string
          gender_identity: string | null
          heard_about_us: string | null
          id: string
          ip_address: string | null
          last_name: string | null
          lgbtq_plus: boolean | null
          looking_for: string | null
          orientation: string | null
          other_notes: string | null
          race_ethnicity: string[] | null
          relationship_goal: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          smoking: string | null
          source_page: string | null
          state_region: string | null
          submitted_at: string
          time_window: string | null
          user_agent: string | null
          weekly_energy: string | null
          why_monark: string | null
          willing_to_beta: boolean | null
          zip: string | null
        }
        Insert: {
          accessibility_needs?: string | null
          age_range?: string | null
          approval_notes?: string | null
          approval_status?: string
          budget_band?: string | null
          city?: string | null
          conversation_style?: string | null
          country?: string | null
          crowd_tolerance?: string | null
          drinking?: string | null
          email: string
          email_opt_in?: boolean | null
          first_name: string
          gender_identity?: string | null
          heard_about_us?: string | null
          id?: string
          ip_address?: string | null
          last_name?: string | null
          lgbtq_plus?: boolean | null
          looking_for?: string | null
          orientation?: string | null
          other_notes?: string | null
          race_ethnicity?: string[] | null
          relationship_goal?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          smoking?: string | null
          source_page?: string | null
          state_region?: string | null
          submitted_at?: string
          time_window?: string | null
          user_agent?: string | null
          weekly_energy?: string | null
          why_monark?: string | null
          willing_to_beta?: boolean | null
          zip?: string | null
        }
        Update: {
          accessibility_needs?: string | null
          age_range?: string | null
          approval_notes?: string | null
          approval_status?: string
          budget_band?: string | null
          city?: string | null
          conversation_style?: string | null
          country?: string | null
          crowd_tolerance?: string | null
          drinking?: string | null
          email?: string
          email_opt_in?: boolean | null
          first_name?: string
          gender_identity?: string | null
          heard_about_us?: string | null
          id?: string
          ip_address?: string | null
          last_name?: string | null
          lgbtq_plus?: boolean | null
          looking_for?: string | null
          orientation?: string | null
          other_notes?: string | null
          race_ethnicity?: string[] | null
          relationship_goal?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          smoking?: string | null
          source_page?: string | null
          state_region?: string | null
          submitted_at?: string
          time_window?: string | null
          user_agent?: string | null
          weekly_energy?: string | null
          why_monark?: string | null
          willing_to_beta?: boolean | null
          zip?: string | null
        }
        Relationships: []
      }
      weekly_eq_settings: {
        Row: {
          active_from: string
          budget_range: string
          conversation_style: string
          created_at: string
          crowd_tolerance: string
          duration_preference: number
          energy_level: string
          expires_at: string | null
          id: string
          radius_km: number
          time_boundaries: Json | null
          updated_at: string
          user_id: string
          values_priority: Json | null
        }
        Insert: {
          active_from?: string
          budget_range?: string
          conversation_style?: string
          created_at?: string
          crowd_tolerance?: string
          duration_preference?: number
          energy_level?: string
          expires_at?: string | null
          id?: string
          radius_km?: number
          time_boundaries?: Json | null
          updated_at?: string
          user_id: string
          values_priority?: Json | null
        }
        Update: {
          active_from?: string
          budget_range?: string
          conversation_style?: string
          created_at?: string
          crowd_tolerance?: string
          duration_preference?: number
          energy_level?: string
          expires_at?: string | null
          id?: string
          radius_km?: number
          time_boundaries?: Json | null
          updated_at?: string
          user_id?: string
          values_priority?: Json | null
        }
        Relationships: []
      }
      weekly_options: {
        Row: {
          care_index_score: number
          created_at: string
          distance_km: number | null
          eq_fit_chips: Json
          id: string
          is_expired: boolean | null
          is_template: boolean | null
          option_number: number
          tapped_at: string | null
          time_window: Json
          title: string
          user_id: string
          venue_data: Json | null
          vibe_line: string
          week_start: string
          why_this_for_you: string
        }
        Insert: {
          care_index_score?: number
          created_at?: string
          distance_km?: number | null
          eq_fit_chips?: Json
          id?: string
          is_expired?: boolean | null
          is_template?: boolean | null
          option_number: number
          tapped_at?: string | null
          time_window: Json
          title: string
          user_id: string
          venue_data?: Json | null
          vibe_line: string
          week_start: string
          why_this_for_you: string
        }
        Update: {
          care_index_score?: number
          created_at?: string
          distance_km?: number | null
          eq_fit_chips?: Json
          id?: string
          is_expired?: boolean | null
          is_template?: boolean | null
          option_number?: number
          tapped_at?: string | null
          time_window?: Json
          title?: string
          user_id?: string
          venue_data?: Json | null
          vibe_line?: string
          week_start?: string
          why_this_for_you?: string
        }
        Relationships: []
      }
      weekly_options_engagement: {
        Row: {
          created_at: string
          id: string
          options_tapped: number | null
          options_viewed: number | null
          updated_at: string
          user_id: string
          viewed_at: string | null
          week_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          options_tapped?: number | null
          options_viewed?: number | null
          updated_at?: string
          user_id: string
          viewed_at?: string | null
          week_start: string
        }
        Update: {
          created_at?: string
          id?: string
          options_tapped?: number | null
          options_viewed?: number | null
          updated_at?: string
          user_id?: string
          viewed_at?: string | null
          week_start?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_user_profiles: {
        Row: {
          age: number | null
          age_verified: boolean | null
          bio: string | null
          created_at: string | null
          date_preferences: Json | null
          drinking_status: string | null
          education_level: string | null
          exercise_habits: string | null
          gender_identity: Database["public"]["Enums"]["gender_identity"] | null
          gender_identity_custom: string | null
          height_cm: number | null
          interests: string[] | null
          is_profile_complete: boolean | null
          location: string | null
          occupation: string | null
          photos: string[] | null
          relationship_goals: string[] | null
          sexual_orientation:
            | Database["public"]["Enums"]["sexual_orientation"]
            | null
          sexual_orientation_custom: string | null
          smoking_status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          age?: number | null
          age_verified?: boolean | null
          bio?: string | null
          created_at?: string | null
          date_preferences?: Json | null
          drinking_status?: string | null
          education_level?: string | null
          exercise_habits?: string | null
          gender_identity?: never
          gender_identity_custom?: never
          height_cm?: number | null
          interests?: string[] | null
          is_profile_complete?: boolean | null
          location?: string | null
          occupation?: string | null
          photos?: string[] | null
          relationship_goals?: string[] | null
          sexual_orientation?: never
          sexual_orientation_custom?: never
          smoking_status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          age?: number | null
          age_verified?: boolean | null
          bio?: string | null
          created_at?: string | null
          date_preferences?: Json | null
          drinking_status?: string | null
          education_level?: string | null
          exercise_habits?: string | null
          gender_identity?: never
          gender_identity_custom?: never
          height_cm?: number | null
          interests?: string[] | null
          is_profile_complete?: boolean | null
          location?: string | null
          occupation?: string | null
          photos?: string[] | null
          relationship_goals?: string[] | null
          sexual_orientation?: never
          sexual_orientation_custom?: never
          smoking_status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      atomic_share_contact: {
        Args: {
          p_conversation_id: string
          p_recipient_id: string
          p_sharer_id: string
        }
        Returns: Json
      }
      calculate_age: { Args: { birth_date: string }; Returns: number }
      can_view_profile: {
        Args: { target_id: string; viewer_id: string }
        Returns: boolean
      }
      check_mutual_match: {
        Args: { user_a: string; user_b: string }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          p_action_type: string
          p_max_requests: number
          p_user_id: string
          p_window_minutes: number
        }
        Returns: boolean
      }
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      delete_user_completely: {
        Args: { user_id_input: string }
        Returns: undefined
      }
      find_nearest_neighborhood: {
        Args: { user_lat: number; user_lng: number }
        Returns: {
          city: string
          country: string
          distance_km: number
          id: string
          lat: number
          lng: number
          name: string
          state: string
          transit_score: number
          walkability_score: number
        }[]
      }
      get_reports_against_me: {
        Args: never
        Returns: {
          created_at: string
          id: string
          report_type: string
          status: string
          updated_at: string
        }[]
      }
      has_mutual_match: {
        Args: { user_a: string; user_b: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_match_or_pool_member: {
        Args: { target_id: string; viewer_id: string }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          action_type: string
          admin_user_id: string
          details?: Json
          target_id: string
          target_table: string
        }
        Returns: undefined
      }
      log_security_event: {
        Args: {
          p_action: string
          p_error_message?: string
          p_event_type: string
          p_metadata?: Json
          p_resource_id?: string
          p_resource_type?: string
          p_success?: boolean
          p_target_user_id?: string
        }
        Returns: string
      }
      mark_messages_as_read: {
        Args: { p_conversation_id: string; p_user_id: string }
        Returns: undefined
      }
      verify_age_18_plus: { Args: { birth_date: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
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
