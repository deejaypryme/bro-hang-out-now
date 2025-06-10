
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
    <div className="space-lg animate-slide-up">
      <div className="space-sm">
        <h3 className="heading-3 text-primary">When works for you?</h3>
        <p className="body text-secondary">Select multiple times to give options</p>
      </div>
      
      <div className="space-md max-h-96 overflow-y-auto">
        {Object.values(groupedSlots).map(({ date, slots }) => (
          <div key={format(date, 'yyyy-MM-dd')} className="space-sm">
            <h4 className="body-large font-semibold text-primary mb-sm">{getDayLabel(date)}</h4>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-sm">
              {slots.map((slot, index) => {
                const selected = isSelected(slot);
                const unavailable = !slot.available || slot.busy;
                
                return (
                  <button
                    key={index}
                    onClick={() => !unavailable && onSelectTime(slot)}
                    disabled={unavailable}
                    className={`
                      touch-target p-sm rounded-xl text-center transition-all duration-200 font-medium
                      ${selected
                        ? 'selected bg-primary text-white shadow-custom-md scale-105'
                        : unavailable
                        ? 'bg-bg-tertiary text-muted cursor-not-allowed opacity-50'
                        : 'card-interactive bg-bg-primary text-primary border border-default hover:border-primary/50 hover:bg-primary/5'
                      }
                    `}
                  >
                    <div className="body-large font-semibold">{slot.startTime}</div>
                    <div className="caption text-current opacity-75">
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
        <div className="card-elevated p-sm bg-primary/5 border-primary/20">
          <div className="body-large font-semibold text-primary mb-xs">
            Selected times ({selectedTimes.length}):
          </div>
          <div className="caption text-secondary">
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
