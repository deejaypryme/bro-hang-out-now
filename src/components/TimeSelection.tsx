import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Clock, Calendar, Check, Plus } from 'lucide-react';
import { format, addDays, startOfDay } from 'date-fns';

export interface TimeOption {
  date: string;
  startTime: string;
  endTime: string; // Add endTime property
}

interface TimeSelectionProps {
  selectedOptions: TimeOption[];
  onUpdateOptions: (options: TimeOption[]) => void;
  onNext?: () => void;
}

const TimeSelection: React.FC<TimeSelectionProps> = ({
  selectedOptions,
  onUpdateOptions,
  onNext
}) => {
  const [availableDays, setAvailableDays] = useState<Date[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeOption[]>([]);

  useEffect(() => {
    const today = startOfDay(new Date());
    const nextFourDays = Array.from({ length: 4 }, (_, i) => addDays(today, i));
    setAvailableDays(nextFourDays);
    
    // Pre-populate time slots for the first day if no day is selected
    if (!selectedDay && nextFourDays.length > 0) {
      setSelectedDay(nextFourDays[0]);
    }
  }, []);

  useEffect(() => {
    if (selectedDay) {
      const dateString = format(selectedDay, 'yyyy-MM-dd');
      const newTimeSlots: TimeOption[] = [
        { date: dateString, startTime: '10:00', endTime: '11:00' },
        { date: dateString, startTime: '12:00', endTime: '13:00' },
        { date: dateString, startTime: '14:00', endTime: '15:00' },
        { date: dateString, startTime: '16:00', endTime: '17:00' },
      ];
      setTimeSlots(newTimeSlots);
    }
  }, [selectedDay]);

  const toggleTimeSlot = (slot: TimeOption) => {
    const isSelected = selectedOptions.some(
      (option) => option.date === slot.date && option.startTime === slot.startTime
    );

    if (isSelected) {
      const updatedOptions = selectedOptions.filter(
        (option) => !(option.date === slot.date && option.startTime === slot.startTime)
      );
      onUpdateOptions(updatedOptions);
    } else {
      const updatedOptions = [...selectedOptions, slot];
      onUpdateOptions(updatedOptions);
    }
  };

  const isTimeSlotSelected = (slot: TimeOption) => {
    return selectedOptions.some(
      (option) => option.date === slot.date && option.startTime === slot.startTime
    );
  };

  return (
    <div>
      {/* Calendar Day Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Select a Day</h3>
        <div className="flex space-x-2 overflow-x-auto">
          {availableDays.map((day) => (
            <Button
              key={day.toISOString()}
              variant="outline"
              className={`flex flex-col items-center justify-center w-20 h-20 rounded-lg ${
                selectedDay?.toISOString() === day.toISOString() ? 'bg-blue-500 text-white' : 'text-gray-700'
              }`}
              onClick={() => setSelectedDay(day)}
            >
              <Calendar className="w-6 h-6 mb-1" />
              <span>{format(day, 'EEE')}</span>
              <span>{format(day, 'd')}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Time Slot Selection */}
      {selectedDay && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Select Time Slots</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {timeSlots.map((slot) => (
              <Card
                key={`${slot.date}-${slot.startTime}`}
                className={`flex items-center justify-center p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                  isTimeSlotSelected(slot)
                    ? 'bg-green-100 border-green-500 hover:bg-green-200'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => toggleTimeSlot(slot)}
              >
                {isTimeSlotSelected(slot) ? (
                  <Check className="w-4 h-4 text-green-600 absolute top-2 right-2" />
                ) : (
                  <Plus className="w-4 h-4 text-gray-400 absolute top-2 right-2" />
                )}
                <div className="flex flex-col items-center">
                  <Clock className="w-5 h-5 mb-1 text-gray-600" />
                  <span className="text-sm">{slot.startTime} - {slot.endTime}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSelection;
