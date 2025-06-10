
import React from 'react';
import { format, isToday, isTomorrow } from 'date-fns';
import { type TimeSlot } from '../data/mockData';

interface TimeSelectionProps {
  timeSlots: TimeSlot[];
  selectedTimes: TimeSlot[];
  onSelectTime: (timeSlot: TimeSlot) => void;
}

const TimeSelection: React.FC<TimeSelectionProps> = ({
  timeSlots,
  selectedTimes,
  onSelectTime
}) => {
  const groupedSlots = timeSlots.reduce((groups, slot) => {
    const dateKey = format(slot.date, 'yyyy-MM-dd');
    if (!groups[dateKey]) {
      groups[dateKey] = { date: slot.date, slots: [] };
    }
    groups[dateKey].slots.push(slot);
    return groups;
  }, {} as Record<string, { date: Date; slots: TimeSlot[] }>);

  const getDayLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEEE, MMM d');
  };

  const isSelected = (slot: TimeSlot) => {
    return selectedTimes.some(selected => 
      selected.date.getTime() === slot.date.getTime() && 
      selected.startTime === slot.startTime
    );
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-primary">When works for you?</h3>
      <p className="text-sm text-text-secondary">Select multiple times to give options</p>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {Object.values(groupedSlots).map(({ date, slots }) => (
          <div key={format(date, 'yyyy-MM-dd')} className="space-y-2">
            <h4 className="font-medium text-primary text-sm">{getDayLabel(date)}</h4>
            
            <div className="grid grid-cols-2 gap-2">
              {slots.map((slot, index) => {
                const selected = isSelected(slot);
                const unavailable = !slot.available || slot.busy;
                
                return (
                  <button
                    key={index}
                    onClick={() => !unavailable && onSelectTime(slot)}
                    disabled={unavailable}
                    className={`
                      p-3 rounded-lg text-sm font-medium transition-all duration-150
                      ${selected
                        ? 'bg-primary text-white shadow-md'
                        : unavailable
                        ? 'bg-bg-tertiary text-text-muted cursor-not-allowed opacity-50'
                        : 'bg-bg-secondary text-primary hover:bg-primary/10 hover:scale-[1.02] border border-custom hover:border-primary/30'
                      }
                    `}
                  >
                    <div>{slot.startTime}</div>
                    <div className="text-xs opacity-75">
                      {slot.busy ? 'Busy' : 'Available'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      {selectedTimes.length > 0 && (
        <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
          <div className="text-sm font-medium text-primary mb-1">
            Selected times ({selectedTimes.length}):
          </div>
          <div className="text-xs text-text-secondary">
            {selectedTimes.map((slot, index) => (
              <span key={index}>
                {getDayLabel(slot.date)} at {slot.startTime}
                {index < selectedTimes.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSelection;
