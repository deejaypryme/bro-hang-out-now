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
      achievements: {
        Row: {
          description: string
          emoji: string
          name: string
          slug: string
          sort_order: number
          threshold: number | null
        }
        Insert: {
          description: string
          emoji: string
          name: string
          slug: string
          sort_order?: number
          threshold?: number | null
        }
        Update: {
          description?: string
          emoji?: string
          name?: string
          slug?: string
          sort_order?: number
          threshold?: number | null
        }
        Relationships: []
      }
      activities: {
        Row: {
          category: string
          created_at: string
          default_duration_minutes: number
          emoji: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          category: string
          created_at?: string
          default_duration_minutes?: number
          emoji: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          category?: string
          created_at?: string
          default_duration_minutes?: number
          emoji?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      friend_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          expires_at: string
          id: string
          invitee_email: string | null
          invitee_phone: string | null
          invitee_user_id: string | null
          inviter_id: string
          sent_via: Database["public"]["Enums"]["send_channel"]
          status: Database["public"]["Enums"]["invitation_status"]
          token_hash: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          invitee_email?: string | null
          invitee_phone?: string | null
          invitee_user_id?: string | null
          inviter_id: string
          sent_via?: Database["public"]["Enums"]["send_channel"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token_hash: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          invitee_email?: string | null
          invitee_phone?: string | null
          invitee_user_id?: string | null
          inviter_id?: string
          sent_via?: Database["public"]["Enums"]["send_channel"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token_hash?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "friend_invitations_invitee_user_id_fkey"
            columns: ["invitee_user_id"]
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
          created_at: string
          favorite_a: boolean
          favorite_b: boolean
          id: string
          notes_a: string | null
          notes_b: string | null
          requested_by: string
          status: Database["public"]["Enums"]["friendship_status"]
          updated_at: string
          user_a: string
          user_b: string
        }
        Insert: {
          created_at?: string
          favorite_a?: boolean
          favorite_b?: boolean
          id?: string
          notes_a?: string | null
          notes_b?: string | null
          requested_by: string
          status?: Database["public"]["Enums"]["friendship_status"]
          updated_at?: string
          user_a: string
          user_b: string
        }
        Update: {
          created_at?: string
          favorite_a?: boolean
          favorite_b?: boolean
          id?: string
          notes_a?: string | null
          notes_b?: string | null
          requested_by?: string
          status?: Database["public"]["Enums"]["friendship_status"]
          updated_at?: string
          user_a?: string
          user_b?: string
        }
        Relationships: [
          {
            foreignKeyName: "friendships_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_user_a_fkey"
            columns: ["user_a"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_user_b_fkey"
            columns: ["user_b"]
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
          invitee_email: string | null
          invitee_phone: string | null
          invitee_user_id: string | null
          inviter_id: string
          message: string | null
          responded_at: string | null
          sent_via: Database["public"]["Enums"]["send_channel"]
          status: Database["public"]["Enums"]["invitation_status"]
          token_hash: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          hangout_id: string
          id?: string
          invitee_email?: string | null
          invitee_phone?: string | null
          invitee_user_id?: string | null
          inviter_id: string
          message?: string | null
          responded_at?: string | null
          sent_via?: Database["public"]["Enums"]["send_channel"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token_hash: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          hangout_id?: string
          id?: string
          invitee_email?: string | null
          invitee_phone?: string | null
          invitee_user_id?: string | null
          inviter_id?: string
          message?: string | null
          responded_at?: string | null
          sent_via?: Database["public"]["Enums"]["send_channel"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token_hash?: string
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
          {
            foreignKeyName: "hangout_invitations_invitee_user_id_fkey"
            columns: ["invitee_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hangout_invitations_inviter_id_fkey"
            columns: ["inviter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hangout_time_proposals: {
        Row: {
          created_at: string
          hangout_id: string
          id: string
          is_selected: boolean
          proposed_by: string | null
          proposed_duration_minutes: number | null
          proposed_start: string
          votes: Json
        }
        Insert: {
          created_at?: string
          hangout_id: string
          id?: string
          is_selected?: boolean
          proposed_by?: string | null
          proposed_duration_minutes?: number | null
          proposed_start: string
          votes?: Json
        }
        Update: {
          created_at?: string
          hangout_id?: string
          id?: string
          is_selected?: boolean
          proposed_by?: string | null
          proposed_duration_minutes?: number | null
          proposed_start?: string
          votes?: Json
        }
        Relationships: [
          {
            foreignKeyName: "hangout_time_proposals_hangout_id_fkey"
            columns: ["hangout_id"]
            isOneToOne: false
            referencedRelation: "hangouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hangout_time_proposals_proposed_by_fkey"
            columns: ["proposed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hangouts: {
        Row: {
          activity_slug: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          completed_at: string | null
          created_at: string
          custom_activity_emoji: string | null
          custom_activity_name: string | null
          duration_minutes: number | null
          emotional_signal:
            | Database["public"]["Enums"]["emotional_signal"]
            | null
          event_timezone: string
          friend_id: string
          id: string
          location: string | null
          message: string | null
          organizer_id: string
          previous_starts_at: string | null
          sequence: number
          starts_at: string | null
          status: Database["public"]["Enums"]["hangout_status"]
          updated_at: string
        }
        Insert: {
          activity_slug?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          completed_at?: string | null
          created_at?: string
          custom_activity_emoji?: string | null
          custom_activity_name?: string | null
          duration_minutes?: number | null
          emotional_signal?:
            | Database["public"]["Enums"]["emotional_signal"]
            | null
          event_timezone?: string
          friend_id: string
          id?: string
          location?: string | null
          message?: string | null
          organizer_id: string
          previous_starts_at?: string | null
          sequence?: number
          starts_at?: string | null
          status?: Database["public"]["Enums"]["hangout_status"]
          updated_at?: string
        }
        Update: {
          activity_slug?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          completed_at?: string | null
          created_at?: string
          custom_activity_emoji?: string | null
          custom_activity_name?: string | null
          duration_minutes?: number | null
          emotional_signal?:
            | Database["public"]["Enums"]["emotional_signal"]
            | null
          event_timezone?: string
          friend_id?: string
          id?: string
          location?: string | null
          message?: string | null
          organizer_id?: string
          previous_starts_at?: string | null
          sequence?: number
          starts_at?: string | null
          status?: Database["public"]["Enums"]["hangout_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hangouts_activity_slug_fkey"
            columns: ["activity_slug"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "hangouts_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      invite_rate_limits: {
        Row: {
          count: number
          user_id: string
          window_start: string
        }
        Insert: {
          count?: number
          user_id: string
          window_start: string
        }
        Update: {
          count?: number
          user_id?: string
          window_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "invite_rate_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      point_events: {
        Row: {
          created_at: string
          delta: number
          hangout_id: string | null
          id: string
          reason: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delta: number
          hangout_id?: string | null
          id?: string
          reason: string
          user_id: string
        }
        Update: {
          created_at?: string
          delta?: number
          hangout_id?: string | null
          id?: string
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "point_events_hangout_id_fkey"
            columns: ["hangout_id"]
            isOneToOne: false
            referencedRelation: "hangouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_events_user_id_fkey"
            columns: ["user_id"]
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
          preferred_times: Json
          timezone: string
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          preferred_times?: Json
          timezone?: string
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          preferred_times?: Json
          timezone?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      time_slots: {
        Row: {
          created_at: string
          id: string
          is_busy: boolean
          slot_end: string
          slot_start: string
          source: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_busy?: boolean
          slot_end: string
          slot_start: string
          source?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_busy?: boolean
          slot_end?: string
          slot_start?: string
          source?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_slots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_slug: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_slug: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_slug?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_slug_fkey"
            columns: ["achievement_slug"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_availability: {
        Row: {
          created_at: string
          end_time: string
          id: string
          kind: Database["public"]["Enums"]["availability_kind"]
          specific_date: string | null
          start_time: string
          updated_at: string
          user_id: string
          weekday: number | null
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          kind: Database["public"]["Enums"]["availability_kind"]
          specific_date?: string | null
          start_time: string
          updated_at?: string
          user_id: string
          weekday?: number | null
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          kind?: Database["public"]["Enums"]["availability_kind"]
          specific_date?: string | null
          start_time?: string
          updated_at?: string
          user_id?: string
          weekday?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_availability_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          bro_points: number
          current_streak: number
          hangouts_completed: number
          last_completed_date: string | null
          longest_streak: number
          updated_at: string
          user_id: string
        }
        Insert: {
          bro_points?: number
          current_streak?: number
          hangouts_completed?: number
          last_completed_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          bro_points?: number
          current_streak?: number
          hangouts_completed?: number
          last_completed_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _grant_completion: {
        Args: { p_hangout: string; p_user: string }
        Returns: undefined
      }
      accept_friendship: {
        Args: { p_friendship_id: string }
        Returns: {
          created_at: string
          favorite_a: boolean
          favorite_b: boolean
          id: string
          notes_a: string | null
          notes_b: string | null
          requested_by: string
          status: Database["public"]["Enums"]["friendship_status"]
          updated_at: string
          user_a: string
          user_b: string
        }
        SetofOptions: {
          from: "*"
          to: "friendships"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      are_friends: { Args: { p_other: string }; Returns: boolean }
      award_points: {
        Args: {
          p_delta: number
          p_hangout: string
          p_reason: string
          p_user: string
        }
        Returns: undefined
      }
      block_friendship: {
        Args: { p_friendship_id: string }
        Returns: {
          created_at: string
          favorite_a: boolean
          favorite_b: boolean
          id: string
          notes_a: string | null
          notes_b: string | null
          requested_by: string
          status: Database["public"]["Enums"]["friendship_status"]
          updated_at: string
          user_a: string
          user_b: string
        }
        SetofOptions: {
          from: "*"
          to: "friendships"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      cancel_hangout: {
        Args: { p_hangout_id: string; p_reason?: string }
        Returns: {
          activity_slug: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          completed_at: string | null
          created_at: string
          custom_activity_emoji: string | null
          custom_activity_name: string | null
          duration_minutes: number | null
          emotional_signal:
            | Database["public"]["Enums"]["emotional_signal"]
            | null
          event_timezone: string
          friend_id: string
          id: string
          location: string | null
          message: string | null
          organizer_id: string
          previous_starts_at: string | null
          sequence: number
          starts_at: string | null
          status: Database["public"]["Enums"]["hangout_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "hangouts"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      check_achievements: { Args: { p_user: string }; Returns: undefined }
      complete_hangout: {
        Args: { p_hangout_id: string }
        Returns: {
          activity_slug: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          completed_at: string | null
          created_at: string
          custom_activity_emoji: string | null
          custom_activity_name: string | null
          duration_minutes: number | null
          emotional_signal:
            | Database["public"]["Enums"]["emotional_signal"]
            | null
          event_timezone: string
          friend_id: string
          id: string
          location: string | null
          message: string | null
          organizer_id: string
          previous_starts_at: string | null
          sequence: number
          starts_at: string | null
          status: Database["public"]["Enums"]["hangout_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "hangouts"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_hangout_invitation: { Args: { p_token_hash: string }; Returns: Json }
      has_role: {
        Args: { p_role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      is_hangout_participant: {
        Args: { p_hangout_id: string }
        Returns: boolean
      }
      list_incoming_friend_requests: {
        Args: never
        Returns: {
          avatar_url: string
          created_at: string
          friendship_id: string
          full_name: string
          requester_id: string
          username: string
        }[]
      }
      record_invite_send: { Args: never; Returns: undefined }
      respond_to_hangout_invitation: {
        Args: { p_action: string; p_proposal_id?: string; p_token_hash: string }
        Returns: Json
      }
      search_profiles: {
        Args: { p_query: string }
        Returns: {
          avatar_url: string
          full_name: string
          id: string
          username: string
        }[]
      }
      send_friend_request: {
        Args: { p_target: string }
        Returns: {
          created_at: string
          favorite_a: boolean
          favorite_b: boolean
          id: string
          notes_a: string | null
          notes_b: string | null
          requested_by: string
          status: Database["public"]["Enums"]["friendship_status"]
          updated_at: string
          user_a: string
          user_b: string
        }
        SetofOptions: {
          from: "*"
          to: "friendships"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      set_friendship_favorite: {
        Args: { p_favorite: boolean; p_friendship_id: string }
        Returns: undefined
      }
      unfriend: { Args: { p_friendship_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "user" | "moderator" | "admin"
      availability_kind: "recurring" | "one_off"
      emotional_signal:
        | "need_to_talk"
        | "catch_up"
        | "just_chill"
        | "blow_off_steam"
      friendship_status: "pending" | "accepted" | "blocked"
      hangout_status:
        | "draft"
        | "pending"
        | "confirmed"
        | "completed"
        | "cancelled"
        | "rescheduled"
      invitation_status:
        | "pending"
        | "accepted"
        | "declined"
        | "expired"
        | "cancelled"
      send_channel: "email" | "sms" | "in_app"
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
      app_role: ["user", "moderator", "admin"],
      availability_kind: ["recurring", "one_off"],
      emotional_signal: [
        "need_to_talk",
        "catch_up",
        "just_chill",
        "blow_off_steam",
      ],
      friendship_status: ["pending", "accepted", "blocked"],
      hangout_status: [
        "draft",
        "pending",
        "confirmed",
        "completed",
        "cancelled",
        "rescheduled",
      ],
      invitation_status: [
        "pending",
        "accepted",
        "declined",
        "expired",
        "cancelled",
      ],
      send_channel: ["email", "sms", "in_app"],
    },
  },
} as const
