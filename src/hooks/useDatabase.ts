
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { friendService, hangoutService, activityService, timeSlotService } from '@/services/database';

export const useFriends = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['friends', user?.id],
    queryFn: () => user ? friendService.getFriends(user.id) : Promise.resolve([]),
    enabled: !!user
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
