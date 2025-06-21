
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { TimeService } from '@/services/timeService';
import { addDays, format } from 'date-fns';
import type { AvailabilityComparison, MutualTimeSlot } from '@/services/mutualAvailabilityService';

export const useMutualAvailability = (
  friendId?: string,
  startDate?: string,
  endDate?: string,
  duration: number = 120,
  bufferMinutes: number = 15
) => {
  const { user } = useAuth();
  
  const defaultStartDate = startDate || format(new Date(), 'yyyy-MM-dd');
  const defaultEndDate = endDate || format(addDays(new Date(), 14), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['mutualAvailability', user?.id, friendId, defaultStartDate, defaultEndDate, duration],
    queryFn: () => {
      if (!user || !friendId) {
        return Promise.resolve(null);
      }
      return TimeService.findMutualAvailability(
        user.id,
        friendId,
        defaultStartDate,
        defaultEndDate,
        duration,
        bufferMinutes
      );
    },
    enabled: !!user && !!friendId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000 // 10 minutes
  });
};

export const useOptimalTimeSlots = (friendId?: string, daysAhead: number = 7, duration: number = 120) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['optimalTimeSlots', user?.id, friendId, daysAhead, duration],
    queryFn: () => {
      if (!user || !friendId) {
        return Promise.resolve(null);
      }
      return TimeService.getOptimalTimeSlots(user.id, friendId, daysAhead, duration);
    },
    enabled: !!user && !!friendId,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000
  });
};

export const useRefreshMutualAvailability = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ friendId, startDate, endDate }: { 
      friendId: string; 
      startDate?: string; 
      endDate?: string; 
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      const defaultStartDate = startDate || format(new Date(), 'yyyy-MM-dd');
      const defaultEndDate = endDate || format(addDays(new Date(), 14), 'yyyy-MM-dd');
      
      return TimeService.findMutualAvailability(
        user.id,
        friendId,
        defaultStartDate,
        defaultEndDate
      );
    },
    onSuccess: (data, variables) => {
      // Update relevant queries
      queryClient.setQueryData(
        ['mutualAvailability', user?.id, variables.friendId],
        data
      );
      queryClient.invalidateQueries({ 
        queryKey: ['mutualAvailability', user?.id, variables.friendId] 
      });
    }
  });
};

// Hook for quick availability check between users
export const useQuickAvailabilityCheck = () => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      friendId, 
      proposedDate, 
      proposedTime, 
      duration = 120 
    }: { 
      friendId: string; 
      proposedDate: string; 
      proposedTime: string; 
      duration?: number; 
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      const availability = await TimeService.findMutualAvailability(
        user.id,
        friendId,
        proposedDate,
        proposedDate,
        duration
      );
      
      // Check if proposed time matches any mutual slots
      const proposedMatches = availability.mutualSlots.some(slot => 
        slot.date === proposedDate && 
        slot.startTime <= proposedTime &&
        slot.endTime >= proposedTime
      );

      return {
        isAvailable: proposedMatches,
        alternatives: availability.mutualSlots.slice(0, 3),
        conflicts: availability.conflictCount
      };
    }
  });
};
