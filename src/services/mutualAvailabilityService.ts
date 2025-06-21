
import { TimeService } from './timeService';
import { availabilityService } from './availabilityService';
import { calendarIntegrationService } from './calendarIntegrationService';
import { addDays, format, parseISO, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

export interface MutualTimeSlot {
  date: string;
  startTime: string;
  endTime: string;
  confidence: number;
  userTimezone: string;
  friendTimezone: string;
  bufferBefore: number; // minutes
  bufferAfter: number; // minutes
  reasoning: string[];
}

export interface AvailabilityComparison {
  userId: string;
  friendId: string;
  startDate: string;
  endDate: string;
  mutualSlots: MutualTimeSlot[];
  conflictCount: number;
  optimalDuration: number; // in minutes
}

export class MutualAvailabilityService {
  private static readonly DEFAULT_BUFFER_MINUTES = 15;
  private static readonly MIN_SLOT_DURATION = 60; // 1 hour minimum
  private static readonly CONFIDENCE_WEIGHTS = {
    BOTH_PREFERRED: 0.4,
    TIMEZONE_CONVENIENCE: 0.3,
    AVAILABILITY_OVERLAP: 0.2,
    BUFFER_ADEQUACY: 0.1
  };

  // Main method to find mutual availability between two users
  static async findMutualAvailability(
    userId: string,
    friendId: string,
    startDate: string,
    endDate: string,
    preferredDuration: number = 120,
    bufferMinutes: number = this.DEFAULT_BUFFER_MINUTES
  ): Promise<AvailabilityComparison> {
    console.log(`Finding mutual availability between ${userId} and ${friendId}`);

    // Get both users' availability and calendar events
    const [userAvailability, friendAvailability, userEvents, friendEvents] = await Promise.all([
      availabilityService.getUserAvailability(userId, startDate, endDate),
      availabilityService.getUserAvailability(friendId, startDate, endDate),
      this.getUserCalendarEvents(userId, startDate, endDate),
      this.getUserCalendarEvents(friendId, startDate, endDate)
    ]);

    // Get timezone info for both users
    const userTimezone = await this.getUserTimezone(userId);
    const friendTimezone = await this.getUserTimezone(friendId);

    const mutualSlots: MutualTimeSlot[] = [];
    let conflictCount = 0;

    // Generate potential time slots for each day in the range
    const currentDate = new Date(startDate);
    const endDateObj = new Date(endDate);

    while (currentDate <= endDateObj) {
      const dateString = format(currentDate, 'yyyy-MM-dd');
      const dayOfWeek = currentDate.getDay();

      // Find overlapping availability for this date
      const daySlots = await this.findDayMutualSlots(
        userAvailability,
        friendAvailability,
        userEvents,
        friendEvents,
        dateString,
        dayOfWeek,
        userTimezone,
        friendTimezone,
        preferredDuration,
        bufferMinutes
      );

      mutualSlots.push(...daySlots);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Sort slots by confidence score
    mutualSlots.sort((a, b) => b.confidence - a.confidence);

    return {
      userId,
      friendId,
      startDate,
      endDate,
      mutualSlots: mutualSlots.slice(0, 10), // Return top 10 slots
      conflictCount,
      optimalDuration: preferredDuration
    };
  }

  private static async findDayMutualSlots(
    userAvailability: any[],
    friendAvailability: any[],
    userEvents: any[],
    friendEvents: any[],
    date: string,
    dayOfWeek: number,
    userTimezone: string,
    friendTimezone: string,
    duration: number,
    buffer: number
  ): Promise<MutualTimeSlot[]> {
    const slots: MutualTimeSlot[] = [];

    // Get user's availability for this day
    const userDaySlots = this.getAvailabilityForDay(userAvailability, date, dayOfWeek);
    const friendDaySlots = this.getAvailabilityForDay(friendAvailability, date, dayOfWeek);

    // Convert friend's availability to user's timezone for comparison
    const friendSlotsInUserTz = friendDaySlots.map(slot => 
      this.convertSlotToTimezone(slot, friendTimezone, userTimezone, date)
    );

    // Find overlapping time slots
    for (const userSlot of userDaySlots) {
      for (const friendSlot of friendSlotsInUserTz) {
        const overlap = this.findTimeOverlap(userSlot, friendSlot);
        if (overlap && this.isSlotViable(overlap, duration, buffer)) {
          // Check for calendar conflicts
          const hasConflicts = this.hasCalendarConflicts(
            date,
            overlap.start_time,
            overlap.end_time,
            userEvents,
            friendEvents,
            userTimezone
          );

          if (!hasConflicts) {
            const confidence = this.calculateConfidence(
              overlap,
              userSlot,
              friendSlot,
              userTimezone,
              friendTimezone,
              buffer
            );

            const reasoning = this.generateReasoning(
              overlap,
              userSlot,
              friendSlot,
              confidence
            );

            slots.push({
              date,
              startTime: overlap.start_time,
              endTime: overlap.end_time,
              confidence,
              userTimezone,
              friendTimezone,
              bufferBefore: buffer,
              bufferAfter: buffer,
              reasoning
            });
          }
        }
      }
    }

    return slots;
  }

  private static getAvailabilityForDay(availability: any[], date: string, dayOfWeek: number) {
    return availability.filter(slot => {
      // Match recurring availability for this day of week
      if (slot.is_recurring && slot.day_of_week === dayOfWeek && !slot.specific_date) {
        return true;
      }
      // Match specific date availability
      if (slot.specific_date === date) {
        return true;
      }
      return false;
    });
  }

  private static convertSlotToTimezone(slot: any, fromTz: string, toTz: string, date: string) {
    const startDateTime = TimeService.createZonedDate(date, slot.start_time, fromTz);
    const endDateTime = TimeService.createZonedDate(date, slot.end_time, fromTz);
    
    const convertedStart = toZonedTime(startDateTime, toTz);
    const convertedEnd = toZonedTime(endDateTime, toTz);

    return {
      ...slot,
      start_time: format(convertedStart, 'HH:mm'),
      end_time: format(convertedEnd, 'HH:mm')
    };
  }

  private static findTimeOverlap(slot1: any, slot2: any) {
    const start1 = this.timeToMinutes(slot1.start_time);
    const end1 = this.timeToMinutes(slot1.end_time);
    const start2 = this.timeToMinutes(slot2.start_time);
    const end2 = this.timeToMinutes(slot2.end_time);

    const overlapStart = Math.max(start1, start2);
    const overlapEnd = Math.min(end1, end2);

    if (overlapStart < overlapEnd) {
      return {
        start_time: this.minutesToTime(overlapStart),
        end_time: this.minutesToTime(overlapEnd),
        duration: overlapEnd - overlapStart
      };
    }

    return null;
  }

  private static isSlotViable(overlap: any, requiredDuration: number, buffer: number): boolean {
    const totalRequired = requiredDuration + (buffer * 2);
    return overlap.duration >= totalRequired;
  }

  private static hasCalendarConflicts(
    date: string,
    startTime: string,
    endTime: string,
    userEvents: any[],
    friendEvents: any[],
    timezone: string
  ): boolean {
    const slotStart = new Date(`${date}T${startTime}`);
    const slotEnd = new Date(`${date}T${endTime}`);

    const allEvents = [...userEvents, ...friendEvents];

    return allEvents.some(event => {
      const eventStart = new Date(event.start_time);
      const eventEnd = new Date(event.end_time);

      return (
        (slotStart >= eventStart && slotStart < eventEnd) ||
        (slotEnd > eventStart && slotEnd <= eventEnd) ||
        (slotStart <= eventStart && slotEnd >= eventEnd)
      );
    });
  }

  private static calculateConfidence(
    overlap: any,
    userSlot: any,
    friendSlot: any,
    userTz: string,
    friendTz: string,
    buffer: number
  ): number {
    let score = 0;

    // Both users prefer this time (if within preferred hours)
    const isUserPreferred = this.isPreferredTime(overlap.start_time);
    const isFriendPreferred = this.isPreferredTime(overlap.start_time);
    if (isUserPreferred && isFriendPreferred) {
      score += this.CONFIDENCE_WEIGHTS.BOTH_PREFERRED;
    }

    // Timezone convenience (favor times that work well for both timezones)
    const timezoneScore = this.calculateTimezoneConvenience(userTz, friendTz, overlap.start_time);
    score += timezoneScore * this.CONFIDENCE_WEIGHTS.TIMEZONE_CONVENIENCE;

    // Availability overlap percentage
    const overlapPercentage = overlap.duration / Math.max(
      this.timeToMinutes(userSlot.end_time) - this.timeToMinutes(userSlot.start_time),
      this.timeToMinutes(friendSlot.end_time) - this.timeToMinutes(friendSlot.start_time)
    );
    score += overlapPercentage * this.CONFIDENCE_WEIGHTS.AVAILABILITY_OVERLAP;

    // Buffer adequacy
    const bufferScore = Math.min(buffer / this.DEFAULT_BUFFER_MINUTES, 1);
    score += bufferScore * this.CONFIDENCE_WEIGHTS.BUFFER_ADEQUACY;

    return Math.min(score, 1); // Cap at 1.0
  }

  private static isPreferredTime(time: string): boolean {
    const minutes = this.timeToMinutes(time);
    // Consider 9 AM to 6 PM as preferred times
    return minutes >= 540 && minutes <= 1080; // 9:00 to 18:00
  }

  private static calculateTimezoneConvenience(userTz: string, friendTz: string, time: string): number {
    if (userTz === friendTz) return 1.0;
    
    // Simple heuristic: times between 10 AM and 4 PM are generally convenient
    const minutes = this.timeToMinutes(time);
    if (minutes >= 600 && minutes <= 960) { // 10:00 to 16:00
      return 0.8;
    }
    return 0.5;
  }

  private static generateReasoning(
    overlap: any,
    userSlot: any,
    friendSlot: any,
    confidence: number
  ): string[] {
    const reasons: string[] = [];

    if (confidence > 0.8) {
      reasons.push("Optimal time for both users");
    }

    if (this.isPreferredTime(overlap.start_time)) {
      reasons.push("Within preferred hours");
    }

    const duration = overlap.duration;
    if (duration >= 120) {
      reasons.push("Ample time available");
    } else if (duration >= 60) {
      reasons.push("Adequate time available");
    }

    if (reasons.length === 0) {
      reasons.push("Available time slot");
    }

    return reasons;
  }

  private static timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private static minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  private static async getUserTimezone(userId: string): Promise<string> {
    // This would typically fetch from user profile
    // For now, return default timezone
    return TimeService.getBrowserTimezone();
  }

  private static async getUserCalendarEvents(userId: string, startDate: string, endDate: string): Promise<any[]> {
    try {
      return await calendarIntegrationService.getLocalCalendarEvents(
        new Date(startDate),
        new Date(endDate)
      );
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      return [];
    }
  }
}
