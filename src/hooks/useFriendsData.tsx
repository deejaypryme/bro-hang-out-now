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

  // Enhanced real-time subscriptions with reconnection logic
  useEffect(() => {
    if (!user?.id) return;

    console.log('📡 Setting up enhanced real-time subscriptions for user:', user.id);
    
    const connectionStates = useRef({
      presenceConnected: false,
      invitationsConnected: false,
      retryCount: 0,
      maxRetries: 5
    });

    const exponentialBackoff = (attempt: number) => Math.min(1000 * Math.pow(2, attempt), 30000);
    
    const setupSubscription = async (type: 'presence' | 'invitations', attempt = 0) => {
      try {
        // Clean up existing subscription
        if (subscriptionsRef.current[type]) {
          subscriptionsRef.current[type].unsubscribe();
        }

        let subscription;
        if (type === 'presence') {
          subscription = friendsService.subscribeToFriendPresence(user.id, (presence) => {
            console.log('👥 Friend presence updated:', presence);
            connectionStates.current.presenceConnected = true;
            connectionStates.current.retryCount = 0;
            
            // Debounced refetch to prevent rapid fire updates
            setTimeout(() => {
              try {
                stableRefetchFriends();
              } catch (error) {
                console.error('Error refetching friends after presence update:', error);
              }
            }, 500);
          });
        } else {
          subscription = friendsService.subscribeToFriendInvitations(user.id, (invitation) => {
            console.log('📨 Friend invitation updated:', invitation);
            connectionStates.current.invitationsConnected = true;
            connectionStates.current.retryCount = 0;
            
            // Debounced refetch to prevent rapid fire updates
            setTimeout(() => {
              try {
                stableRefetchInvitations();
              } catch (error) {
                console.error('Error refetching invitations after update:', error);
              }
            }, 500);
          });
        }

        subscriptionsRef.current[type] = subscription;
        console.log(`✅ ${type} subscription established (attempt ${attempt + 1})`);

      } catch (error) {
        console.error(`❌ ${type} subscription failed (attempt ${attempt + 1}):`, error);
        
        if (attempt < connectionStates.current.maxRetries) {
          const delay = exponentialBackoff(attempt);
          console.log(`🔄 Retrying ${type} subscription in ${delay}ms...`);
          
          setTimeout(() => {
            setupSubscription(type, attempt + 1);
          }, delay);
        } else {
          console.error(`💥 ${type} subscription failed after ${connectionStates.current.maxRetries} attempts`);
        }
      }
    };

    // Set up both subscriptions
    setupSubscription('presence');
    setupSubscription('invitations');

    // Periodic health check and reconnection
    const healthCheckInterval = setInterval(() => {
      console.log('🏥 Health check - Presence:', connectionStates.current.presenceConnected, 'Invitations:', connectionStates.current.invitationsConnected);
      
      if (!connectionStates.current.presenceConnected && connectionStates.current.retryCount < connectionStates.current.maxRetries) {
        console.log('🔄 Reconnecting presence subscription...');
        setupSubscription('presence');
      }
      
      if (!connectionStates.current.invitationsConnected && connectionStates.current.retryCount < connectionStates.current.maxRetries) {
        console.log('🔄 Reconnecting invitations subscription...');
        setupSubscription('invitations');
      }
    }, 30000); // Check every 30 seconds

    return () => {
      console.log('🧹 Cleaning up enhanced real-time subscriptions');
      clearInterval(healthCheckInterval);
      
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