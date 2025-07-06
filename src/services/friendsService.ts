import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Enhanced error handling for database operations
class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any,
    public userMessage?: string
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

const handleDatabaseError = (error: any, operation: string): DatabaseError => {
  console.error(`Database error in ${operation}:`, error);
  
  let userMessage = 'An unexpected error occurred. Please try again.';
  
  // Handle specific PostgreSQL error codes
  switch (error.code) {
    case '23505': // Unique violation
      if (error.message.includes('friendships')) {
        userMessage = 'You are already friends with this person.';
      } else if (error.message.includes('friend_invitations')) {
        userMessage = 'An invitation has already been sent to this person.';
      } else {
        userMessage = 'This action has already been completed.';
      }
      break;
    case '23503': // Foreign key violation
      userMessage = 'Invalid user or contact information provided.';
      break;
    case '23514': // Check constraint violation
      userMessage = 'The provided data does not meet the required format.';
      break;
    case '42P01': // Undefined table
      userMessage = 'System error: Please contact support.';
      break;
    case 'PGRST116': // No rows returned
      userMessage = 'The requested item could not be found.';
      break;
    default:
      if (error.message.includes('permission denied')) {
        userMessage = 'You do not have permission to perform this action.';
      } else if (error.message.includes('connection')) {
        userMessage = 'Connection error. Please check your internet and try again.';
      }
  }
  
  return new DatabaseError(
    error.message || 'Database operation failed',
    error.code,
    error,
    userMessage
  );
};

