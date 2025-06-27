import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { TimeService } from '@/services/timeService';
import { friendService, hangoutService, activityService, timeSlotService, profileService } from '@/services/database';
import { friendsService } from '@/services/friendsService';
import { hangoutsService } from '@/services/hangoutsService';
import { availabilityService, type CreateAvailabilitySlot, type CreateException } from '@/services/availabilityService';
import { format, addDays } from 'date-fns';

export const useFriends = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['friends', user?.id],
    queryFn: async () => {
      console.log('🔍 Fetching friends for user:', user?.id);
      try {
        const result = user ? await friendsService.getFriends(user.id) : [];
        console.log('✅ Friends fetched successfully:', result.length);
        return result;
      } catch (error) {
        console.error('❌ Failed to fetch friends:', error);
        toast({
          title: "Error Loading Friends",
          description: "Failed to load your friends list. Please try again.",
          variant: "destructive"
        });
        throw error;
      }
    },
    enabled: !!user,
    retry: 3,
    retryDelay: 1000
  });
};

export const useFriendInvitations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['friendInvitations', user?.id],
    queryFn: async () => {
      console.log('🔍 Fetching friend invitations for user:', user?.id);
      try {
        const result = user ? await friendsService.getFriendInvitations(user.id) : [];
        console.log('✅ Friend invitations fetched successfully:', result.length);
        return result;
      } catch (error) {
        console.error('❌ Failed to fetch friend invitations:', error);
        toast({
          title: "Error Loading Invitations",
          description: "Failed to load your friend invitations. Please try again.",
          variant: "destructive"
        });
        throw error;
      }
    },
    enabled: !!user,
    retry: 3,
    retryDelay: 1000
  });
};

export const useUserPresence = (userId?: string) => {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['userPresence', userId],
    queryFn: async () => {
      console.log('🔍 Fetching user presence for:', userId);
      try {
        const result = userId ? await friendsService.getUserPresence(userId) : null;
        console.log('✅ User presence fetched:', result?.status);
        return result;
      } catch (error) {
        console.error('❌ Failed to fetch user presence:', error);
        return null; // Don't show toast for presence errors as they're not critical
      }
    },
    enabled: !!userId,
    retry: 1
  });
};

export const useSearchUsers = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (query: string) => {
      console.log('🔍 Searching users with query:', query);
      try {
        const result = await friendsService.searchUsers(query);
        console.log('✅ User search completed:', result.length, 'results');
        return result;
      } catch (error) {
        console.error('❌ User search failed:', error);
        toast({
          title: "Search Failed",
          description: "Failed to search for users. Please try again.",
          variant: "destructive"
        });
        throw error;
      }
    }
  });
};

export const useSendFriendInvitation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (invitation: any) => {
      console.log('📨 Sending friend invitation:', invitation);
      try {
        const result = await friendsService.sendFriendInvitation(invitation);
        console.log('✅ Friend invitation sent successfully:', result.id);
        return result;
      } catch (error) {
        console.error('❌ Failed to send friend invitation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('🔄 Invalidating friend invitations cache');
      queryClient.invalidateQueries({ queryKey: ['friendInvitations', user?.id] });
      toast({
        title: "Invitation Sent",
        description: "Friend invitation sent successfully!",
        variant: "default"
      });
    },
    onError: (error: any) => {
      console.error('❌ Friend invitation mutation failed:', error);
      const errorMessage = error?.message || 'Failed to send friend invitation';
      toast({
        title: "Invitation Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });
};

export const useRespondToInvitation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ invitationId, status }: { invitationId: string; status: 'accepted' | 'declined' }) => {
      console.log('📝 Responding to invitation:', invitationId, 'with status:', status);
      try {
        const result = await friendsService.respondToInvitation(invitationId, status);
        console.log('✅ Invitation response processed successfully');
        return result;
      } catch (error) {
        console.error('❌ Failed to respond to invitation:', error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      console.log('🔄 Invalidating caches after invitation response');
      queryClient.invalidateQueries({ queryKey: ['friendInvitations', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['friends', user?.id] });
      
      const action = variables.status === 'accepted' ? 'accepted' : 'declined';
      toast({
        title: `Invitation ${action}`,
        description: `Friend invitation ${action} successfully!`,
        variant: "default"
      });
    },
    onError: (error: any) => {
      console.error('❌ Invitation response failed:', error);
      toast({
        title: "Response Failed",
        description: "Failed to respond to invitation. Please try again.",
        variant: "destructive"
      });
    }
  });
};

export const useUpdateUserPresence = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: ({ status, customMessage }: { status: 'online' | 'offline' | 'busy' | 'away'; customMessage?: string }) => {
      console.log('🔄 User presence mutation called:', { status, customMessage });
      return friendsService.updateUserPresence(status, customMessage);
    },
    onSuccess: (data, variables) => {
      console.log('✅ User presence mutation successful:', variables);
      queryClient.invalidateQueries({ queryKey: ['userPresence', user?.id] });
    },
    onError: (error, variables) => {
      console.error('❌ User presence mutation failed:', error, variables);
      // Don't show toast for presence errors as they're background operations
    }
  });
};

