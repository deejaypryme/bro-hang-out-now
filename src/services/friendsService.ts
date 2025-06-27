import { supabase } from "@/integrations/supabase/client";
import type { 
  Profile, 
  Friendship, 
  FriendInvitation, 
  UserPresence, 
  FriendWithProfile,
  FriendInvitationWithProfile
} from "@/types/database";

export const friendsService = {
  // Friend search and discovery
  async searchUsers(query: string): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`full_name.ilike.%${query}%,username.ilike.%${query}%,phone.ilike.%${query}%`)
      .limit(20);
    
    if (error) throw error;
    return data || [];
  },

  async searchUserByEmail(email: string): Promise<Profile | null> {
    // Since we can't directly query auth.users, we'll search by email invitation
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Friend invitations
  async sendFriendInvitation(invitation: {
    inviteeEmail?: string;
    inviteePhone?: string;
    inviteeId?: string;
    message?: string;
  }): Promise<FriendInvitation> {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    // Validate input - ensure at least one contact method is provided
    if (!invitation.inviteeEmail && !invitation.inviteePhone && !invitation.inviteeId) {
      throw new Error('At least one contact method (email, phone, or user ID) must be provided');
    }

    // Validate email format if provided
    if (invitation.inviteeEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(invitation.inviteeEmail)) {
        throw new Error('Invalid email format');
      }
    }

    // Validate phone format if provided (basic validation)
    if (invitation.inviteePhone) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(invitation.inviteePhone.replace(/[\s\-\(\)]/g, ''))) {
        throw new Error('Invalid phone number format');
      }
    }

    // Generate invitation token and expiration date
    const invitationToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    try {
      const { data, error } = await supabase
        .from('friend_invitations')
        .insert({
          inviter_id: user.id,
          invitee_email: invitation.inviteeEmail || null,
          invitee_phone: invitation.inviteePhone || null,
          invitee_id: invitation.inviteeId || null,
          invitation_token: invitationToken,
          expires_at: expiresAt.toISOString(),
          message: invitation.message || null,
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) {
        console.error('Database error when sending friend invitation:', error);
        
        // Handle specific database constraint errors
        if (error.code === '23505') {
          throw new Error('An invitation to this contact already exists');
        } else if (error.code === '23503') {
          throw new Error('Invalid user or contact information provided');
        } else if (error.code === '23514') {
          throw new Error('Invalid invitation data - please check your input');
        } else {
          throw new Error('Failed to send friend invitation. Please try again.');
        }
      }

      return {
        ...data,
        status: data.status as 'pending' | 'accepted' | 'declined' | 'expired'
      };
    } catch (error) {
      console.error('Error sending friend invitation:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while sending the invitation');
    }
  },

  async getFriendInvitations(userId: string): Promise<FriendInvitationWithProfile[]> {
    const { data, error } = await supabase
      .from('friend_invitations')
      .select(`
        *,
        inviter_profile:profiles!friend_invitations_inviter_id_fkey(*),
        invitee_profile:profiles!friend_invitations_invitee_id_fkey(*)
      `)
      .or(`inviter_id.eq.${userId},invitee_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map((invitation: any): FriendInvitationWithProfile => ({
      ...invitation,
      status: invitation.status as 'pending' | 'accepted' | 'declined' | 'expired',
      inviterProfile: invitation.inviter_profile,
      inviteeProfile: invitation.invitee_profile
    }));
  },

  async respondToInvitation(invitationId: string, status: 'accepted' | 'declined'): Promise<void> {
    const { error } = await supabase
      .from('friend_invitations')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', invitationId);
    
    if (error) throw error;

    // If accepted, create friendship
    if (status === 'accepted') {
      const { data: invitation } = await supabase
        .from('friend_invitations')
        .select('inviter_id, invitee_id')
        .eq('id', invitationId)
        .single();
      
      if (invitation) {
        await Promise.all([
          supabase.from('friendships').insert({
            user_id: invitation.inviter_id,
            friend_id: invitation.invitee_id,
            status: 'accepted'
          }),
          supabase.from('friendships').insert({
            user_id: invitation.invitee_id,
            friend_id: invitation.inviter_id,
            status: 'accepted'
          })
        ]);
      }
    }
  },

  // Friend management
  async getFriends(userId: string): Promise<FriendWithProfile[]> {
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        id,
        friend_id,
        status,
        notes,
        favorite,
        created_at,
        blocked_by,
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
      timezone: friendship.friend_profile.timezone,
      created_at: friendship.friend_profile.created_at,
      updated_at: friendship.friend_profile.updated_at,
      status: (friendship.friend_presence?.status as 'online' | 'offline' | 'busy' | 'away') || 'offline',
      lastSeen: new Date(friendship.friend_presence?.last_seen || friendship.friend_profile.updated_at),
      friendshipDate: new Date(friendship.created_at),
      friendshipStatus: friendship.status as 'pending' | 'accepted' | 'blocked',
      friendshipId: friendship.id,
      notes: friendship.notes,
      favorite: friendship.favorite || false,
      customMessage: friendship.friend_presence?.custom_message
    }));
  },

  async removeFriend(friendshipId: string): Promise<void> {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId);
    
    if (error) throw error;
  },

  async blockFriend(friendshipId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('friendships')
      .update({ 
        status: 'blocked',
        blocked_by: userId
      })
      .eq('id', friendshipId);
    
    if (error) throw error;
  },

  async updateFriendNotes(friendshipId: string, notes: string): Promise<void> {
    const { error } = await supabase
      .from('friendships')
      .update({ notes })
      .eq('id', friendshipId);
    
    if (error) throw error;
  },

  async toggleFriendFavorite(friendshipId: string, favorite: boolean): Promise<void> {
    const { error } = await supabase
      .from('friendships')
      .update({ favorite })
      .eq('id', friendshipId);
    
    if (error) throw error;
  },

  // User presence
  async updateUserPresence(status: 'online' | 'offline' | 'busy' | 'away', customMessage?: string): Promise<void> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('user_presence')
      .upsert({
        user_id: userId,
        status,
        custom_message: customMessage,
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (error) throw error;
  },

  async getUserPresence(userId: string): Promise<UserPresence | null> {
    const { data, error } = await supabase
      .from('user_presence')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data ? {
      ...data,
      status: data.status as 'online' | 'offline' | 'busy' | 'away'
    } : null;
  },

  // Real-time subscriptions
  subscribeToFriendPresence(userId: string, callback: (presence: UserPresence) => void) {
    return supabase
      .channel('friend-presence')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence'
        },
        (payload) => {
          if (payload.new && typeof payload.new === 'object' && 'status' in payload.new) {
            callback({
              ...payload.new,
              status: payload.new.status as 'online' | 'offline' | 'busy' | 'away'
            } as UserPresence);
          }
        }
      )
      .subscribe();
  },

  subscribeToFriendInvitations(userId: string, callback: (invitation: FriendInvitation) => void) {
    return supabase
      .channel('friend-invitations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friend_invitations',
          filter: `invitee_id=eq.${userId}`
        },
        (payload) => {
          if (payload.new && typeof payload.new === 'object' && 'status' in payload.new) {
            callback({
              ...payload.new,
              status: payload.new.status as 'pending' | 'accepted' | 'declined' | 'expired'
            } as FriendInvitation);
          }
        }
      )
      .subscribe();
  }
};
