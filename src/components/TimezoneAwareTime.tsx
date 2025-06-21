
import React from 'react';
import { format } from 'date-fns';
import { TimeService } from '@/services/timeService';
import { Clock, Globe } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface TimezoneAwareTimeProps {
  date: Date;
  userTimezone: string;
  originalTimezone?: string;
  showTimezone?: boolean;
  showOriginal?: boolean;
  formatString?: string;
  className?: string;
}

const TimezoneAwareTime: React.FC<TimezoneAwareTimeProps> = ({
  date,
  userTimezone,
  originalTimezone,
  showTimezone = true,
  showOriginal = false,
  formatString = 'MMM d, h:mm a',
  className
}) => {
  const userTime = TimeService.formatInTimezone(date, userTimezone, formatString);
  const userTimezoneName = TimeService.getTimezoneAbbreviation(userTimezone);
  
  const isDifferentTimezone = originalTimezone && TimeService.areDifferentTimezones(originalTimezone, userTimezone);
  
  const originalTime = originalTimezone && isDifferentTimezone 
    ? TimeService.formatInTimezone(date, originalTimezone, formatString)
    : null;
  
  const originalTimezoneName = originalTimezone 
    ? TimeService.getTimezoneAbbreviation(originalTimezone)
    : null;

  return (
    <TooltipProvider>
      <div className={`flex items-center gap-1 ${className}`}>
        <span className="font-medium">
          {userTime}
          {showTimezone && (
            <span className="text-xs text-muted-foreground ml-1">
              {userTimezoneName}
            </span>
          )}
        </span>
        
        {isDifferentTimezone && showOriginal && (
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Globe className="w-3 h-3" />
                <span>
                  {originalTime} {originalTimezoneName}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Original timezone: {originalTimezone}</p>
            </TooltipContent>
          </Tooltip>
        )}
        
        {isDifferentTimezone && !showOriginal && (
          <Tooltip>
            <TooltipTrigger>
              <Globe className="w-3 h-3 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-center">
                <p className="font-medium">Cross-timezone event</p>
                <p className="text-xs">
                  Original: {originalTime} {originalTimezoneName}
                </p>
                <p className="text-xs">
                  Your time: {userTime} {userTimezoneName}
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};

export default TimezoneAwareTime;
