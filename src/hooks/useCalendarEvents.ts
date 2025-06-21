
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { calendarIntegrationService, CalendarEvent } from '@/services/calendarIntegrationService';
import { addDays, startOfDay } from 'date-fns';

export const useCalendarEvents = (startDate?: Date, endDate?: Date) => {
  const { user } = useAuth();
  
  const defaultStartDate = startDate || startOfDay(new Date());
  const defaultEndDate = endDate || addDays(defaultStartDate, 30);
  
  return useQuery({
    queryKey: ['calendarEvents', user?.id, defaultStartDate.toISOString(), defaultEndDate.toISOString()],
    queryFn: () => user 
      ? calendarIntegrationService.getLocalCalendarEvents(defaultStartDate, defaultEndDate)
      : Promise.resolve([]),
    enabled: !!user
  });
};

export const useCalendarIntegrations = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['calendarIntegrations', user?.id],
    queryFn: () => user ? calendarIntegrationService.getUserIntegrations() : Promise.resolve([]),
    enabled: !!user
  });
};

export const useSyncCalendarEvents = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (integrationId: string) => calendarIntegrationService.syncCalendarEvents(integrationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendarEvents', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['calendarIntegrations', user?.id] });
    }
  });
};

export const useImportEvents = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: ({ integrationId, startDate, endDate }: { 
      integrationId: string; 
      startDate?: Date; 
      endDate?: Date; 
    }) => calendarIntegrationService.importEvents(integrationId, startDate, endDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendarEvents', user?.id] });
    }
  });
};

export const useExportHangout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ hangoutId, integrationId }: { hangoutId: string; integrationId: string }) =>
      calendarIntegrationService.exportHangoutToCalendar(hangoutId, integrationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendarEvents'] });
    }
  });
};
