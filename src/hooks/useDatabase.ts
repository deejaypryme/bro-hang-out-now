
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { TimeService } from '@/services/timeService';
import { friendService, hangoutService, activityService, timeSlotService, profileService } from '@/services/database';
import { friendsService } from '@/services/friendsService';
import { hangoutsService } from '@/services/hangoutsService';
import { availabilityService, type CreateAvailabilitySlot, type CreateException } from '@/services/availabilityService';
import { format, addDays } from 'date-fns';

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

export const useUserAvailability = (startDate?: string, endDate?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['userAvailability', user?.id, startDate, endDate],
    queryFn: () => user ? availabilityService.getUserAvailability(user.id, startDate, endDate) : Promise.resolve([]),
    enabled: !!user
  });
};

export const useAvailableTimeSlots = (date: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['availableTimeSlots', user?.id, date],
    queryFn: () => user ? availabilityService.getAvailableTimeSlotsForDate(user.id, date) : Promise.resolve([]),
    enabled: !!user && !!date
  });
};

export const useCreateAvailabilitySlot = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (slot: CreateAvailabilitySlot) => {
      if (!user) throw new Error('User not authenticated');
      return availabilityService.createAvailabilitySlot(user.id, slot);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userAvailability', user?.id] });
    }
  });
};

export const useUpdateAvailabilitySlot = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: ({ slotId, updates }: { slotId: string; updates: Partial<CreateAvailabilitySlot> }) =>
      availabilityService.updateAvailabilitySlot(slotId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userAvailability', user?.id] });
    }
  });
};

export const useDeleteAvailabilitySlot = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (slotId: string) => availabilityService.deleteAvailabilitySlot(slotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userAvailability', user?.id] });
    }
  });
};

export const useAvailabilityExceptions = (startDate?: string, endDate?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['availabilityExceptions', user?.id, startDate, endDate],
    queryFn: () => user ? availabilityService.getAvailabilityExceptions(user.id, startDate, endDate) : Promise.resolve([]),
    enabled: !!user
  });
};

export const useCreateAvailabilityException = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (exception: CreateException) => {
      if (!user) throw new Error('User not authenticated');
      return availabilityService.createAvailabilityException(user.id, exception);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availabilityExceptions', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['availableTimeSlots', user?.id] });
    }
  });
};

export const useUpdateUserTimezone = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (timezone: string) => {
      if (!user) throw new Error('User not authenticated');
      return profileService.updateTimezone(user.id, timezone);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    }
  });
};

// Smart Suggestions Hooks
export const useSmartSuggestions = (
  friendId?: string,
  startDate?: string,
  endDate?: string,
  options: {
    duration?: number;
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'any';
    includeWeekends?: boolean;
    maxSuggestions?: number;
  } = {}
) => {
  const { user } = useAuth();
  
  const defaultStartDate = startDate || format(new Date(), 'yyyy-MM-dd');
  const defaultEndDate = endDate || format(addDays(new Date(), 14), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['smartSuggestions', user?.id, friendId, defaultStartDate, defaultEndDate, options],
    queryFn: () => {
      if (!user || !friendId) {
        return Promise.resolve(null);
      }
      return TimeService.getSmartSuggestionsWithPreferences(
        user.id,
        friendId,
        defaultStartDate,
        defaultEndDate,
        options
      );
    },
    enabled: !!user && !!friendId,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 8 * 60 * 1000 // 8 minutes
  });
};

export const useQuickSmartSuggestions = (friendId?: string, daysAhead: number = 7, duration: number = 120) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['quickSmartSuggestions', user?.id, friendId, daysAhead, duration],
    queryFn: () => {
      if (!user || !friendId) {
        return Promise.resolve(null);
      }
      return TimeService.getQuickSmartSuggestions(user.id, friendId, daysAhead, duration);
    },
    enabled: !!user && !!friendId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  });
};

export const useRefreshSmartSuggestions = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      friendId, 
      startDate, 
      endDate, 
      options = {} 
    }: { 
      friendId: string; 
      startDate?: string; 
      endDate?: string; 
      options?: {
        duration?: number;
        timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'any';
        includeWeekends?: boolean;
        maxSuggestions?: number;
      };
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      const defaultStartDate = startDate || format(new Date(), 'yyyy-MM-dd');
      const defaultEndDate = endDate || format(addDays(new Date(), 14), 'yyyy-MM-dd');
      
      return TimeService.getSmartSuggestionsWithPreferences(
        user.id,
        friendId,
        defaultStartDate,
        defaultEndDate,
        options
      );
    },
    onSuccess: (data, variables) => {
      // Update relevant queries
      queryClient.setQueryData(
        ['smartSuggestions', user?.id, variables.friendId],
        data
      );
      queryClient.invalidateQueries({ 
        queryKey: ['smartSuggestions', user?.id, variables.friendId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['quickSmartSuggestions', user?.id, variables.friendId] 
      });
    }
  });
};

// Hook for getting suggestions based on user patterns
export const usePatternBasedSuggestions = (friendId?: string) => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      timeOfDayPreference, 
      includeWeekends = true,
      daysAhead = 14 
    }: { 
      timeOfDayPreference?: 'morning' | 'afternoon' | 'evening' | 'any';
      includeWeekends?: boolean;
      daysAhead?: number;
    }) => {
      if (!user || !friendId) throw new Error('User or friend not specified');
      
      const startDate = format(new Date(), 'yyyy-MM-dd');
      const endDate = format(addDays(new Date(), daysAhead), 'yyyy-MM-dd');
      
      return TimeService.getSmartSuggestionsWithPreferences(
        user.id,
        friendId,
        startDate,
        endDate,
        {
          timeOfDay: timeOfDayPreference,
          includeWeekends,
          maxSuggestions: 8
        }
      );
    }
  });
};