export const useRemoveFriend = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (friendshipId: string) => {
      console.log('🗑️ Removing friend:', friendshipId);
      try {
        const result = await friendsService.removeFriend(friendshipId);
        console.log('✅ Friend removed successfully');
        return result;
      } catch (error) {
        console.error('❌ Failed to remove friend:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('🔄 Invalidating friends cache after removal');
      queryClient.invalidateQueries({ queryKey: ['friends', user?.id] });
      toast({
        title: "Friend Removed",
        description: "Friend removed successfully.",
        variant: "default"
      });
    },
    onError: (error: any) => {
      console.error('❌ Remove friend failed:', error);
      toast({
        title: "Remove Failed",
        description: "Failed to remove friend. Please try again.",
        variant: "destructive"
      });
    }
  });
};

export const useUpdateFriendNotes = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ friendshipId, notes }: { friendshipId: string; notes: string }) => {
      console.log('📝 Updating friend notes:', friendshipId);
      try {
        const result = await friendsService.updateFriendNotes(friendshipId, notes);
        console.log('✅ Friend notes updated successfully');
        return result;
      } catch (error) {
        console.error('❌ Failed to update friend notes:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('🔄 Invalidating friends cache after notes update');
      queryClient.invalidateQueries({ queryKey: ['friends', user?.id] });
      toast({
        title: "Notes Updated",
        description: "Friend notes updated successfully.",
        variant: "default"
      });
    },
    onError: (error: any) => {
      console.error('❌ Update friend notes failed:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update friend notes. Please try again.",
        variant: "destructive"
      });
    }
  });
};

export const useToggleFriendFavorite = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ friendshipId, favorite }: { friendshipId: string; favorite: boolean }) => {
      console.log('⭐ Toggling friend favorite:', friendshipId, 'to', favorite);
      try {
        const result = await friendsService.toggleFriendFavorite(friendshipId, favorite);
        console.log('✅ Friend favorite toggled successfully');
        return result;
      } catch (error) {
        console.error('❌ Failed to toggle friend favorite:', error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      console.log('🔄 Invalidating friends cache after favorite toggle');
      queryClient.invalidateQueries({ queryKey: ['friends', user?.id] });
      const action = variables.favorite ? 'added to' : 'removed from';
      toast({
        title: "Favorites Updated",
        description: `Friend ${action} favorites successfully.`,
        variant: "default"
      });
    },
    onError: (error: any) => {
      console.error('❌ Toggle friend favorite failed:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive"
      });
    }
  });
};

export const useHangouts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['hangouts', user?.id],
    queryFn: async () => {
      console.log('🔍 Fetching hangouts for user:', user?.id);
      try {
        const result = user ? await hangoutService.getHangouts(user.id) : [];
        console.log('✅ Hangouts fetched successfully:', result.length);
        return result;
      } catch (error) {
        console.error('❌ Failed to fetch hangouts:', error);
        toast({
          title: "Error Loading Hangouts",
          description: "Failed to load your hangouts. Please try again.",
          variant: "destructive"
        });
        throw error;
      }
    },
    enabled: !!user,
    retry: 3
  });
};

export const useActivities = () => {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      console.log('🔍 Fetching activities');
      try {
        const result = await activityService.getActivities();
        console.log('✅ Activities fetched successfully:', result.length);
        return result;
      } catch (error) {
        console.error('❌ Failed to fetch activities:', error);
        toast({
          title: "Error Loading Activities",
          description: "Failed to load activities. Please try again.",
          variant: "destructive"
        });
        throw error;
      }
    },
    retry: 3
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
