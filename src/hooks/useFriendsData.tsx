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
  const retryCountRef = useRef({ presence: 0, invitations: 0 });

  // Set user presence to online when component mounts
  useEffect(() => {
    if (!user?.id) return;

    console.log('👤 Setting user presence to online');
    updatePresence.mutate({ status: 'online' });

    return () => {
      console.log('🧹 Cleaning up presence');
    };
  }, [user?.id, updatePresence]);

  // Simple real-time subscriptions with basic retry logic
  useEffect(() => {
    if (!user?.id) return;

    console.log('📡 Setting up real-time subscriptions');
    
    const exponentialBackoff = (attempt: number) => Math.min(1000 * Math.pow(2, attempt), 10000);
    
    const setupSubscription = async (type: 'presence' | 'invitations', attempt = 0) => {
      try {
        // Clean up existing subscription
        if (subscriptionsRef.current[type]) {
          subscriptionsRef.current[type].unsubscribe();
        }

        let subscription;
        if (type === 'presence') {
          subscription = friendsService.subscribeToFriendPresence(user.id, () => {
            console.log('👥 Friend presence updated');
            retryCountRef.current.presence = 0;
            refetchFriends();
          });
        } else {
          subscription = friendsService.subscribeToFriendInvitations(user.id, () => {
            console.log('📨 Friend invitation updated');
            retryCountRef.current.invitations = 0;
            refetchInvitations();
          });
        }

        subscriptionsRef.current[type] = subscription;
        console.log(`✅ ${type} subscription established`);

      } catch (error) {
        console.error(`❌ ${type} subscription failed:`, error);
        
        // Simple retry with exponential backoff (max 3 attempts)
        if (attempt < 3) {
          const delay = exponentialBackoff(attempt);
          console.log(`🔄 Retrying ${type} subscription in ${delay}ms...`);
          
          setTimeout(() => {
            setupSubscription(type, attempt + 1);
          }, delay);
        } else {
          console.error(`💥 ${type} subscription failed after 3 attempts`);
        }
      }
    };

    setupSubscription('presence');
    setupSubscription('invitations');

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
  }, [user?.id, refetchFriends, refetchInvitations]);

  return {
    friends,
    friendsLoading,
    friendsError,
    invitations,
    invitationsLoading,
    invitationsError,
    handleRefetchFriends: refetchFriends,
    handleRefetchInvitations: refetchInvitations
  };
};