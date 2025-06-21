
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

interface TimeSelectionProps {
  onTimeSelected: (date: string, time: string, timezone: string) => void;
  onBack: () => void;
  friendTimezone?: string;
  initialDate?: string;
  initialTime?: string;
}

const TimeSelection: React.FC<TimeSelectionProps> = ({ 
  onTimeSelected, 
  onBack, 
  friendTimezone,
  initialDate,
  initialTime 
}) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialDate ? new Date(initialDate) : undefined
  );
  const [selectedTime, setSelectedTime] = useState(initialTime || '');
  const [customTime, setCustomTime] = useState('');
  const [showCustomTime, setShowCustomTime] = useState(false);
  
  const userTimezone = user?.user_metadata?.timezone || TimeService.getBrowserTimezone();
  const isDifferentTimezone = friendTimezone && TimeService.areDifferentTimezones(userTimezone, friendTimezone);

  useEffect(() => {
    if (initialTime && !timeOptions.includes(initialTime)) {
      setShowCustomTime(true);
      setCustomTime(initialTime);
    }
  }, [initialTime]);

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

  const handleContinue = () => {
    if (!selectedDate) return;
    
    const finalTime = selectedTime === 'custom' ? customTime : selectedTime;
    if (!finalTime) return;

    const dateString = format(selectedDate, 'yyyy-MM-dd');
    onTimeSelected(dateString, finalTime, userTimezone);
  };

  const isValidTime = selectedTime && (selectedTime !== 'custom' || customTime);
  const canContinue = selectedDate && isValidTime;

  // Generate preview of the selected time
  const getTimePreview = () => {
    if (!selectedDate || !isValidTime) return null;
    
    const finalTime = selectedTime === 'custom' ? customTime : selectedTime;
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const selectedDateTime = TimeService.createZonedDate(dateString, finalTime, userTimezone);
    
    return (
      <div className="mt-4 p-3 bg-muted rounded-lg">
        <p className="text-sm font-medium mb-2">Selected Time:</p>
        <TimezoneAwareTime 
          date={selectedDateTime}
          userTimezone={userTimezone}
          originalTimezone={friendTimezone}
          showOriginal={isDifferentTimezone}
          formatString="EEEE, MMM d 'at' h:mm a"
          className="text-sm"
        />
        
        {isDifferentTimezone && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
            <div className="flex items-center gap-1 text-blue-700 font-medium">
              <Globe className="w-3 h-3" />
              Cross-timezone invitation
            </div>
            <p className="text-blue-600 mt-1">
              Your friend will see this time converted to their timezone ({friendTimezone})
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <CardTitle>When works for you?</CardTitle>
          </div>
          <CardDescription>
            Select a date and time that works best for your hangout
            {isDifferentTimezone && (
              <span className="block mt-1 text-blue-600">
                Times will be converted to your friend's timezone automatically
              </span>
            )}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
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

          {/* Time Preview */}
          {getTimePreview()}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onBack} className="flex-1">
              Back
            </Button>
            <Button 
              onClick={handleContinue} 
              disabled={!canContinue}
              className="flex-1"
            >
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeSelection;
