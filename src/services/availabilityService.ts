
import { supabase } from "@/integrations/supabase/client";

export interface UserAvailability {
  id: string;
  user_id: string;
  day_of_week: number; // 0=Sunday, 6=Saturday
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  specific_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AvailabilityException {
  id: string;
  user_id: string;
  exception_date: string;
  start_time: string;
  end_time: string;
  reason?: string;
  created_at: string;
}

export interface CreateAvailabilitySlot {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_recurring?: boolean;
  specific_date?: string;
}

export interface CreateException {
  exception_date: string;
  start_time: string;
  end_time: string;
  reason?: string;
}

export const availabilityService = {
  // Get user's availability for a specific date range
  async getUserAvailability(userId: string, startDate?: string, endDate?: string): Promise<UserAvailability[]> {
    let query = supabase
      .from('user_availability')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    if (startDate && endDate) {
      query = query.or(`specific_date.gte.${startDate},specific_date.lte.${endDate},specific_date.is.null`);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  },

  // Create availability slot
  async createAvailabilitySlot(userId: string, slot: CreateAvailabilitySlot): Promise<UserAvailability> {
    const { data, error } = await supabase
      .from('user_availability')
      .insert({
        user_id: userId,
        ...slot
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update availability slot
  async updateAvailabilitySlot(slotId: string, updates: Partial<CreateAvailabilitySlot>): Promise<UserAvailability> {
    const { data, error } = await supabase
      .from('user_availability')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', slotId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete availability slot
  async deleteAvailabilitySlot(slotId: string): Promise<void> {
    const { error } = await supabase
      .from('user_availability')
      .delete()
      .eq('id', slotId);

    if (error) throw error;
  },

  // Get availability exceptions
  async getAvailabilityExceptions(userId: string, startDate?: string, endDate?: string): Promise<AvailabilityException[]> {
    let query = supabase
      .from('user_availability_exceptions')
      .select('*')
      .eq('user_id', userId)
      .order('exception_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (startDate) {
      query = query.gte('exception_date', startDate);
    }
    if (endDate) {
      query = query.lte('exception_date', endDate);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  },

  // Create availability exception
  async createAvailabilityException(userId: string, exception: CreateException): Promise<AvailabilityException> {
    const { data, error } = await supabase
      .from('user_availability_exceptions')
      .insert({
        user_id: userId,
        ...exception
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete availability exception
  async deleteAvailabilityException(exceptionId: string): Promise<void> {
    const { error } = await supabase
      .from('user_availability_exceptions')
      .delete()
      .eq('id', exceptionId);

    if (error) throw error;
  },

  // Generate available time slots for a specific date based on user's availability
  async getAvailableTimeSlotsForDate(userId: string, date: string): Promise<{ date: string; startTime: string; endTime: string }[]> {
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();

    // Get recurring availability for this day of week
    const { data: availability, error: availError } = await supabase
      .from('user_availability')
      .select('*')
      .eq('user_id', userId)
      .eq('day_of_week', dayOfWeek)
      .eq('is_recurring', true)
      .eq('is_active', true);

    if (availError) throw availError;

    // Get specific date availability
    const { data: specificAvailability, error: specificError } = await supabase
      .from('user_availability')
      .select('*')
      .eq('user_id', userId)
      .eq('specific_date', date)
      .eq('is_active', true);

    if (specificError) throw specificError;

    // Get exceptions for this date
    const { data: exceptions, error: exceptionsError } = await supabase
      .from('user_availability_exceptions')
      .select('*')
      .eq('user_id', userId)
      .eq('exception_date', date);

    if (exceptionsError) throw exceptionsError;

    // Combine availability sources
    const allAvailability = [...(availability || []), ...(specificAvailability || [])];
    
    // Generate time slots (in 1-hour increments for now)
    const timeSlots: { date: string; startTime: string; endTime: string }[] = [];

    allAvailability.forEach(slot => {
      const startHour = parseInt(slot.start_time.split(':')[0]);
      const endHour = parseInt(slot.end_time.split(':')[0]);

      for (let hour = startHour; hour < endHour; hour++) {
        const startTime = `${hour.toString().padStart(2, '0')}:00`;
        const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;

        // Check if this time slot conflicts with any exceptions
        const hasConflict = (exceptions || []).some(exception => {
          const exceptionStart = exception.start_time;
          const exceptionEnd = exception.end_time;
          return startTime >= exceptionStart && startTime < exceptionEnd;
        });

        if (!hasConflict) {
          timeSlots.push({
            date,
            startTime,
            endTime
          });
        }
      }
    });

    return timeSlots;
  }
};
