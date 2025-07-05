import { supabase } from "@/integrations/supabase/client";

export interface FriendRequest {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'declined';
  message?: string;
  created_at: string;
  updated_at: string;
  requester_profile?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
}

export interface HangoutRequest {
  id: string;
  organizer_id: string;
  friend_id: string;
  activity_name: string;
  activity_emoji: string;
  proposed_date: string;
  proposed_time: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  created_at: string;
  updated_at: string;
  organizer_profile?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
}

export interface UserNotification {
  type: 'friend_request' | 'hangout_request';
  id: string;
  from_user_id: string;
  to_user_id: string;
  from_user_name: string | null;
  from_username: string | null;
  message: string | null;
  status: string;
  created_at: string;
}

export const simpleSocialService = {
  // Friend Requests
  async sendFriendRequest(recipientId: string, message?: string): Promise<FriendRequest> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('friend_requests')
      .insert({
        requester_id: user.id,
        recipient_id: recipientId,
        message: message || null
      })
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return {
      ...data,
      status: data.status as 'pending' | 'accepted' | 'declined'
    };
  },

  async respondToFriendRequest(requestId: string, response: 'accepted' | 'declined'): Promise<void> {
    const { error } = await supabase
      .from('friend_requests')
      .update({ 
        status: response,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (error) throw error;

    // If accepted, create friendship
    if (response === 'accepted') {
      const { data: request } = await supabase
        .from('friend_requests')
        .select('requester_id, recipient_id')
        .eq('id', requestId)
        .single();

      if (request) {
        // Create bidirectional friendship
        await Promise.all([
          supabase.from('friendships').insert({
            user_id: request.requester_id,
            friend_id: request.recipient_id,
            status: 'accepted'
          }),
          supabase.from('friendships').insert({
            user_id: request.recipient_id,
            friend_id: request.requester_id,
            status: 'accepted'
          })
        ]);
      }
    }
  },

  async getFriendRequests(): Promise<FriendRequest[]> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('recipient_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      status: item.status as 'pending' | 'accepted' | 'declined'
    }));
  },

  // Hangout Requests
  async sendHangoutRequest(friendId: string, activityName: string, activityEmoji: string, proposedDate: string, proposedTime: string, message?: string): Promise<HangoutRequest> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('hangout_requests')
      .insert({
        organizer_id: user.id,
        friend_id: friendId,
        activity_name: activityName,
        activity_emoji: activityEmoji,
        proposed_date: proposedDate,
        proposed_time: proposedTime,
        message: message || null
      })
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return {
      ...data,
      status: data.status as 'pending' | 'accepted' | 'declined' | 'cancelled'
    };
  },

  async respondToHangoutRequest(requestId: string, response: 'accepted' | 'declined'): Promise<void> {
    const { error } = await supabase
      .from('hangout_requests')
      .update({ 
        status: response,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (error) throw error;

    // If accepted, create hangout
    if (response === 'accepted') {
      const { data: request } = await supabase
        .from('hangout_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (request) {
        await supabase.from('hangouts').insert({
          organizer_id: request.organizer_id,
          friend_id: request.friend_id,
          activity_name: request.activity_name,
          activity_emoji: request.activity_emoji,
          scheduled_date: request.proposed_date,
          scheduled_time: request.proposed_time,
          status: 'confirmed'
        });
      }
    }
  },

  async getHangoutRequests(): Promise<HangoutRequest[]> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('hangout_requests')
      .select('*')
      .eq('friend_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      status: item.status as 'pending' | 'accepted' | 'declined' | 'cancelled'
    }));
  },

  // Search users by username
  async searchUsersByUsername(query: string): Promise<Array<{id: string, username: string | null, full_name: string | null, avatar_url: string | null}>> {
    if (!query.trim()) return [];

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .ilike('username', `%${query}%`)
      .limit(10);

    if (error) throw error;
    return data || [];
  },

  // Get all notifications for current user
  async getNotifications(): Promise<UserNotification[]> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_notifications')
      .select('*')
      .eq('to_user_id', user.id);

    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      type: item.type as 'friend_request' | 'hangout_request'
    }));
  },

  // Real-time subscriptions
  subscribeToNotifications(userId: string, callback: (notification: any) => void) {
    return supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friend_requests',
          filter: `recipient_id=eq.${userId}`
        },
        callback
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hangout_requests',
          filter: `friend_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }
};