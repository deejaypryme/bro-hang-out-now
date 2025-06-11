
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { CalendarIcon, Clock, X, Calendar as CalendarViewIcon } from 'lucide-react';

export interface TimeOption {
  id: string;
  date: Date;
  startTime: string;
  duration: number; // in hours
}

interface TimeSelectionProps {
  selectedOptions: TimeOption[];
  onUpdateOptions: (options: TimeOption[]) => void;
}

const TimeSelection: React.FC<TimeSelectionProps> = ({
  selectedOptions,
  onUpdateOptions
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedStartTime, setSelectedStartTime] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<number>(2);
  const [viewMode, setViewMode] = useState<'week' | 'calendar'>('week');

  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
    '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM',
    '9:00 PM', '10:00 PM'
  ];

  const durations = [
    { value: 1, label: '1 hour' },
    { value: 2, label: '2 hours' },
    { value: 3, label: '3 hours' },
    { value: 4, label: '4+ hours' }
  ];

  // Generate the current week starting from today
  const generateWeekDays = () => {
    const today = new Date();
    const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 0 }); // Start on Sunday
    return Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i));
  };

  const weekDays = generateWeekDays();

  const addTimeOption = () => {
    if (!selectedDate || !selectedStartTime) return;
    
    const newOption: TimeOption = {
      id: `${selectedDate.getTime()}-${selectedStartTime}`,
      date: selectedDate,
      startTime: selectedStartTime,
      duration: selectedDuration
    };

    if (selectedOptions.length < 4) {
      onUpdateOptions([...selectedOptions, newOption]);
      setSelectedStartTime('');
    }
  };

  const removeTimeOption = (id: string) => {
    onUpdateOptions(selectedOptions.filter(option => option.id !== id));
  };

  const canAddOption = selectedDate && selectedStartTime && selectedOptions.length < 4;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-gray-900">When are you free?</h3>
        <p className="text-sm text-gray-600">Choose up to 4 time options to give your friend</p>
      </div>
      
      {/* View Mode Toggle */}
      <div className="flex items-center gap-2">
        <Button
          variant={viewMode === 'week' ? 'default' : 'outline'}
          onClick={() => setViewMode('week')}
          className="text-sm"
        >
          This Week
        </Button>
        <Button
          variant={viewMode === 'calendar' ? 'default' : 'outline'}
          onClick={() => setViewMode('calendar')}
          className="text-sm flex items-center gap-2"
        >
          <CalendarViewIcon className="w-4 h-4" />
          Full Calendar
        </Button>
      </div>

      {/* Date Selection */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-gray-700">Pick a date</label>
        
        {viewMode === 'week' ? (
          // Week View - Calendly Style
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Week Header */}
            <div className="grid grid-cols-7 border-b border-gray-200">
              {weekDays.map((day) => (
                <div key={`header-${day.toISOString()}`} className="p-3 text-center border-r border-gray-200 last:border-r-0">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {format(day, 'EEE')}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Week Days */}
            <div className="grid grid-cols-7">
              {weekDays.map((day) => {
                const isToday = isSameDay(day, new Date());
                const isPast = day < new Date() && !isToday;
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => !isPast && setSelectedDate(day)}
                    disabled={isPast}
                    className={`
                      p-4 text-center border-r border-gray-200 last:border-r-0 transition-all duration-200 min-h-[70px] flex items-center justify-center relative
                      ${isPast 
                        ? 'bg-gray-50 text-gray-300 cursor-not-allowed' 
                        : isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-900 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className={`
                      text-2xl font-semibold
                      ${isToday && !isSelected ? 'text-blue-600' : ''}
                    `}>
                      {format(day, 'd')}
                    </div>
                    
                    {/* Today indicator */}
                    {isToday && !isSelected && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          // Calendar View
          <div className="border rounded-lg p-3 bg-white">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date()}
              className="rounded-md"
            />
          </div>
        )}
      </div>

      {/* Time and Duration Selection */}
      {selectedDate && (
        <div className="space-y-4 relative z-10">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Start time</label>
              <Select value={selectedStartTime} onValueChange={setSelectedStartTime}>
                <SelectTrigger className="bg-white border border-gray-300">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time} className="bg-white hover:bg-gray-100">
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Duration</label>
              <Select value={selectedDuration.toString()} onValueChange={(value) => setSelectedDuration(Number(value))}>
                <SelectTrigger className="bg-white border border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                  {durations.map((duration) => (
                    <SelectItem key={duration.value} value={duration.value.toString()} className="bg-white hover:bg-gray-100">
                      {duration.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={addTimeOption}
            disabled={!canAddOption}
            className="w-full"
          >
            Add Time Option ({selectedOptions.length}/4)
          </Button>
        </div>
      )}

      {/* Selected Options */}
      {selectedOptions.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-lg font-medium text-gray-900">Your time options:</h4>
          <div className="space-y-2">
            {selectedOptions.map((option) => (
              <div key={option.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {format(option.date, 'EEEE, MMM d')}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {option.startTime} • {option.duration} hour{option.duration > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTimeOption(option.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSelection;