// Pre-check functions to prevent constraint violations
const checkExistingFriendship = async (userId: string, friendId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('friendships')
      .select('id')
      .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`)
      .limit(1);

    if (error) {
      console.error('Error checking existing friendship:', error);
      return false; // Assume no friendship exists on error
    }

    return data && data.length > 0;
  } catch (error) {
    console.error('Error in checkExistingFriendship:', error);
    return false;
  }
};

const checkExistingInvitation = async (inviterId: string, inviteeEmail?: string, inviteePhone?: string, inviteeId?: string): Promise<boolean> => {
  try {
    let query = supabase
      .from('friend_invitations')
      .select('id')
      .eq('inviter_id', inviterId)
      .eq('status', 'pending');

    if (inviteeId) {
      query = query.eq('invitee_id', inviteeId);
    } else if (inviteeEmail) {
      query = query.eq('invitee_email', inviteeEmail);
    } else if (inviteePhone) {
      query = query.eq('invitee_phone', inviteePhone);
    }

    const { data, error } = await query.limit(1);

    if (error) {
      console.error('Error checking existing invitation:', error);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error('Error in checkExistingInvitation:', error);
    return false;
  }
};
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
    console.log('🔍 [friendsService] Searching users with query:', query);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`full_name.ilike.%${query}%,username.ilike.%${query}%,phone.ilike.%${query}%`)
        .limit(20);
      
      if (error) {
        console.error('❌ [friendsService] Search users error:', error);
        throw new Error(`Search failed: ${error.message}`);
      }
      
      console.log('✅ [friendsService] Search completed:', data?.length || 0, 'results');
      // Ensure we always return an array, never null/undefined
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('❌ [friendsService] Search users failed:', error);
      throw error;
    }
  },

  async searchUserByEmail(email: string): Promise<Profile | null> {
    console.log('🔍 [friendsService] Searching user by email:', email);
    
    try {
      // Since we can't access auth.users directly, we need to use the friend invitation flow
      // This function will return null to indicate that email invitations should use the friend_invitations table
      console.log('ℹ️ [friendsService] Email-based invitations should use the friend invitation system');
      return null;
    } catch (error) {
      console.error('❌ [friendsService] Search user by email failed:', error);
      throw error;
    }
  },

  // Friend invitations with enhanced error handling and pre-checks
  async sendFriendInvitation(invitation: {
    inviteeEmail?: string;
    inviteePhone?: string;
    inviteeId?: string;
    message?: string;
  }): Promise<FriendInvitation> {
    console.log('🚀 [friendsService] Starting friend invitation process:', invitation);
    
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw handleDatabaseError(authError || new Error('User not authenticated'), 'authentication');
      }

      console.log('✅ [friendsService] User authenticated:', user.id);

      // Enhanced validation
      if (!invitation.inviteeEmail && !invitation.inviteePhone && !invitation.inviteeId) {
        throw new DatabaseError(
          'At least one contact method must be provided',
          'VALIDATION_ERROR',
          null,
          'Please provide an email, phone number, or select a user to invite.'
        );
      }

      // Pre-check for existing invitations to prevent constraint violations
      const existingInvitation = await checkExistingInvitation(
        user.id,
        invitation.inviteeEmail,
        invitation.inviteePhone,
        invitation.inviteeId
      );

      if (existingInvitation) {
        throw new DatabaseError(
          'Invitation already exists',
          '23505',
          null,
          'You have already sent an invitation to this person. Please wait for them to respond.'
        );
      }

      // Pre-check for existing friendship if inviteeId is provided
      if (invitation.inviteeId) {
        const existingFriendship = await checkExistingFriendship(user.id, invitation.inviteeId);
        if (existingFriendship) {
          throw new DatabaseError(
            'Friendship already exists',
            '23505',
            null,
            'You are already friends with this person.'
          );
        }
      }

      // Enhanced validation with better error messages
      if (invitation.inviteeEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(invitation.inviteeEmail)) {
          throw new DatabaseError(
            'Invalid email format',
            'VALIDATION_ERROR',
            null,
            'Please enter a valid email address (e.g., user@example.com).'
          );
        }
      }

      if (invitation.inviteePhone) {
        const cleanPhone = invitation.inviteePhone.replace(/[\s\-\(\)]/g, '');
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(cleanPhone)) {
          throw new DatabaseError(
            'Invalid phone number format',
            'VALIDATION_ERROR',
            null,
            'Please enter a valid phone number with country code (e.g., +1234567890).'
          );
        }
      }

      // Get user profile for notification
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, username')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.warn('⚠️ [friendsService] Failed to get user profile:', profileError);
      }

      // Generate invitation token and expiration date
      const invitationToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      console.log('💾 [friendsService] Inserting invitation to database...');
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
        throw handleDatabaseError(error, 'friend invitation creation');
      }

      console.log('✅ [friendsService] Invitation saved to database:', data.id);

      // Enhanced edge function invocation with retry logic
      const inviterName = userProfile?.full_name || userProfile?.username || 'Someone';
      const notificationPayload = {
        invitationId: data.id,
        inviterName,
        inviterEmail: user.email,
        inviteeEmail: invitation.inviteeEmail,
        inviteePhone: invitation.inviteePhone,
        message: invitation.message,
        invitationToken: invitationToken
      };

      // Notification with retry logic
      let notificationSuccess = false;
      let lastNotificationError: any = null;
      const maxRetries = 3;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`📧 [friendsService] Notification attempt ${attempt}/${maxRetries}`);
          
          const { data: functionResponse, error: notificationError } = await supabase.functions.invoke('send-friend-invitation', {
            body: notificationPayload
          });

          if (notificationError) {
            throw notificationError;
          }

          console.log('✅ [friendsService] Notification sent successfully');
          notificationSuccess = true;
          break;
        } catch (error) {
          console.error(`❌ [friendsService] Notification attempt ${attempt} failed:`, error);
          lastNotificationError = error;
          
          if (attempt < maxRetries) {
            // Exponential backoff: wait 1s, 2s, 4s
            const delay = Math.pow(2, attempt - 1) * 1000;
            console.log(`⏳ [friendsService] Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      if (!notificationSuccess) {
        console.warn('⚠️ [friendsService] All notification attempts failed, but invitation was saved');
        // Don't throw - invitation was saved successfully, just notification failed
      }

      return {
        ...data,
        status: data.status as 'pending' | 'accepted' | 'declined' | 'expired'
      };
    } catch (error) {
      console.error('❌ [friendsService] Friend invitation process failed:', error);
      
      if (error instanceof DatabaseError) {
        throw error;
      }
      
      throw handleDatabaseError(error, 'friend invitation');
    }
  },

  async getFriendInvitations(userId: string): Promise<FriendInvitationWithProfile[]> {
    console.log('🔍 [friendsService] Fetching friend invitations for user:', userId);
    
    try {
      // Get invitations using separate queries to avoid PostgREST relationship issues
      const { data: invitations, error } = await supabase
        .from('friend_invitations')
        .select('*')
        .or(`inviter_id.eq.${userId},invitee_id.eq.${userId}`)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ [friendsService] Get friend invitations error:', error);
        throw new Error(`Failed to fetch invitations: ${error.message}`);
      }

      if (!invitations?.length) {
        console.log('ℹ️ [friendsService] No invitations found');
        // Always return an array, never null/undefined
        return [];
      }

      // Get unique profile IDs for both inviters and invitees
      const profileIds = [
        ...new Set([
          ...invitations.map(inv => inv.inviter_id),
          ...invitations.filter(inv => inv.invitee_id).map(inv => inv.invitee_id!)
        ])
      ];

      // Fetch profiles separately
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', profileIds);

      if (profilesError) {
        console.warn('⚠️ [friendsService] Get profiles error (non-critical):', profilesError);
      }

      // Combine the data
      const data = invitations.map(invitation => {
        const inviterProfile = profiles?.find(p => p.id === invitation.inviter_id);
        const inviteeProfile = invitation.invitee_id 
          ? profiles?.find(p => p.id === invitation.invitee_id)
          : null;
        
        return {
          ...invitation,
          inviterProfile,
          inviteeProfile
        };
      });
      
      console.log('✅ [friendsService] Friend invitations fetched:', data?.length || 0);
      
      return data.map((invitation: any): FriendInvitationWithProfile => ({
        ...invitation,
        status: invitation.status as 'pending' | 'accepted' | 'declined' | 'expired'
      }));
    } catch (error) {
      console.error('❌ [friendsService] Get friend invitations failed:', error);
      throw error;
    }
  },

  async respondToInvitation(invitationId: string, status: 'accepted' | 'declined'): Promise<void> {
    console.log('📝 [friendsService] Responding to invitation:', invitationId, 'with status:', status);
    
    try {
      const { error } = await supabase
        .from('friend_invitations')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', invitationId);
      
      if (error) {
        console.error('❌ [friendsService] Respond to invitation error:', error);
        throw new Error(`Failed to respond to invitation: ${error.message}`);
      }

      console.log('✅ [friendsService] Invitation status updated successfully');

      // If accepted, create friendship
      if (status === 'accepted') {
        console.log('🤝 [friendsService] Creating friendship for accepted invitation');
        
        const { data: invitation } = await supabase
          .from('friend_invitations')
          .select('inviter_id, invitee_id')
          .eq('id', invitationId)
          .single();
        
        if (invitation) {
          console.log('👥 [friendsService] Creating bidirectional friendship records');
          
          const friendshipResults = await Promise.allSettled([
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
          
          const failures = friendshipResults.filter(result => result.status === 'rejected');
          if (failures.length > 0) {
            console.error('❌ [friendsService] Some friendship creation failed:', failures);
            throw new Error('Failed to create friendship records');
          }
          
          console.log('✅ [friendsService] Friendship records created successfully');
        }
      }
    } catch (error) {
      console.error('❌ [friendsService] Respond to invitation failed:', error);
      throw error;
    }
  },

  // Friend management
  async getFriends(userId: string): Promise<FriendWithProfile[]> {
    console.log('🔍 [friendsService] Fetching friends for user:', userId);
    
    try {
      // Use separate queries to avoid PostgREST relationship issues
      const { data: friendships, error: friendshipsError } = await supabase
        .from('friendships')
        .select(`
          id,
          friend_id,
          status,
          notes,
          favorite,
          created_at,
          blocked_by
        `)
        .eq('user_id', userId)
        .eq('status', 'accepted')
        .is('blocked_by', null);

      if (friendshipsError) {
        console.error('❌ [friendsService] Get friendships error:', friendshipsError);
        throw new Error(`Failed to fetch friendships: ${friendshipsError.message}`);
      }

      if (!friendships?.length) {
        console.log('ℹ️ [friendsService] No friendships found');
        // Always return an array, never null/undefined  
        return [];
      }

      // Get friend profiles
      const friendIds = friendships.map(f => f.friend_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', friendIds);

      if (profilesError) {
        console.error('❌ [friendsService] Get profiles error:', profilesError);
        throw new Error(`Failed to fetch friend profiles: ${profilesError.message}`);
      }

      // Get presence data
      const { data: presenceData, error: presenceError } = await supabase
        .from('user_presence')
        .select('user_id, status, custom_message, last_seen')
        .in('user_id', friendIds);

      if (presenceError) {
        console.warn('⚠️ [friendsService] Get presence error (non-critical):', presenceError);
      }

      // Combine the data
      const data = friendships.map(friendship => {
        const profile = profiles?.find(p => p.id === friendship.friend_id);
        const presence = presenceData?.find(p => p.user_id === friendship.friend_id);
        return {
          ...friendship,
          friend_profile: profile,
          user_presence: presence ? [presence] : []
        };
      });
      
      
      console.log('✅ [friendsService] Friends fetched:', data?.length || 0);
      
      return data.map((friendship: any): FriendWithProfile => {
        const profile = friendship.friend_profile;
        const presence = friendship.user_presence?.[0];
        
        return {
          id: profile?.id || friendship.friend_id,
          username: profile?.username,
          full_name: profile?.full_name,
          avatar_url: profile?.avatar_url,
          phone: profile?.phone,
          preferred_times: profile?.preferred_times || [],
          timezone: profile?.timezone,
          created_at: profile?.created_at || friendship.created_at,
          updated_at: profile?.updated_at || friendship.created_at,
          status: (presence?.status as 'online' | 'offline' | 'busy' | 'away') || 'offline',
          lastSeen: new Date(presence?.last_seen || profile?.updated_at || friendship.created_at),
          friendshipDate: new Date(friendship.created_at),
          friendshipStatus: friendship.status as 'pending' | 'accepted' | 'blocked',
          friendshipId: friendship.id,
          notes: friendship.notes,
          favorite: friendship.favorite || false,
          customMessage: presence?.custom_message
        };
      });
    } catch (error) {
      console.error('❌ [friendsService] Get friends failed:', error);
      throw error;
    }
  },

  async removeFriend(friendshipId: string): Promise<void> {
    console.log('🗑️ [friendsService] Removing friend:', friendshipId);
    
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);
      
      if (error) {
        console.error('❌ [friendsService] Remove friend error:', error);
        throw new Error(`Failed to remove friend: ${error.message}`);
      }
      
      console.log('✅ [friendsService] Friend removed successfully');
    } catch (error) {
      console.error('❌ [friendsService] Remove friend failed:', error);
      throw error;
    }
  },

  async blockFriend(friendshipId: string, userId: string): Promise<void> {
    console.log('🚫 [friendsService] Blocking friend:', friendshipId, 'by user:', userId);
    
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ 
          status: 'blocked',
          blocked_by: userId
        })
        .eq('id', friendshipId);
      
      if (error) {
        console.error('❌ [friendsService] Block friend error:', error);
        throw new Error(`Failed to block friend: ${error.message}`);
      }
      
      console.log('✅ [friendsService] Friend blocked successfully');
    } catch (error) {
      console.error('❌ [friendsService] Block friend failed:', error);
      throw error;
    }
  },

  async updateFriendNotes(friendshipId: string, notes: string): Promise<void> {
    console.log('📝 [friendsService] Updating friend notes for:', friendshipId);
    
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ notes })
        .eq('id', friendshipId);
      
      if (error) {
        console.error('❌ [friendsService] Update friend notes error:', error);
        throw new Error(`Failed to update notes: ${error.message}`);
      }
      
      console.log('✅ [friendsService] Friend notes updated successfully');
    } catch (error) {
      console.error('❌ [friendsService] Update friend notes failed:', error);
      throw error;
    }
  },

  async toggleFriendFavorite(friendshipId: string, favorite: boolean): Promise<void> {
    console.log('⭐ [friendsService] Toggling friend favorite:', friendshipId, 'to', favorite);
    
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ favorite })
        .eq('id', friendshipId);
      
      if (error) {
        console.error('❌ [friendsService] Toggle friend favorite error:', error);
        throw new Error(`Failed to update favorite: ${error.message}`);
      }
      
      console.log('✅ [friendsService] Friend favorite toggled successfully');
    } catch (error) {
      console.error('❌ [friendsService] Toggle friend favorite failed:', error);
      throw error;
    }
  },

  // User presence - FIXED UPSERT LOGIC
  async updateUserPresence(status: 'online' | 'offline' | 'busy' | 'away', customMessage?: string): Promise<void> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) {
      console.error('❌ [friendsService] User not authenticated for presence update');
      throw new Error('User not authenticated');
    }

    console.log('📡 [friendsService] Updating user presence with proper UPSERT:', { userId, status, customMessage });

    try {
      // Use UPSERT with proper conflict resolution
      const { error } = await supabase
        .from('user_presence')
        .upsert({
          user_id: userId,
          status,
          custom_message: customMessage,
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });
      
      if (error) {
        console.error('❌ [friendsService] Error updating user presence:', error);
        throw new Error(`Failed to update presence: ${error.message}`);
      }

      console.log('✅ [friendsService] User presence updated successfully');
    } catch (error) {
      console.error('❌ [friendsService] Update user presence failed:', error);
      throw error;
    }
  },

  async getUserPresence(userId: string): Promise<UserPresence | null> {
    console.log('🔍 [friendsService] Fetching user presence for:', userId);
    
    try {
      const { data, error } = await supabase
        .from('user_presence')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('❌ [friendsService] Get user presence error:', error);
        throw new Error(`Failed to fetch presence: ${error.message}`);
      }
      
      if (data) {
        console.log('✅ [friendsService] User presence fetched:', data.status);
        return {
          ...data,
          status: data.status as 'online' | 'offline' | 'busy' | 'away'
        };
      }
      
      console.log('ℹ️ [friendsService] No presence data found for user');
      return null;
    } catch (error) {
      console.error('❌ [friendsService] Get user presence failed:', error);
      throw error;
    }
  },

  // Real-time subscriptions
  subscribeToFriendPresence(userId: string, callback: (presence: UserPresence) => void) {
    console.log('📡 [friendsService] Setting up friend presence subscription for user:', userId);
    
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
          console.log('👥 [friendsService] Friend presence change received:', payload);
          if (payload.new && typeof payload.new === 'object' && 'status' in payload.new) {
            callback({
              ...payload.new,
              status: payload.new.status as 'online' | 'offline' | 'busy' | 'away'
            } as UserPresence);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 [friendsService] Friend presence subscription status:', status);
      });
  },

  subscribeToFriendInvitations(userId: string, callback: (invitation: FriendInvitation) => void) {
    console.log('📡 [friendsService] Setting up friend invitations subscription for user:', userId);
    
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
          console.log('📨 [friendsService] Friend invitation change received:', payload);
          if (payload.new && typeof payload.new === 'object' && 'status' in payload.new) {
            callback({
              ...payload.new,
              status: payload.new.status as 'pending' | 'accepted' | 'declined' | 'expired'
            } as FriendInvitation);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 [friendsService] Friend invitations subscription status:', status);
      });
  }
};
