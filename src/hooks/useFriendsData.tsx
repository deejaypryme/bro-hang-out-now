import { useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFriends, useFriendInvitations, useUpdateUserPresence } from '@/hooks/useDatabase';
import { friendsService } from '@/services/friendsService';

export const useFriendsData = () => {
  const { user } = useAuth();
  const { data: friends = [], isLoading: friendsLoading, error: friendsError, refetch: refetchFriends } = useFriends();
  const { data: invitations = [], isLoading: invitationsLoading, error: invitationsError, refetch: refetchInvitations } = useFriendInvitations();
  const updatePresence = useUpdateUserPresence();

  // Set user presence to online when component mounts, offline when unmounts
  useEffect(() => {
    if (!user?.id) return;

    console.log('🔄 Setting user presence to online for user:', user.id);
    
    // Set user online when component mounts
    updatePresence.mutate({ status: 'online' });

    // Cleanup: Set user offline when component unmounts
    return () => {
      console.log('🔄 Setting user presence to offline for user:', user.id);
      // Use a timeout to avoid calling mutation during cleanup
      setTimeout(() => {
        updatePresence.mutate({ status: 'offline' });
      }, 0);
    };
  }, [user?.id]); // Removed updatePresence from dependencies

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user?.id) return;

    console.log('📡 Setting up real-time subscriptions for user:', user.id);
    
    // Set up presence subscription
    const presenceChannel = friendsService.subscribeToFriendPresence(user.id, (presence) => {
      console.log('👥 Friend presence updated:', presence);
      // Simple refetch without cascading effects
      setTimeout(() => refetchFriends(), 100);
    });
    
    // Set up invitations subscription
    const invitationsChannel = friendsService.subscribeToFriendInvitations(user.id, (invitation) => {
      console.log('📨 Friend invitation updated:', invitation);
      // Simple refetch without cascading effects
      setTimeout(() => refetchInvitations(), 100);
    });

    return () => {
      console.log('🧹 Cleaning up real-time subscriptions');
      presenceChannel.unsubscribe();
      invitationsChannel.unsubscribe();
    };
  }, [user?.id]); // Removed refetch functions from dependencies

  const handleRefetchFriends = useCallback(() => {
    console.log('🔄 Manually refetching friends...');
    refetchFriends();
  }, [refetchFriends]);

  const handleRefetchInvitations = useCallback(() => {
    console.log('🔄 Manually refetching invitations...');
    refetchInvitations();
  }, [refetchInvitations]);

  return {
    friends,
    friendsLoading,
    friendsError,
    invitations,
    invitationsLoading,
    invitationsError,
    handleRefetchFriends,
    handleRefetchInvitations
  };
};