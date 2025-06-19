
import { createEvent, EventAttributes } from 'ics';
import { Hangout } from '../data/mockData';

export interface CalendarExportResult {
  success: boolean;
  filename?: string;
  error?: string;
}

// Convert Date to ICS format array [year, month, day, hour, minute]
const dateToICSArray = (date: Date): [number, number, number, number, number] => {
  return [
    date.getFullYear(),
    date.getMonth() + 1, // ICS months are 1-indexed
    date.getDate(),
    date.getHours(),
    date.getMinutes()
  ];
};

// Add minutes to a date
const addMinutes = (date: Date, minutes: number): Date => {
  return new Date(date.getTime() + minutes * 60000);
};

export const generateCalendarEvent = (hangout: Hangout): CalendarExportResult => {
  try {
    if (!hangout.confirmed || !hangout.confirmedDateTime) {
      return {
        success: false,
        error: 'Hangout must be confirmed with a confirmed date/time to export to calendar'
      };
    }

    const startDate = hangout.confirmedDateTime;
    const endDate = addMinutes(startDate, hangout.duration || 60);
    
    const eventAttributes: EventAttributes = {
      start: dateToICSArray(startDate),
      end: dateToICSArray(endDate),
      title: `${hangout.activityEmoji} ${hangout.activity} with ${hangout.friendName}`,
      description: `BroYouFree hangout: ${hangout.activity} with ${hangout.friendName}.\n\nActivity: ${hangout.activity}\nFriend: ${hangout.friendName}\nPlanned via BroYouFree app.`,
      location: hangout.location || 'Location TBD',
      uid: `broyoufree-${hangout.id}-${Date.now()}`,
      organizer: { name: 'BroYouFree', email: 'noreply@broyoufree.com' },
      alarms: [
        {
          action: 'display',
          description: `Reminder: ${hangout.activity} with ${hangout.friendName} in 24 hours`,
          trigger: { hours: 24, minutes: 0, before: true }
        },
        {
          action: 'display', 
          description: `Reminder: ${hangout.activity} with ${hangout.friendName} in 1 hour`,
          trigger: { hours: 1, minutes: 0, before: true }
        }
      ]
    };

    const { error, value } = createEvent(eventAttributes);
    
    if (error) {
      console.error('Error creating calendar event:', error);
      return {
        success: false,
        error: `Failed to create calendar event: ${error.message || 'Unknown error'}`
      };
    }

    if (!value) {
      return {
        success: false,
        error: 'No calendar data generated'
      };
    }

    // Generate filename
    const dateStr = startDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    const filename = `BroTime-${hangout.friendName.replace(/\s+/g, '')}-${hangout.activity.replace(/\s+/g, '')}-${dateStr}.ics`;

    // Create and download the file
    const blob = new Blob([value], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return {
      success: true,
      filename
    };

  } catch (error) {
    console.error('Error generating calendar export:', error);
    return {
      success: false,
      error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

export const exportHangoutToCalendar = (hangout: Hangout): Promise<CalendarExportResult> => {
  return new Promise((resolve) => {
    // Use setTimeout to make this async and allow UI to update
    setTimeout(() => {
      const result = generateCalendarEvent(hangout);
      resolve(result);
    }, 100);
  });
};

// Export multiple hangouts as a single calendar file
export const exportMultipleHangouts = (hangouts: Hangout[]): CalendarExportResult => {
  try {
    const confirmedHangouts = hangouts.filter(h => h.confirmed && h.confirmedDateTime);
    
    if (confirmedHangouts.length === 0) {
      return {
        success: false,
        error: 'No confirmed hangouts to export'
      };
    }

    let icsContent = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//BroYouFree//Calendar Export//EN\r\n';
    
    for (const hangout of confirmedHangouts) {
      const result = generateCalendarEvent(hangout);
      if (result.success) {
        // This is a simplified approach - in production you'd want to properly combine the ICS content
        console.log(`Successfully generated event for ${hangout.friendName}`);
      }
    }
    
    icsContent += 'END:VCALENDAR\r\n';
    
    const filename = `BroYouFree-Hangouts-${new Date().toISOString().split('T')[0]}.ics`;
    
    // For now, just export the first hangout as proof of concept
    return generateCalendarEvent(confirmedHangouts[0]);
    
  } catch (error) {
    return {
      success: false,
      error: `Error exporting multiple hangouts: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};
