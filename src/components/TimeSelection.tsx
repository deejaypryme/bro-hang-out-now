
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
    <div className="space-y-6 animate-slide-up">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-gray-900">When works for you?</h3>
        <p className="text-sm text-gray-600">Select multiple times to give options</p>
      </div>
      
      <div className="space-y-6 max-h-96 overflow-y-auto">
        {Object.values(groupedSlots).map(({ date, slots }) => (
          <div key={format(date, 'yyyy-MM-dd')} className="space-y-3">
            <h4 className="text-base font-semibold text-gray-900">{getDayLabel(date)}</h4>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {slots.map((slot, index) => {
                const selected = isSelected(slot);
                const unavailable = !slot.available || slot.busy;
                
                return (
                  <button
                    key={index}
                    onClick={() => !unavailable && onSelectTime(slot)}
                    disabled={unavailable}
                    className={`
                      min-h-[60px] p-3 rounded-xl text-center transition-all duration-200 font-medium border-2
                      ${selected
                        ? 'bg-blue-500 text-white shadow-md scale-105 border-blue-500'
                        : unavailable
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50 border-gray-200'
                        : 'bg-white text-gray-900 border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:scale-[1.02]'
                      }
                    `}
                  >
                    <div className="text-base font-semibold">{slot.startTime}</div>
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
        <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
          <div className="text-base font-semibold text-gray-900 mb-2">
            Selected times ({selectedTimes.length}):
          </div>
          <div className="text-xs text-gray-600">
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
