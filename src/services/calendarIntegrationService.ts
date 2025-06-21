
import { supabase } from '@/integrations/supabase/client';

export interface CalendarProvider {
  id: string;
  name: string;
  type: 'google' | 'outlook' | 'apple';
  isConnected: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  attendees?: string[];
  providerId: string;
  providerEventId: string;
  isAllDay: boolean;
}

export interface CalendarIntegration {
  id: string;
  userId: string;
  provider: 'google' | 'outlook' | 'apple';
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  calendarId: string;
  calendarName: string;
  isActive: boolean;
  lastSyncAt?: Date;
}

class CalendarIntegrationService {
  // Google Calendar Integration
  async connectGoogleCalendar(authCode: string): Promise<CalendarIntegration> {
    const response = await fetch('/api/calendar/google/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authCode })
    });
    
    if (!response.ok) {
      throw new Error('Failed to connect Google Calendar');
    }
    
    return response.json();
  }

  async getGoogleAuthUrl(): Promise<string> {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const scope = 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events';
    
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&access_type=offline&prompt=consent`;
  }

  // Outlook Calendar Integration
  async connectOutlookCalendar(authCode: string): Promise<CalendarIntegration> {
    const response = await fetch('/api/calendar/outlook/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authCode })
    });
    
    if (!response.ok) {
      throw new Error('Failed to connect Outlook Calendar');
    }
    
    return response.json();
  }

  async getOutlookAuthUrl(): Promise<string> {
    const clientId = process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/outlook/callback`;
    const scope = 'https://graph.microsoft.com/calendars.read https://graph.microsoft.com/calendars.readwrite';
    
    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scope}&response_mode=query`;
  }

  // Event Management
  async importEvents(integrationId: string, startDate?: Date, endDate?: Date): Promise<CalendarEvent[]> {
    const { user } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const response = await fetch(`/api/calendar/${integrationId}/events/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString()
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to import events');
    }
    
    return response.json();
  }

  async exportHangoutToCalendar(hangoutId: string, integrationId: string): Promise<void> {
    const { user } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const response = await fetch(`/api/calendar/${integrationId}/events/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hangoutId })
    });
    
    if (!response.ok) {
      throw new Error('Failed to export hangout to calendar');
    }
  }

  // Integration Management
  async getUserIntegrations(): Promise<CalendarIntegration[]> {
    const { user } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('calendar_integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  }

  async disconnectIntegration(integrationId: string): Promise<void> {
    const { user } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('calendar_integrations')
      .update({ is_active: false })
      .eq('id', integrationId)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  async syncCalendarEvents(integrationId: string): Promise<CalendarEvent[]> {
    const { user } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const response = await fetch(`/api/calendar/${integrationId}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error('Failed to sync calendar events');
    }
    
    return response.json();
  }

  // Local calendar events management
  async getLocalCalendarEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    const { user } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', user.id)
      .gte('start_time', startDate.toISOString())
      .lte('end_time', endDate.toISOString())
      .order('start_time');

    if (error) throw error;
    
    return (data || []).map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      startTime: new Date(event.start_time),
      endTime: new Date(event.end_time),
      location: event.location,
      attendees: event.attendees || [],
      providerId: event.provider_id || 'local',
      providerEventId: event.provider_event_id || event.id,
      isAllDay: event.is_all_day || false
    }));
  }
}

export const calendarIntegrationService = new CalendarIntegrationService();
