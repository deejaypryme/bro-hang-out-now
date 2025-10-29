import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { format, isSameDay, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Hangout } from '@/types/database';

interface MonthCalendarProps {
  hangouts: Hangout[];
  selectedDate?: Date;
  onSelectDate: (date: Date | undefined) => void;
}

export const MonthCalendar: React.FC<MonthCalendarProps> = ({
  hangouts,
  selectedDate,
  onSelectDate,
}) => {
  // Get all dates that have hangouts
  const hangoutDates = hangouts.map(h => parseISO(h.scheduled_date));

  // Custom day content to show indicators for days with hangouts
  const modifiers = {
    hasHangout: (date: Date) => 
      hangoutDates.some(hangoutDate => isSameDay(date, hangoutDate)),
  };

  const modifiersClassNames = {
    hasHangout: 'relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-accent-orange after:rounded-full',
  };

  return (
    <div className="flex flex-col items-center w-full">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onSelectDate}
        modifiers={modifiers}
        modifiersClassNames={modifiersClassNames}
        className={cn("rounded-bro-lg border border-border bg-surface-light shadow-sm pointer-events-auto")}
      />
    </div>
  );
};
