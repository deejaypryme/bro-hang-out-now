import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFriends, useFriendInvitations, useUpdateUserPresence } from '@/hooks/useDatabase';
import { friendsService } from '@/services/friendsService';

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export const useFriendsData = () => {
  const { user } = useAuth();
  const { data: friends = [], isLoading: friendsLoading, error: friendsError, refetch: refetchFriends } = useFriends();
  const { data: invitations = [], isLoading: invitationsLoading, error: invitationsError, refetch: refetchInvitations } = useFriendInvitations();
  const updatePresence = useUpdateUserPresence();
  const subscriptionsRef = useRef<{ presence?: any; invitations?: any }>({});
  const debounceTimersRef = useRef<{ friends?: NodeJS.Timeout; invitations?: NodeJS.Timeout }>({});
  const pollingIntervalsRef = useRef<{ friends?: NodeJS.Timeout; invitations?: NodeJS.Timeout }>({});
  const lastPresenceUpdateRef = useRef<number>(0);
  
  const connectionStatesRef = useRef({
    presenceConnected: false,
    invitationsConnected: false,
    retryCount: 0,
    maxRetries: 3,
    circuitState: 'CLOSED' as CircuitState,
    failureCount: 0,
    lastFailureTime: 0,
    circuitOpenUntil: 0
  });

  // Circuit breaker logic
  const checkCircuitState = useCallback(() => {
    const now = Date.now();
    const state = connectionStatesRef.current;
    
    if (state.circuitState === 'OPEN' && now >= state.circuitOpenUntil) {
      console.log('🔄 Circuit breaker: OPEN -> HALF_OPEN');
      state.circuitState = 'HALF_OPEN';
      state.failureCount = 0;
    }
    
    return state.circuitState !== 'OPEN';
  }, []);

  const recordFailure = useCallback(() => {
    const state = connectionStatesRef.current;
    state.failureCount++;
    state.lastFailureTime = Date.now();
    
    if (state.failureCount >= 3) {
      console.log('💥 Circuit breaker: CLOSED -> OPEN (too many failures)');
      state.circuitState = 'OPEN';
      state.circuitOpenUntil = Date.now() + 60000; // Open for 60 seconds
    }
  }, []);

  const recordSuccess = useCallback(() => {
    const state = connectionStatesRef.current;
    if (state.circuitState === 'HALF_OPEN') {
      console.log('✅ Circuit breaker: HALF_OPEN -> CLOSED');
      state.circuitState = 'CLOSED';
    }
    state.failureCount = 0;
  }, []);

  // Debounced refetch functions
  const debouncedRefetchFriends = useCallback(() => {
    if (debounceTimersRef.current.friends) {
      clearTimeout(debounceTimersRef.current.friends);
    }
    
    debounceTimersRef.current.friends = setTimeout(() => {
      console.log('🔄 Debounced refetch friends');
      refetchFriends();
    }, 1000);
  }, [refetchFriends]);

  const debouncedRefetchInvitations = useCallback(() => {
    if (debounceTimersRef.current.invitations) {
      clearTimeout(debounceTimersRef.current.invitations);
    }
    
    debounceTimersRef.current.invitations = setTimeout(() => {
      console.log('🔄 Debounced refetch invitations');
      refetchInvitations();
    }, 1000);
  }, [refetchInvitations]);

  // Polling fallback when subscriptions fail
  const startPolling = useCallback((type: 'friends' | 'invitations') => {
    if (pollingIntervalsRef.current[type]) {
      return; // Already polling
    }
    
    console.log(`📊 Starting polling fallback for ${type}`);
    pollingIntervalsRef.current[type] = setInterval(() => {
      if (type === 'friends') {
        refetchFriends();
      } else {
        refetchInvitations();
      }
    }, 15000); // Poll every 15 seconds
  }, [refetchFriends, refetchInvitations]);

  const stopPolling = useCallback((type: 'friends' | 'invitations') => {
    if (pollingIntervalsRef.current[type]) {
      console.log(`⏹️ Stopping polling fallback for ${type}`);
      clearInterval(pollingIntervalsRef.current[type]);
      pollingIntervalsRef.current[type] = undefined;
    }
  }, []);

  // Stabilized refetch functions
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

  // Enhanced real-time subscriptions with circuit breaker and graceful degradation
  useEffect(() => {
    if (!user?.id) return;

    console.log('📡 Setting up enhanced real-time subscriptions for user:', user.id);
    
    const exponentialBackoff = (attempt: number) => Math.min(1000 * Math.pow(2, attempt), 30000);
    
    const setupSubscription = async (type: 'presence' | 'invitations', attempt = 0) => {
      // Check circuit breaker
      if (!checkCircuitState()) {
        console.log(`⚡ Circuit breaker OPEN - falling back to polling for ${type}`);
        const pollingType = type === 'presence' ? 'friends' : 'invitations';
        startPolling(pollingType);
        return;
      }

      try {
        // Clean up existing subscription
        if (subscriptionsRef.current[type]) {
          subscriptionsRef.current[type].unsubscribe();
        }

        let subscription;
        if (type === 'presence') {
          subscription = friendsService.subscribeToFriendPresence(user.id, (presence) => {
            // Throttle presence updates to max once per 3 seconds
            const now = Date.now();
            if (now - lastPresenceUpdateRef.current < 3000) {
              console.log('⏭️ Throttling presence update');
              return;
            }
            lastPresenceUpdateRef.current = now;
            
            console.log('👥 Friend presence updated:', presence);
            connectionStatesRef.current.presenceConnected = true;
            connectionStatesRef.current.retryCount = 0;
            recordSuccess();
            stopPolling('friends');
            
            debouncedRefetchFriends();
          });
        } else {
          subscription = friendsService.subscribeToFriendInvitations(user.id, (invitation) => {
            console.log('📨 Friend invitation updated:', invitation);
            connectionStatesRef.current.invitationsConnected = true;
            connectionStatesRef.current.retryCount = 0;
            recordSuccess();
            stopPolling('invitations');
            
            debouncedRefetchInvitations();
          });
        }

        subscriptionsRef.current[type] = subscription;
        console.log(`✅ ${type} subscription established (attempt ${attempt + 1})`);
        recordSuccess();

      } catch (error) {
        console.error(`❌ ${type} subscription failed (attempt ${attempt + 1}):`, error);
        recordFailure();
        
        if (attempt < connectionStatesRef.current.maxRetries) {
          const delay = exponentialBackoff(attempt);
          console.log(`🔄 Retrying ${type} subscription in ${delay}ms...`);
          
          setTimeout(() => {
            setupSubscription(type, attempt + 1);
          }, delay);
        } else {
          console.error(`💥 ${type} subscription failed after ${connectionStatesRef.current.maxRetries} attempts - falling back to polling`);
          const pollingType = type === 'presence' ? 'friends' : 'invitations';
          startPolling(pollingType);
        }
      }
    };

    // Set up both subscriptions
    setupSubscription('presence');
    setupSubscription('invitations');

    // Reduced health check frequency (60 seconds)
    const healthCheckInterval = setInterval(() => {
      console.log('🏥 Health check - Circuit:', connectionStatesRef.current.circuitState, 'Presence:', connectionStatesRef.current.presenceConnected, 'Invitations:', connectionStatesRef.current.invitationsConnected);
      
      if (!connectionStatesRef.current.presenceConnected && checkCircuitState()) {
        console.log('🔄 Reconnecting presence subscription...');
        setupSubscription('presence');
      }
      
      if (!connectionStatesRef.current.invitationsConnected && checkCircuitState()) {
        console.log('🔄 Reconnecting invitations subscription...');
        setupSubscription('invitations');
      }
    }, 60000); // Check every 60 seconds

    return () => {
      console.log('🧹 Cleaning up enhanced real-time subscriptions');
      clearInterval(healthCheckInterval);
      
      // Clear debounce timers
      if (debounceTimersRef.current.friends) {
        clearTimeout(debounceTimersRef.current.friends);
      }
      if (debounceTimersRef.current.invitations) {
        clearTimeout(debounceTimersRef.current.invitations);
      }
      
      // Stop polling
      stopPolling('friends');
      stopPolling('invitations');
      
      // Unsubscribe from real-time
      if (subscriptionsRef.current.presence) {
        subscriptionsRef.current.presence.unsubscribe();
      }
      if (subscriptionsRef.current.invitations) {
        subscriptionsRef.current.invitations.unsubscribe();
      }
      subscriptionsRef.current = {};
    };
  }, [user?.id, checkCircuitState, recordSuccess, recordFailure, startPolling, stopPolling, debouncedRefetchFriends, debouncedRefetchInvitations]);

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