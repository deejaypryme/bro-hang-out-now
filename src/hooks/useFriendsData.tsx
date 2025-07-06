import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFriends, useFriendInvitations, useUpdateUserPresence } from '@/hooks/useDatabase';
import { friendsService } from '@/services/friendsService';

export const useFriendsData = () => {
  const { user } = useAuth();
  const { data: friends = [], isLoading: friendsLoading, error: friendsError, refetch: refetchFriends } = useFriends();
  const { data: invitations = [], isLoading: invitationsLoading, error: invitationsError, refetch: refetchInvitations } = useFriendInvitations();
  const updatePresence = useUpdateUserPresence();
  const subscriptionsRef = useRef<{ presence?: any; invitations?: any }>({});

  // Stabilized refetch functions to prevent infinite loops
  const stableRefetchFriends = useCallback(() => {
    console.log('🔄 Manually refetching friends...');
    refetchFriends();
  }, [refetchFriends]);

  const stableRefetchInvitations = useCallback(() => {
    console.log('🔄 Manually refetching invitations...');
    refetchInvitations();
  }, [refetchInvitations]);

  // Set user presence to online when component mounts
  useEffect(() => {
    if (!user?.id) return;

    console.log('🔄 Setting user presence to online for user:', user.id);
    
    // Set user online when component mounts
    updatePresence.mutate({ status: 'online' });

    // Clean cleanup without presence mutation to avoid render loops
    return () => {
      console.log('🧹 Component unmounting for user:', user.id);
    };
  }, [user?.id, updatePresence]);

  // Simplified real-time subscriptions with proper cleanup
  useEffect(() => {
    if (!user?.id) return;

    console.log('📡 Setting up real-time subscriptions for user:', user.id);
    
    // Clean up existing subscriptions first
    if (subscriptionsRef.current.presence) {
      subscriptionsRef.current.presence.unsubscribe();
    }
    if (subscriptionsRef.current.invitations) {
      subscriptionsRef.current.invitations.unsubscribe();
    }
    
    // Set up presence subscription with debounced refetch
    subscriptionsRef.current.presence = friendsService.subscribeToFriendPresence(user.id, (presence) => {
      console.log('👥 Friend presence updated:', presence);
      // Debounced refetch to prevent rapid fire updates
      setTimeout(() => {
        try {
          stableRefetchFriends();
        } catch (error) {
          console.error('Error refetching friends after presence update:', error);
        }
      }, 500);
    });
    
    // Set up invitations subscription with debounced refetch
    subscriptionsRef.current.invitations = friendsService.subscribeToFriendInvitations(user.id, (invitation) => {
      console.log('📨 Friend invitation updated:', invitation);
      // Debounced refetch to prevent rapid fire updates
      setTimeout(() => {
        try {
          stableRefetchInvitations();
        } catch (error) {
          console.error('Error refetching invitations after update:', error);
        }
      }, 500);
    });

    return () => {
      console.log('🧹 Cleaning up real-time subscriptions');
      if (subscriptionsRef.current.presence) {
        subscriptionsRef.current.presence.unsubscribe();
      }
      if (subscriptionsRef.current.invitations) {
        subscriptionsRef.current.invitations.unsubscribe();
      }
      subscriptionsRef.current = {};
    };
  }, [user?.id, stableRefetchFriends, stableRefetchInvitations]);

  return {
    friends,
    friendsLoading,
    friendsError,
    invitations,
    invitationsLoading,
    invitationsError,
    handleRefetchFriends: stableRefetchFriends,
    handleRefetchInvitations: stableRefetchInvitations
  };
};