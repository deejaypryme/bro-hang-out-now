import { format } from 'date-fns';
import type { HangoutWithDetails } from '@/types/database';

export interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  description: string;
  location?: string;
}

// Convert hangout to calendar event
export const hangoutToCalendarEvent = (hangout: HangoutWithDetails): CalendarEvent => {
  const startDate = new Date(`${hangout.scheduled_date}T${hangout.scheduled_time}`);
  const endDate = new Date(startDate.getTime() + (hangout.duration_minutes || 60) * 60000);
  
  return {
    title: `${hangout.activity_emoji || '🤝'} ${hangout.activity_name} with ${hangout.friendName}`,
    start: startDate,
    end: endDate,
    description: `BroYouFree hangout: ${hangout.activity_name} with ${hangout.friendName}.\n\nPlanned via BroYouFree app.`,
    location: hangout.location || 'Location TBD'
  };
};

// Format date for URL encoding
const formatDateForUrl = (date: Date): string => {
  return format(date, "yyyyMMdd'T'HHmmss'Z'");
};

// Generate Google Calendar URL
export const generateGoogleCalendarUrl = (event: CalendarEvent): string => {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatDateForUrl(event.start)}/${formatDateForUrl(event.end)}`,
    details: event.description,
    ...(event.location && { location: event.location })
  });
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

// Generate Outlook Calendar URL
export const generateOutlookCalendarUrl = (event: CalendarEvent): string => {
  const params = new URLSearchParams({
    subject: event.title,
    startdt: event.start.toISOString(),
    enddt: event.end.toISOString(),
    body: event.description,
    ...(event.location && { location: event.location })
  });
  
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
};

// Generate Yahoo Calendar URL
export const generateYahooCalendarUrl = (event: CalendarEvent): string => {
  const params = new URLSearchParams({
    v: '60',
    title: event.title,
    st: formatDateForUrl(event.start),
    et: formatDateForUrl(event.end),
    desc: event.description,
    ...(event.location && { in_loc: event.location })
  });
  
  return `https://calendar.yahoo.com/?${params.toString()}`;
};

// Generate Apple Calendar ICS data URL
export const generateAppleCalendarUrl = (event: CalendarEvent): string => {
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BroYouFree//Calendar Export//EN',
    'BEGIN:VEVENT',
    `DTSTART:${formatDateForUrl(event.start)}`,
    `DTEND:${formatDateForUrl(event.end)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
    ...(event.location ? [`LOCATION:${event.location}`] : []),
    `UID:broyoufree-${Date.now()}@broyoufree.com`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\\r\\n');

  const blob = new Blob([icsContent], { type: 'text/calendar' });
  return URL.createObjectURL(blob);
};

export const calendarProviders = [
  {
    name: 'Google Calendar',
    id: 'google',
    icon: '📅',
    color: 'bg-blue-500',
    generateUrl: generateGoogleCalendarUrl
  },
  {
    name: 'Outlook',
    id: 'outlook', 
    icon: '📧',
    color: 'bg-blue-600',
    generateUrl: generateOutlookCalendarUrl
  },
  {
    name: 'Yahoo Calendar',
    id: 'yahoo',
    icon: '🟣',
    color: 'bg-purple-500',
    generateUrl: generateYahooCalendarUrl
  },
  {
    name: 'Apple Calendar',
    id: 'apple',
    icon: '🍎',
    color: 'bg-gray-700',
    generateUrl: generateAppleCalendarUrl
  }
];