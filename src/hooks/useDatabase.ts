import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { friendService, hangoutService, activityService, timeSlotService } from '@/services/database';
import { friendsService } from '@/services/friendsService';
import { hangoutsService } from '@/services/hangoutsService';

export const useFriends = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['friends', user?.id],
    queryFn: () => user ? friendsService.getFriends(user.id) : Promise.resolve([]),
    enabled: !!user
  });
};

export const useFriendInvitations = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['friendInvitations', user?.id],
    queryFn: () => user ? friendsService.getFriendInvitations(user.id) : Promise.resolve([]),
    enabled: !!user
  });
};

export const useUserPresence = (userId?: string) => {
  return useQuery({
    queryKey: ['userPresence', userId],
    queryFn: () => userId ? friendsService.getUserPresence(userId) : Promise.resolve(null),
    enabled: !!userId
  });
};

export const useSearchUsers = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (query: string) => friendsService.searchUsers(query)
  });
};

export const useSendFriendInvitation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: friendsService.sendFriendInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendInvitations', user?.id] });
    }
  });
};

export const useRespondToInvitation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: ({ invitationId, status }: { invitationId: string; status: 'accepted' | 'declined' }) =>
      friendsService.respondToInvitation(invitationId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendInvitations', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['friends', user?.id] });
    }
  });
};

export const useUpdateUserPresence = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: ({ status, customMessage }: { status: 'online' | 'offline' | 'busy' | 'away'; customMessage?: string }) =>
      friendsService.updateUserPresence(status, customMessage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPresence', user?.id] });
    }
  });
};

export const useRemoveFriend = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (friendshipId: string) => friendsService.removeFriend(friendshipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends', user?.id] });
    }
  });
};

export const useUpdateFriendNotes = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: ({ friendshipId, notes }: { friendshipId: string; notes: string }) =>
      friendsService.updateFriendNotes(friendshipId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends', user?.id] });
    }
  });
};

export const useToggleFriendFavorite = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: ({ friendshipId, favorite }: { friendshipId: string; favorite: boolean }) =>
      friendsService.toggleFriendFavorite(friendshipId, favorite),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends', user?.id] });
    }
  });
};

export const useHangouts = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['hangouts', user?.id],
    queryFn: () => user ? hangoutService.getHangouts(user.id) : Promise.resolve([]),
    enabled: !!user
  });
};

export const useActivities = () => {
  return useQuery({
    queryKey: ['activities'],
    queryFn: activityService.getActivities
  });
};

export const useTimeSlots = (startDate?: string, endDate?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['timeSlots', user?.id, startDate, endDate],
    queryFn: () => user ? timeSlotService.getTimeSlots(user.id, startDate, endDate) : Promise.resolve([]),
    enabled: !!user
  });
};

export const useCreateHangout = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: hangoutService.createHangout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hangouts', user?.id] });
    }
  });
};

export const useUpdateHangout = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      hangoutService.updateHangout(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hangouts', user?.id] });
    }
  });
};

export const useHangoutInvitations = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['hangoutInvitations', user?.id],
    queryFn: () => user ? hangoutsService.getHangoutInvitations(user.id) : Promise.resolve([]),
    enabled: !!user
  });
};

export const useRespondToHangoutInvitation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: ({ invitationId, response }: { invitationId: string; response: 'accepted' | 'declined' }) =>
      hangoutsService.respondToInvitation(invitationId, response),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hangoutInvitations', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['hangouts', user?.id] });
    }
  });
};

export const useUpdateHangoutStatus = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: ({ hangoutId, status, reason }: { hangoutId: string; status: 'confirmed' | 'completed' | 'cancelled' | 'rescheduled'; reason?: string }) =>
      hangoutsService.updateHangoutStatus(hangoutId, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hangouts', user?.id] });
    }
  });
};
