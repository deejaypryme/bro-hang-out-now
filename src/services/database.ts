
import { supabase } from "@/integrations/supabase/client";
import type { Profile, Friendship, Activity, Hangout, TimeSlot, FriendWithProfile, HangoutWithDetails } from "@/types/database";

// Profile services
export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async createProfile(profile: Omit<Profile, 'created_at' | 'updated_at'>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Friend services
export const friendService = {
  async getFriends(userId: string): Promise<FriendWithProfile[]> {
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        id,
        friend_id,
        status,
        notes,
        favorite,
        blocked_by,
        created_at,
        friend_profile:profiles!friendships_friend_id_fkey(*),
        friend_presence:user_presence!user_presence_user_id_fkey(*)
      `)
      .eq('user_id', userId)
      .eq('status', 'accepted')
      .is('blocked_by', null);
    
    if (error) throw error;
    
    return (data || []).map((friendship: any): FriendWithProfile => ({
      id: friendship.friend_profile.id,
      username: friendship.friend_profile.username,
      full_name: friendship.friend_profile.full_name,
      avatar_url: friendship.friend_profile.avatar_url,
      phone: friendship.friend_profile.phone,
      preferred_times: friendship.friend_profile.preferred_times || [],
      created_at: friendship.friend_profile.created_at,
      updated_at: friendship.friend_profile.updated_at,
      status: friendship.friend_presence?.status || 'offline',
      lastSeen: new Date(friendship.friend_presence?.last_seen || friendship.friend_profile.updated_at),
      friendshipDate: new Date(friendship.created_at),
      friendshipStatus: friendship.status,
      friendshipId: friendship.id,
      notes: friendship.notes,
      favorite: friendship.favorite || false,
      customMessage: friendship.friend_presence?.custom_message
    }));
  },

  async sendFriendRequest(userId: string, friendId: string): Promise<Friendship> {
    const { data, error } = await supabase
      .from('friendships')
      .insert({
        user_id: userId,
        friend_id: friendId,
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      status: data.status as 'pending' | 'accepted' | 'blocked'
    };
  },

  async acceptFriendRequest(friendshipId: string): Promise<Friendship> {
    const { data, error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId)
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      status: data.status as 'pending' | 'accepted' | 'blocked'
    };
  }
};

// Activity services
export const activityService = {
  async getActivities(): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  }
};

// Hangout services
export const hangoutService = {
  async getHangouts(userId: string): Promise<HangoutWithDetails[]> {
    const { data, error } = await supabase
      .from('hangouts')
      .select(`
        *,
        friend_profile:profiles!hangouts_friend_id_fkey(full_name),
        organizer_profile:profiles!hangouts_organizer_id_fkey(full_name)
      `)
      .or(`organizer_id.eq.${userId},friend_id.eq.${userId}`)
      .order('scheduled_date', { ascending: true });
    
    if (error) throw error;
    
    return (data || []).map((hangout: any): HangoutWithDetails => {
      const friendName = hangout.organizer_id === userId 
        ? hangout.friend_profile?.full_name || 'Unknown'
        : hangout.organizer_profile?.full_name || 'Unknown';
      
      return {
        ...hangout,
        status: hangout.status as 'pending' | 'confirmed' | 'completed' | 'cancelled',
        friendName,
        date: new Date(hangout.scheduled_date),
        time: hangout.scheduled_time,
        confirmed: hangout.status === 'confirmed',
        confirmedDateTime: hangout.status === 'confirmed' 
          ? new Date(`${hangout.scheduled_date}T${hangout.scheduled_time}`) 
          : undefined
      };
    });
  },

  async createHangout(hangout: Omit<Hangout, 'id' | 'created_at' | 'updated_at'>): Promise<Hangout> {
    const { data, error } = await supabase
      .from('hangouts')
      .insert(hangout)
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      status: data.status as 'pending' | 'confirmed' | 'completed' | 'cancelled'
    };
  },

  async updateHangout(hangoutId: string, updates: Partial<Hangout>): Promise<Hangout> {
    const { data, error } = await supabase
      .from('hangouts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', hangoutId)
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      status: data.status as 'pending' | 'confirmed' | 'completed' | 'cancelled'
    };
  }
};

// Time slot services
export const timeSlotService = {
  async getTimeSlots(userId: string, startDate?: string, endDate?: string): Promise<TimeSlot[]> {
    let query = supabase
      .from('time_slots')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });
    
    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  },

  async createTimeSlot(timeSlot: Omit<TimeSlot, 'id' | 'created_at'>): Promise<TimeSlot> {
    const { data, error } = await supabase
      .from('time_slots')
      .insert(timeSlot)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateTimeSlot(timeSlotId: string, updates: Partial<TimeSlot>): Promise<TimeSlot> {
    const { data, error } = await supabase
      .from('time_slots')
      .update(updates)
      .eq('id', timeSlotId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
