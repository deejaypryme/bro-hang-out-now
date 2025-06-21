
import { format, parseISO } from 'date-fns';
import { toZonedTime, fromZonedTime, formatInTimeZone } from 'date-fns-tz';

export interface TimeZoneInfo {
  timezone: string;
  offset: string;
  abbreviation: string;
  displayName: string;
}

export class TimeService {
  // Get user's browser timezone
  static getBrowserTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  // Get timezone offset for display
  static getTimezoneOffset(timezone: string): string {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const targetTime = new Date(utc + this.getTimezoneOffsetInMs(timezone));
    const offset = targetTime.getTimezoneOffset();
    const hours = Math.floor(Math.abs(offset) / 60);
    const minutes = Math.abs(offset) % 60;
    const sign = offset <= 0 ? '+' : '-';
    return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  private static getTimezoneOffsetInMs(timezone: string): number {
    const now = new Date();
    const utc1 = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
    const utc2 = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    return utc2.getTime() - utc1.getTime();
  }

  // Convert time from one timezone to another
  static convertTime(date: Date, fromTimezone: string, toTimezone: string): Date {
    const utcDate = fromZonedTime(date, fromTimezone);
    return toZonedTime(utcDate, toTimezone);
  }

  // Format time in specific timezone
  static formatInTimezone(date: Date, timezone: string, formatString: string = 'PPp'): string {
    return formatInTimeZone(date, timezone, formatString);
  }

  // Create a date with timezone awareness
  static createZonedDate(dateString: string, timeString: string, timezone: string): Date {
    const combined = `${dateString}T${timeString}`;
    return fromZonedTime(new Date(combined), timezone);
  }

  // Get common timezone options for selection
  static getCommonTimezones(): TimeZoneInfo[] {
    const timezones = [
      'America/New_York',
      'America/Chicago', 
      'America/Denver',
      'America/Los_Angeles',
      'America/Toronto',
      'America/Vancouver',
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Europe/Rome',
      'Asia/Tokyo',
      'Asia/Shanghai',
      'Asia/Kolkata',
      'Australia/Sydney',
      'Australia/Melbourne',
      'Pacific/Auckland',
      'UTC'
    ];

    return timezones.map(tz => ({
      timezone: tz,
      offset: this.getTimezoneOffset(tz),
      abbreviation: this.getTimezoneAbbreviation(tz),
      displayName: this.formatTimezoneDisplayName(tz)
    }));
  }

  // Make this method public so it can be used by components
  static getTimezoneAbbreviation(timezone: string): string {
    const now = new Date();
    return now.toLocaleString('en-US', { 
      timeZone: timezone, 
      timeZoneName: 'short' 
    }).split(' ').pop() || '';
  }

  private static formatTimezoneDisplayName(timezone: string): string {
    const parts = timezone.split('/');
    const city = parts[parts.length - 1].replace(/_/g, ' ');
    const region = parts[0];
    return `${city} (${region})`;
  }

  // Check if two dates are in different timezones
  static areDifferentTimezones(tz1: string, tz2: string): boolean {
    return tz1 !== tz2;
  }

  // Get time display with timezone indicator
  static getTimeWithTimezone(date: Date, timezone: string): string {
    const time = this.formatInTimezone(date, timezone, 'h:mm a');
    const abbreviation = this.getTimezoneAbbreviation(timezone);
    return `${time} ${abbreviation}`;
  }

  // Convert hangout time to user's timezone
  static convertHangoutTime(hangoutDate: string, hangoutTime: string, fromTimezone: string, toTimezone: string): { date: Date; timeString: string } {
    const originalDate = this.createZonedDate(hangoutDate, hangoutTime, fromTimezone);
    const convertedDate = toZonedTime(originalDate, toTimezone);
    const timeString = this.getTimeWithTimezone(convertedDate, toTimezone);
    
    return {
      date: convertedDate,
      timeString
    };
  }
}
