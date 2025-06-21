
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Clock, Calendar, Check, Plus, Settings } from 'lucide-react';
import { format, addDays, startOfDay } from 'date-fns';
import { useAvailableTimeSlots } from '@/hooks/useDatabase';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

export interface TimeOption {
  date: string;
  startTime: string;
  endTime: string;
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
  const { user } = useAuth();
  const [availableDays, setAvailableDays] = useState<Date[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedDateString, setSelectedDateString] = useState<string>('');

  // Fetch available time slots for the selected date
  const { data: availableTimeSlots = [], isLoading } = useAvailableTimeSlots(selectedDateString);

  useEffect(() => {
    const today = startOfDay(new Date());
    const nextSevenDays = Array.from({ length: 7 }, (_, i) => addDays(today, i));
    setAvailableDays(nextSevenDays);
    
    // Pre-select the first day if no day is selected
    if (!selectedDay && nextSevenDays.length > 0) {
      setSelectedDay(nextSevenDays[0]);
      setSelectedDateString(format(nextSevenDays[0], 'yyyy-MM-dd'));
    }
  }, []);

  useEffect(() => {
    if (selectedDay) {
      setSelectedDateString(format(selectedDay, 'yyyy-MM-dd'));
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

  const getDayDisplayName = (date: Date) => {
    const today = startOfDay(new Date());
    const tomorrow = addDays(today, 1);
    
    if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
      return 'Today';
    } else if (format(date, 'yyyy-MM-dd') === format(tomorrow, 'yyyy-MM-dd')) {
      return 'Tomorrow';
    } else {
      return format(date, 'EEE');
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Please log in to view your availability</p>
      </div>
    );
  }

  return (
    <div>
      {/* Calendar Day Selection */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Select a Day</h3>
          <Link to="/settings/availability">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Availability Settings
            </Button>
          </Link>
        </div>
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {availableDays.map((day) => (
            <Button
              key={day.toISOString()}
              variant="outline"
              className={`flex flex-col items-center justify-center min-w-20 h-20 rounded-lg ${
                selectedDay?.toISOString() === day.toISOString() ? 'bg-blue-500 text-white' : 'text-gray-700'
              }`}
              onClick={() => setSelectedDay(day)}
            >
              <Calendar className="w-6 h-6 mb-1" />
              <span className="text-xs">{getDayDisplayName(day)}</span>
              <span className="font-semibold">{format(day, 'd')}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Time Slot Selection */}
      {selectedDay && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Available Time Slots</h3>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Clock className="w-6 h-6 mr-2 animate-spin" />
              <span>Loading available times...</span>
            </div>
          ) : availableTimeSlots.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {availableTimeSlots.map((slot, index) => (
                <Card
                  key={`${slot.date}-${slot.startTime}-${index}`}
                  className={`flex items-center justify-center p-3 rounded-lg cursor-pointer transition-colors duration-200 relative ${
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
                    <span className="text-sm font-medium">{slot.startTime} - {slot.endTime}</span>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600 mb-2">No availability set for {format(selectedDay, 'EEEE, MMMM d')}</p>
              <p className="text-sm text-gray-500 mb-4">
                Set your availability to see available time slots for hangouts.
              </p>
              <Link to="/settings/availability">
                <Button className="bg-blue-500 hover:bg-blue-600">
                  <Settings className="w-4 h-4 mr-2" />
                  Set Availability
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {selectedOptions.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Selected Time Options:</h4>
          <div className="space-y-1">
            {selectedOptions.map((option, index) => (
              <div key={index} className="text-sm text-blue-800">
                {format(new Date(option.date), 'EEEE, MMMM d')} at {option.startTime} - {option.endTime}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSelection;
