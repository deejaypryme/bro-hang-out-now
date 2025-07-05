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
      return data || [];
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

  // Friend invitations with enhanced edge function logging and error handling
  async sendFriendInvitation(invitation: {
    inviteeEmail?: string;
    inviteePhone?: string;
    inviteeId?: string;
    message?: string;
  }): Promise<FriendInvitation> {
    console.log('🚀 [friendsService] Starting friend invitation process:', invitation);
    console.log('📊 [friendsService] Edge function verification - Starting notification process');
    
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('❌ [friendsService] Authentication error:', authError);
        throw new Error('User not authenticated');
      }

      console.log('✅ [friendsService] User authenticated:', user.id);

      // Get user profile for notification
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, username')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.warn('⚠️ [friendsService] Failed to get user profile:', profileError);
      }

      console.log('👤 [friendsService] User profile:', userProfile);

      // Validate input - ensure at least one contact method is provided
      if (!invitation.inviteeEmail && !invitation.inviteePhone && !invitation.inviteeId) {
        const error = new Error('At least one contact method (email, phone, or user ID) must be provided');
        console.error('❌ [friendsService] Validation error:', error.message);
        throw error;
      }

      // Validate email format if provided
      if (invitation.inviteeEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(invitation.inviteeEmail)) {
          const error = new Error('Invalid email format');
          console.error('❌ [friendsService] Email validation error:', error.message);
          throw error;
        }
      }

      // Validate phone format if provided (basic validation)
      if (invitation.inviteePhone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(invitation.inviteePhone.replace(/[\s\-\(\)]/g, ''))) {
          const error = new Error('Invalid phone number format');
          console.error('❌ [friendsService] Phone validation error:', error.message);
          throw error;
        }
      }

      // Generate invitation token and expiration date
      const invitationToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

      console.log('🎟️ [friendsService] Generated invitation token:', invitationToken);

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
        console.error('❌ [friendsService] Database error when sending friend invitation:', error);
        
        // Handle specific database constraint errors
        if (error.code === '23505') {
          throw new Error('An invitation to this contact already exists');
        } else if (error.code === '23503') {
          throw new Error('Invalid user or contact information provided');
        } else if (error.code === '23514') {
          throw new Error('Invalid invitation data - please check your input');
        } else {
          throw new Error(`Database error: ${error.message}`);
        }
      }

      console.log('✅ [friendsService] Invitation saved to database:', data.id);

      // Enhanced edge function invocation with detailed logging
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

      console.log('📧 [friendsService] EDGE FUNCTION VERIFICATION - Calling send-friend-invitation function');
      console.log('📋 [friendsService] Edge function payload:', JSON.stringify({
        ...notificationPayload,
        inviterEmail: '***REDACTED***' // Don't log sensitive email
      }));

      try {
        const startTime = Date.now();
        console.log('⏱️ [friendsService] Edge function call started at:', new Date().toISOString());
        
        const { data: functionResponse, error: notificationError } = await supabase.functions.invoke('send-friend-invitation', {
          body: notificationPayload
        });

        const endTime = Date.now();
        const duration = endTime - startTime;
        console.log('⏱️ [friendsService] Edge function call completed in:', duration, 'ms');

        if (notificationError) {
          console.error('❌ [friendsService] EDGE FUNCTION ERROR - Invocation failed:', notificationError);
          console.error('❌ [friendsService] Error details:', {
            message: notificationError.message,
            context: notificationError.context,
            code: notificationError.code
          });
          throw new Error(`Failed to send notification: ${notificationError.message}`);
        }

        console.log('✅ [friendsService] EDGE FUNCTION SUCCESS - Response received:', functionResponse);
        
        // Detailed logging of notification delivery
        if (functionResponse?.success) {
          console.log('🎉 [friendsService] NOTIFICATION DELIVERY VERIFIED');
          console.log('📊 [friendsService] Delivery status:', {
            emailSent: functionResponse.sentVia?.email || false,
            smsSent: functionResponse.sentVia?.sms || false,
            emailResult: functionResponse.emailResult ? 'SUCCESS' : 'FAILED',
            smsResult: functionResponse.smsResult ? 'SUCCESS' : 'FAILED'
          });
          
          if (functionResponse.emailResult?.error) {
            console.warn('⚠️ [friendsService] Email delivery failed:', functionResponse.emailResult.error);
          }
          
          if (functionResponse.smsResult?.error) {
            console.warn('⚠️ [friendsService] SMS delivery failed:', functionResponse.smsResult.error);
          }
        } else {
          console.error('❌ [friendsService] NOTIFICATION DELIVERY FAILED:', functionResponse);
          throw new Error(`Notification failed: ${functionResponse?.error || 'Unknown error'}`);
        }

      } catch (notificationError) {
        console.error('❌ [friendsService] EDGE FUNCTION CRITICAL ERROR:', notificationError);
        console.error('💥 [friendsService] Full error context:', {
          error: notificationError,
          stack: notificationError instanceof Error ? notificationError.stack : 'No stack trace',
          payload: JSON.stringify({
            ...notificationPayload,
            inviterEmail: '***REDACTED***'
          })
        });
        
        // Enhanced error handling for different failure scenarios
        if (notificationError instanceof Error) {
          if (notificationError.message.includes('timeout')) {
            throw new Error('Notification service timeout - invitation saved but notification may be delayed');
          } else if (notificationError.message.includes('network')) {
            throw new Error('Network error while sending notification - invitation saved but recipient may not be notified');
          } else {
            throw new Error(`Failed to send invitation notification: ${notificationError.message}`);
          }
        } else {
          throw new Error('An unexpected error occurred while sending the invitation notification');
        }
      }

      console.log('🎉 [friendsService] COMPLETE SUCCESS - Friend invitation process completed successfully');
      console.log('📊 [friendsService] Final status:', {
        invitationId: data.id,
        databaseSaved: true,
        notificationSent: true
      });

      return {
        ...data,
        status: data.status as 'pending' | 'accepted' | 'declined' | 'expired'
      };
    } catch (error) {
      console.error('❌ [friendsService] FINAL ERROR - Friend invitation process failed:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while sending the invitation');
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
