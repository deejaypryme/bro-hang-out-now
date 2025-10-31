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
      activities: {
        Row: {
          category: string | null
          created_at: string
          emoji: string
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          emoji: string
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string
          emoji?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          attendees: string[] | null
          created_at: string
          description: string | null
          end_time: string
          id: string
          is_all_day: boolean
          location: string | null
          provider_event_id: string
          provider_id: string
          start_time: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attendees?: string[] | null
          created_at?: string
          description?: string | null
          end_time: string
          id?: string
          is_all_day?: boolean
          location?: string | null
          provider_event_id: string
          provider_id: string
          start_time: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attendees?: string[] | null
          created_at?: string
          description?: string | null
          end_time?: string
          id?: string
          is_all_day?: boolean
          location?: string | null
          provider_event_id?: string
          provider_id?: string
          start_time?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      calendar_integrations: {
        Row: {
          access_token: string
          calendar_id: string
          calendar_name: string
          created_at: string
          expires_at: string
          id: string
          is_active: boolean
          last_sync_at: string | null
          provider: string
          refresh_token: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          calendar_id: string
          calendar_name: string
          created_at?: string
          expires_at: string
          id?: string
          is_active?: boolean
          last_sync_at?: string | null
          provider: string
          refresh_token?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          calendar_id?: string
          calendar_name?: string
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          last_sync_at?: string | null
          provider?: string
          refresh_token?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      friend_invitations: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          invitation_token: string
          invitee_email: string | null
          invitee_id: string | null
          invitee_phone: string | null
          inviter_id: string
          message: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invitee_email?: string | null
          invitee_id?: string | null
          invitee_phone?: string | null
          inviter_id: string
          message?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invitee_email?: string | null
          invitee_id?: string | null
          invitee_phone?: string | null
          inviter_id?: string
          message?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "friend_invitations_invitee_id_fkey"
            columns: ["invitee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_invitations_inviter_id_fkey"
            columns: ["inviter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          blocked_by: string | null
          created_at: string
          favorite: boolean | null
          friend_id: string
          id: string
          notes: string | null
          status: string
          user_id: string
        }
        Insert: {
          blocked_by?: string | null
          created_at?: string
          favorite?: boolean | null
          friend_id: string
          id?: string
          notes?: string | null
          status?: string
          user_id: string
        }
        Update: {
          blocked_by?: string | null
          created_at?: string
          favorite?: boolean | null
          friend_id?: string
          id?: string
          notes?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "friendships_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hangout_invitations: {
        Row: {
          created_at: string
          expires_at: string
          hangout_id: string
          id: string
          invitation_token: string
          invitee_id: string
          inviter_id: string
          message: string | null
          responded_at: string | null
          sent_via: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          hangout_id: string
          id?: string
          invitation_token?: string
          invitee_id: string
          inviter_id: string
          message?: string | null
          responded_at?: string | null
          sent_via?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          hangout_id?: string
          id?: string
          invitation_token?: string
          invitee_id?: string
          inviter_id?: string
          message?: string | null
          responded_at?: string | null
          sent_via?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hangout_invitations_hangout_id_fkey"
            columns: ["hangout_id"]
            isOneToOne: false
            referencedRelation: "hangouts"
            referencedColumns: ["id"]
          },
        ]
      }
      hangout_time_proposals: {
        Row: {
          created_at: string
          created_by: string
          hangout_id: string
          id: string
          proposed_date: string
          proposed_end_time: string
          proposed_start_time: string
        }
        Insert: {
          created_at?: string
          created_by: string
          hangout_id: string
          id?: string
          proposed_date: string
          proposed_end_time: string
          proposed_start_time: string
        }
        Update: {
          created_at?: string
          created_by?: string
          hangout_id?: string
          id?: string
          proposed_date?: string
          proposed_end_time?: string
          proposed_start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "hangout_time_proposals_hangout_id_fkey"
            columns: ["hangout_id"]
            isOneToOne: false
            referencedRelation: "hangouts"
            referencedColumns: ["id"]
          },
        ]
      }
      hangouts: {
        Row: {
          activity_emoji: string
          activity_id: string | null
          activity_name: string
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          created_at: string
          duration_minutes: number | null
          emotional_signal: Json | null
          friend_id: string
          id: string
          location: string | null
          organizer_id: string
          scheduled_date: string
          scheduled_time: string
          status: string
          updated_at: string
        }
        Insert: {
          activity_emoji?: string
          activity_id?: string | null
          activity_name: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          duration_minutes?: number | null
          emotional_signal?: Json | null
          friend_id: string
          id?: string
          location?: string | null
          organizer_id: string
          scheduled_date: string
          scheduled_time: string
          status?: string
          updated_at?: string
        }
        Update: {
          activity_emoji?: string
          activity_id?: string | null
          activity_name?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          duration_minutes?: number | null
          emotional_signal?: Json | null
          friend_id?: string
          id?: string
          location?: string | null
          organizer_id?: string
          scheduled_date?: string
          scheduled_time?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hangouts_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hangouts_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hangouts_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          preferred_times: string[] | null
          timezone: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          preferred_times?: string[] | null
          timezone?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          preferred_times?: string[] | null
          timezone?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      time_slots: {
        Row: {
          available: boolean
          busy: boolean
          created_at: string
          date: string
          end_time: string
          id: string
          start_time: string
          user_id: string
        }
        Insert: {
          available?: boolean
          busy?: boolean
          created_at?: string
          date: string
          end_time: string
          id?: string
          start_time: string
          user_id: string
        }
        Update: {
          available?: boolean
          busy?: boolean
          created_at?: string
          date?: string
          end_time?: string
          id?: string
          start_time?: string
          user_id?: string
        }
        Relationships: []
      }
      user_availability: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean
          is_recurring: boolean
          specific_date: string | null
          start_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean
          is_recurring?: boolean
          specific_date?: string | null
          start_time: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean
          is_recurring?: boolean
          specific_date?: string | null
          start_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_availability_exceptions: {
        Row: {
          created_at: string
          end_time: string
          exception_date: string
          id: string
          reason: string | null
          start_time: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_time: string
          exception_date: string
          id?: string
          reason?: string | null
          start_time: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_time?: string
          exception_date?: string
          id?: string
          reason?: string | null
          start_time?: string
          user_id?: string
        }
        Relationships: []
      }
      user_presence: {
        Row: {
          created_at: string
          custom_message: string | null
          id: string
          last_seen: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_message?: string | null
          id?: string
          last_seen?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_message?: string | null
          id?: string
          last_seen?: string
          status?: string
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
