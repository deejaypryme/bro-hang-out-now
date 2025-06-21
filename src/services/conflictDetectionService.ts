
import { supabase } from "@/integrations/supabase/client";
import { addMinutes, parseISO, format, isSameDay } from 'date-fns';
import type { TimeSlot } from '@/types/database';
import type { TimeOption } from '@/components/TimeSelection';

export interface ConflictDetails {
  id: string;
  type: 'calendar' | 'hangout' | 'availability';
  title: string;
  startTime: Date;
  endTime: Date;
  description?: string;
  canReschedule?: boolean;
}

export interface ConflictDetectionResult {
  hasConflicts: boolean;
  conflicts: ConflictDetails[];
  alternativeTimes: TimeOption[];
  severity: 'low' | 'medium' | 'high';
}

export interface ConflictCheckRequest {
  userId: string;
  friendId: string;
  proposedDate: string;
  proposedTime: string;
  duration: number;
}

export const conflictDetectionService = {
  // Main conflict detection function
  async detectConflicts(request: ConflictCheckRequest): Promise<ConflictDetectionResult> {
    const { userId, friendId, proposedDate, proposedTime, duration } = request;
    
    const proposedStart = new Date(`${proposedDate}T${proposedTime}`);
    const proposedEnd = addMinutes(proposedStart, duration);

    // Check all types of conflicts
    const [userConflicts, friendConflicts] = await Promise.all([
      this.getUserConflicts(userId, proposedStart, proposedEnd),
      this.getUserConflicts(friendId, proposedStart, proposedEnd)
    ]);

    const allConflicts = [...userConflicts, ...friendConflicts];
    const hasConflicts = allConflicts.length > 0;

    // Generate alternatives if conflicts exist
    let alternativeTimes: TimeOption[] = [];
    if (hasConflicts) {
      alternativeTimes = await this.generateAlternatives(userId, friendId, proposedDate, duration);
    }

    // Determine severity
    const severity = this.calculateSeverity(allConflicts);

    return {
      hasConflicts,
      conflicts: allConflicts,
      alternativeTimes,
      severity
    };
  },

  // Get conflicts for a specific user
  async getUserConflicts(userId: string, startTime: Date, endTime: Date): Promise<ConflictDetails[]> {
    const conflicts: ConflictDetails[] = [];

    // Check calendar events
    const calendarConflicts = await this.getCalendarConflicts(userId, startTime, endTime);
    conflicts.push(...calendarConflicts);

    // Check existing hangouts
    const hangoutConflicts = await this.getHangoutConflicts(userId, startTime, endTime);
    conflicts.push(...hangoutConflicts);

    // Check availability slots
    const availabilityConflicts = await this.getAvailabilityConflicts(userId, startTime, endTime);
    conflicts.push(...availabilityConflicts);

    return conflicts;
  },

  // Check calendar events for conflicts
  async getCalendarConflicts(userId: string, startTime: Date, endTime: Date): Promise<ConflictDetails[]> {
    const dateStr = format(startTime, 'yyyy-MM-dd');
    
    const { data: events, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', format(startTime, 'yyyy-MM-dd HH:mm:ss'))
      .lte('end_time', format(endTime, 'yyyy-MM-dd HH:mm:ss'));

    if (error) {
      console.error('Error fetching calendar events:', error);
      return [];
    }

    return (events || []).map(event => ({
      id: `calendar-${event.id}`,
      type: 'calendar' as const,
      title: event.title,
      startTime: new Date(event.start_time),
      endTime: new Date(event.end_time),
      description: event.description || `Calendar event: ${event.title}`,
      canReschedule: false
    }));
  },

  // Check existing hangouts for conflicts
  async getHangoutConflicts(userId: string, startTime: Date, endTime: Date): Promise<ConflictDetails[]> {
    const dateStr = format(startTime, 'yyyy-MM-dd');
    
    const { data: hangouts, error } = await supabase
      .from('hangouts')
      .select(`
        *,
        friend_profile:profiles!hangouts_friend_id_fkey(full_name),
        organizer_profile:profiles!hangouts_organizer_id_fkey(full_name)
      `)
      .or(`organizer_id.eq.${userId},friend_id.eq.${userId}`)
      .eq('scheduled_date', dateStr)
      .in('status', ['pending', 'confirmed']);

    if (error) {
      console.error('Error fetching hangouts:', error);
      return [];
    }

    return (hangouts || []).filter(hangout => {
      const hangoutStart = new Date(`${hangout.scheduled_date}T${hangout.scheduled_time}`);
      const hangoutEnd = addMinutes(hangoutStart, hangout.duration_minutes || 120);
      
      return (hangoutStart < endTime && hangoutEnd > startTime);
    }).map(hangout => {
      // Handle the case where profile data might not be loaded properly
      let friendName = 'Unknown';
      
      // Check if user is organizer and friend profile exists
      if (hangout.organizer_id === userId) {
        const friendProfile = hangout.friend_profile;
        if (friendProfile && typeof friendProfile === 'object' && 'full_name' in friendProfile && friendProfile.full_name) {
          friendName = friendProfile.full_name;
        }
      } else {
        // User is the friend, so get organizer name
        const organizerProfile = hangout.organizer_profile;
        if (organizerProfile && typeof organizerProfile === 'object' && 'full_name' in organizerProfile && organizerProfile.full_name) {
          friendName = organizerProfile.full_name;
        }
      }
      
      return {
        id: `hangout-${hangout.id}`,
        type: 'hangout' as const,
        title: `${hangout.activity_name} with ${friendName}`,
        startTime: new Date(`${hangout.scheduled_date}T${hangout.scheduled_time}`),
        endTime: addMinutes(new Date(`${hangout.scheduled_date}T${hangout.scheduled_time}`), hangout.duration_minutes || 120),
        description: `Existing hangout: ${hangout.activity_name}`,
        canReschedule: hangout.organizer_id === userId
      };
    });
  },

  // Check availability exceptions
  async getAvailabilityConflicts(userId: string, startTime: Date, endTime: Date): Promise<ConflictDetails[]> {
    const dateStr = format(startTime, 'yyyy-MM-dd');
    
    const { data: exceptions, error } = await supabase
      .from('user_availability_exceptions')
      .select('*')
      .eq('user_id', userId)
      .eq('exception_date', dateStr);

    if (error) {
      console.error('Error fetching availability exceptions:', error);
      return [];
    }

    return (exceptions || []).filter(exception => {
      const exceptionStart = new Date(`${dateStr}T${exception.start_time}`);
      const exceptionEnd = new Date(`${dateStr}T${exception.end_time}`);
      
      return (exceptionStart < endTime && exceptionEnd > startTime);
    }).map(exception => ({
      id: `availability-${exception.id}`,
      type: 'availability' as const,
      title: 'Unavailable',
      startTime: new Date(`${dateStr}T${exception.start_time}`),
      endTime: new Date(`${dateStr}T${exception.end_time}`),
      description: exception.reason || 'User marked as unavailable',
      canReschedule: false
    }));
  },

  // Generate alternative time suggestions
  async generateAlternatives(userId: string, friendId: string, originalDate: string, duration: number): Promise<TimeOption[]> {
    const alternatives: TimeOption[] = [];
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Try same day with different times
    const sameDayAlternatives = await this.findAlternativesOnDate(userId, friendId, originalDate, duration);
    alternatives.push(...sameDayAlternatives.slice(0, 2));

    // Try next few days
    for (let i = 1; i <= 3 && alternatives.length < 5; i++) {
      const nextDate = new Date(originalDate);
      nextDate.setDate(nextDate.getDate() + i);
      const nextDateStr = format(nextDate, 'yyyy-MM-dd');
      
      const nextDayAlternatives = await this.findAlternativesOnDate(userId, friendId, nextDateStr, duration);
      alternatives.push(...nextDayAlternatives.slice(0, 2));
    }

    return alternatives.slice(0, 5);
  },

  // Find alternatives on a specific date
  async findAlternativesOnDate(userId: string, friendId: string, date: string, duration: number): Promise<TimeOption[]> {
    const alternatives: TimeOption[] = [];
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Common time slots to check
    const timeSlots = [
      '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
      '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
    ];

    for (const time of timeSlots) {
      const conflicts = await this.detectConflicts({
        userId,
        friendId,
        proposedDate: date,
        proposedTime: time,
        duration
      });

      if (!conflicts.hasConflicts) {
        alternatives.push({
          id: `${date}-${time}-alt`,
          date,
          startTime: time,
          endTime: format(addMinutes(new Date(`2024-01-01T${time}`), duration), 'HH:mm'),
          timezone
        });

        if (alternatives.length >= 3) break;
      }
    }

    return alternatives;
  },

  // Calculate conflict severity
  calculateSeverity(conflicts: ConflictDetails[]): 'low' | 'medium' | 'high' {
    if (conflicts.length === 0) return 'low';
    
    const hasHardConflicts = conflicts.some(c => c.type === 'calendar' || c.type === 'hangout');
    const conflictCount = conflicts.length;

    if (hasHardConflicts && conflictCount > 2) return 'high';
    if (hasHardConflicts || conflictCount > 1) return 'medium';
    return 'low';
  },

  // Check if a specific time slot is available
  async isTimeSlotAvailable(userId: string, date: string, startTime: string, duration: number): Promise<boolean> {
    const conflicts = await this.detectConflicts({
      userId,
      friendId: userId, // Just check for user conflicts
      proposedDate: date,
      proposedTime: startTime,
      duration
    });

    return !conflicts.hasConflicts;
  }
};
