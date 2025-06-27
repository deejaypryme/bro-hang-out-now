
export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  preferred_times: string[];
  timezone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  blocked_by: string | null;
  notes: string | null;
  favorite: boolean | null;
  created_at: string;
}

export interface FriendInvitation {
  id: string;
  inviter_id: string;
  invitee_email: string | null;
  invitee_phone: string | null;
  invitee_id: string | null;
  invitation_token: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  message: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface UserPresence {
  id: string;
  user_id: string;
  status: 'online' | 'offline' | 'busy' | 'away';
  last_seen: string;
  custom_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  name: string;
  emoji: string;
  category: string | null;
  created_at: string;
}

export interface Hangout {
  id: string;
  organizer_id: string;
  friend_id: string;
  activity_id: string | null;
  activity_name: string;
  activity_emoji: string;
  scheduled_date: string;
  scheduled_time: string;
  location: string | null;
  status: 'draft' | 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  duration_minutes: number | null;
  emotional_signal: any | null;
  cancellation_reason: string | null;
  cancelled_by: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TimeSlot {
  id: string;
  user_id: string;
  date: string;
  start_time: string;
  end_time: string;
  available: boolean;
  busy: boolean;
  created_at: string;
}

// Extended types for UI components
export interface FriendWithProfile extends Profile {
  status: 'online' | 'offline' | 'busy' | 'away';
  lastSeen: Date;
  friendshipDate: Date;
  friendshipStatus: 'pending' | 'accepted' | 'blocked';
  friendshipId: string;
  notes: string | null;
  favorite: boolean;
  customMessage: string | null;
}

export interface HangoutWithDetails extends Hangout {
  friendName: string;
  date: Date;
  time: string;
  confirmed: boolean;
  confirmedDateTime?: Date;
}

export interface FriendInvitationWithProfile extends FriendInvitation {
  inviterProfile?: Profile;
  inviteeProfile?: Profile;
}

export interface HangoutInvitation {
  id: string;
  hangout_id: string;
  inviter_id: string;
  invitee_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  invitation_token: string;
  message: string | null;
  sent_via: 'email' | 'sms' | 'app' | null;
  expires_at: string;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface HangoutTimeProposal {
  id: string;
  hangout_id: string;
  proposed_date: string;
  proposed_start_time: string;
  proposed_end_time: string;
  created_by: string;
  created_at: string;
}
