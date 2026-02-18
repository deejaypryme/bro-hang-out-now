
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { conflictDetectionService, type ConflictCheckRequest, type ConflictDetectionResult } from '@/services/conflictDetectionService';
import type { TimeOption } from '@/components/TimeSelection';

export const useConflictDetection = (
  friendId?: string,
  enabled: boolean = true
) => {
  const { user } = useAuth();

  const checkConflicts = useMutation({
    mutationFn: (request: ConflictCheckRequest) => conflictDetectionService.detectConflicts(request),
    gcTime: 2 * 60 * 1000 // Cache for 2 minutes
  });

  const checkTimeSlotAvailability = useMutation({
    mutationFn: ({ date, startTime, duration }: { 
      date: string; 
      startTime: string; 
      duration: number; 
    }) => {
      if (!user || !friendId) throw new Error('User or friend not available');
      
      return conflictDetectionService.detectConflicts({
        userId: user.id,
        friendId,
        proposedDate: date,
        proposedTime: startTime,
        duration
      });
    }
  });

  const generateAlternatives = useMutation({
    mutationFn: ({ date, duration }: { date: string; duration: number }) => {
      if (!user || !friendId) throw new Error('User or friend not available');
      
      return conflictDetectionService.generateAlternatives(user.id, friendId, date, duration);
    }
  });

  return {
    checkConflicts,
    checkTimeSlotAvailability,
    generateAlternatives,
    isEnabled: enabled && !!user && !!friendId
  };
};

export const useBatchConflictCheck = (
  friendId?: string,
  timeOptions: TimeOption[] = [],
  duration: number = 120
) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['batchConflictCheck', user?.id, friendId, timeOptions, duration],
    queryFn: async () => {
      if (!user || !friendId || timeOptions.length === 0) {
        return [];
      }

      const conflictResults = await Promise.all(
        timeOptions.map(option => 
          conflictDetectionService.detectConflicts({
            userId: user.id,
            friendId,
            proposedDate: option.date,
            proposedTime: option.startTime,
            duration
          })
        )
      );

      return timeOptions.map((option, index) => ({
        timeOption: option,
        conflicts: conflictResults[index]
      }));
    },
    enabled: !!user && !!friendId && timeOptions.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000 // 5 minutes
  });
};

export const useConflictResolution = () => {
  const queryClient = useQueryClient();

  const resolveConflict = useMutation({
    mutationFn: async ({ 
      conflictId, 
      resolution 
    }: { 
      conflictId: string; 
      resolution: 'reschedule' | 'cancel' | 'ignore' 
    }) => {
      // This would be implemented based on the conflict type
      // For now, we'll just simulate the resolution
      
      return { success: true, conflictId, resolution };
    },
    onSuccess: () => {
      // Invalidate relevant queries after conflict resolution
      queryClient.invalidateQueries({ queryKey: ['batchConflictCheck'] });
      queryClient.invalidateQueries({ queryKey: ['calendarEvents'] });
      queryClient.invalidateQueries({ queryKey: ['hangouts'] });
    }
  });

  return {
    resolveConflict
  };
};
