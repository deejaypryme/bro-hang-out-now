
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { TimeService } from '@/services/timeService';
import { Clock } from 'lucide-react';

interface TimezoneSelectorProps {
  value: string;
  onChange: (timezone: string) => void;
  className?: string;
}

const TimezoneSelector: React.FC<TimezoneSelectorProps> = ({ 
  value, 
  onChange, 
  className 
}) => {
  const timezones = TimeService.getCommonTimezones();
  const browserTimezone = TimeService.getBrowserTimezone();

  return (
    <div className={className}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <SelectValue placeholder="Select timezone" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {/* Browser timezone first if different from selected */}
          {browserTimezone !== value && (
            <>
              <SelectItem value={browserTimezone}>
                <div className="flex justify-between items-center w-full">
                  <span>{TimeService.getCommonTimezones().find(tz => tz.timezone === browserTimezone)?.displayName || browserTimezone}</span>
                  <span className="text-xs text-muted-foreground ml-4">
                    {TimeService.getTimezoneOffset(browserTimezone)} (Auto-detected)
                  </span>
                </div>
              </SelectItem>
              <div className="border-t my-1" />
            </>
          )}
          
          {timezones.map((tz) => (
            <SelectItem key={tz.timezone} value={tz.timezone}>
              <div className="flex justify-between items-center w-full">
                <span>{tz.displayName}</span>
                <span className="text-xs text-muted-foreground ml-4">
                  {tz.offset} {tz.abbreviation}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TimezoneSelector;
