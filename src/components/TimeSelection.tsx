
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { CalendarIcon, Clock, Globe } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '@/lib/utils';
import { TimeService } from '@/services/timeService';
import { useAuth } from '@/hooks/useAuth';
import TimezoneAwareTime from './TimezoneAwareTime';

export interface TimeOption {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  timezone: string;
}

interface TimeSelectionProps {
  selectedOptions: TimeOption[];
  onUpdateOptions: (options: TimeOption[]) => void;
  onNext?: () => void;
  friendTimezone?: string;
}

const TimeSelection: React.FC<TimeSelectionProps> = ({ 
  selectedOptions,
  onUpdateOptions,
  onNext,
  friendTimezone
}) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [customTime, setCustomTime] = useState('');
  const [showCustomTime, setShowCustomTime] = useState(false);
  
  const userTimezone = user?.user_metadata?.timezone || TimeService.getBrowserTimezone();
  const isDifferentTimezone = friendTimezone && TimeService.areDifferentTimezones(userTimezone, friendTimezone);

  const timeOptions = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
    '21:00', '21:30', '22:00'
  ];

  const today = startOfDay(new Date());
  const maxDate = addDays(today, 30);

  const handleDateSelect = (date: Date | undefined) => {
    if (date && !isBefore(date, today)) {
      setSelectedDate(date);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (time !== 'custom') {
      setShowCustomTime(false);
      setCustomTime('');
    } else {
      setShowCustomTime(true);
    }
  };

  const handleCustomTimeChange = (time: string) => {
    setCustomTime(time);
    setSelectedTime('custom');
  };

  const handleAddTimeOption = () => {
    if (!selectedDate) return;
    
    const finalTime = selectedTime === 'custom' ? customTime : selectedTime;
    if (!finalTime) return;

    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const endTime = finalTime; // For simplicity, using same time as end time
    
    const newOption: TimeOption = {
      id: `${dateString}-${finalTime}-${Date.now()}`,
      date: dateString,
      startTime: finalTime,
      endTime: endTime,
      timezone: userTimezone
    };

    onUpdateOptions([...selectedOptions, newOption]);
    
    // Reset form
    setSelectedDate(undefined);
    setSelectedTime('');
    setCustomTime('');
    setShowCustomTime(false);
  };

  const handleRemoveOption = (optionId: string) => {
    onUpdateOptions(selectedOptions.filter(option => option.id !== optionId));
  };

  const isValidTime = selectedTime && (selectedTime !== 'custom' || customTime);
  const canAddOption = selectedDate && isValidTime;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <CardTitle>When works for you?</CardTitle>
          </div>
          <CardDescription>
            Select multiple time options for your hangout ({4 - selectedOptions.length} more needed)
            {isDifferentTimezone && (
              <span className="block mt-1 text-blue-600">
                Times will be converted to your friend's timezone automatically
              </span>
            )}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Selected Options */}
          {selectedOptions.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Times ({selectedOptions.length}/4)</Label>
              <div className="space-y-2">
                {selectedOptions.map((option) => (
                  <div key={option.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">
                        {format(new Date(option.date), 'EEEE, MMM d')} at {format(new Date(`2024-01-01T${option.startTime}`), 'h:mm a')}
                      </p>
                      {isDifferentTimezone && (
                        <p className="text-sm text-muted-foreground">
                          In {friendTimezone}: {TimeService.getTimeWithTimezone(
                            TimeService.createZonedDate(option.date, option.startTime, userTimezone), 
                            friendTimezone!
                          )}
                        </p>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemoveOption(option.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Time Option */}
          {selectedOptions.length < 4 && (
            <>
              {/* Timezone indicator */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="w-4 h-4" />
                <span>Your timezone: {TimeService.getTimezoneAbbreviation(userTimezone)}</span>
                {isDifferentTimezone && (
                  <>
                    <span>•</span>
                    <span>Friend's timezone: {TimeService.getTimezoneAbbreviation(friendTimezone!)}</span>
                  </>
                )}
              </div>

              {/* Date Selection */}
              <div className="space-y-2">
                <Label>Select Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      disabled={(date) => isBefore(date, today) || date > maxDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Selection */}
              <div className="space-y-2">
                <Label>Select Time</Label>
                <Select value={selectedTime} onValueChange={handleTimeSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {format(new Date(`2024-01-01T${time}`), 'h:mm a')}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom time...</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Time Input */}
              {showCustomTime && (
                <div className="space-y-2">
                  <Label>Custom Time</Label>
                  <Input
                    type="time"
                    value={customTime}
                    onChange={(e) => handleCustomTimeChange(e.target.value)}
                    className="w-full"
                  />
                </div>
              )}

              <Button 
                onClick={handleAddTimeOption} 
                disabled={!canAddOption}
                className="w-full"
              >
                Add Time Option
              </Button>
            </>
          )}

          {/* Continue Button */}
          {selectedOptions.length >= 1 && onNext && (
            <div className="pt-4">
              <Button 
                onClick={onNext} 
                className="w-full"
                variant={selectedOptions.length >= 4 ? "default" : "outline"}
              >
                {selectedOptions.length >= 4 ? "Continue" : `Continue with ${selectedOptions.length} option${selectedOptions.length > 1 ? 's' : ''}`}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeSelection;
