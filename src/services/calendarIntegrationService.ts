
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
    const { data: { user } } = await supabase.auth.getUser();
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
    const { data: { user } } = await supabase.auth.getUser();
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // For now, return empty array since the backend APIs are not implemented
    // In a real implementation, this would query the calendar_integrations table
    return [];
  }

  async disconnectIntegration(integrationId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // For now, just simulate success
    // In a real implementation, this would update the calendar_integrations table
    console.log(`Disconnecting integration ${integrationId}`);
  }

  async syncCalendarEvents(integrationId: string): Promise<CalendarEvent[]> {
    const { data: { user } } = await supabase.auth.getUser();
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // For now, return empty array since the backend APIs are not implemented
    // In a real implementation, this would query the calendar_events table
    return [];
  }
}

export const calendarIntegrationService = new CalendarIntegrationService();
