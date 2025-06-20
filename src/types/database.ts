
export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  preferred_times: string[];
  created_at: string;
  updated_at: string;
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
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
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  duration_minutes: number | null;
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
  status: 'online' | 'offline' | 'busy';
  lastSeen: Date;
  friendshipDate: Date;
  friendshipStatus: 'pending' | 'accepted' | 'blocked';
}

export interface HangoutWithDetails extends Hangout {
  friendName: string;
  date: Date;
  time: string;
  confirmed: boolean;
  confirmedDateTime?: Date;
}
