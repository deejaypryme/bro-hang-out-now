
import React from 'react';
import { format, startOfWeek, addDays, isSameDay, isToday } from 'date-fns';
import { mockHangouts, type Hangout } from '../data/mockData';

interface CalendarSidebarProps {
  hangouts: Hangout[];
}

const CalendarSidebar: React.FC<CalendarSidebarProps> = ({ hangouts }) => {
  const today = new Date();
  const startWeek = startOfWeek(today, { weekStartsOn: 0 });
  
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startWeek, i));
  
  const getHangoutsForDate = (date: Date) => {
    return hangouts.filter(hangout => isSameDay(hangout.date, date));
  };

  const upcomingHangouts = hangouts
    .filter(hangout => hangout.date >= today)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 3);

  return (
    <div className="w-80 bg-bg-primary border-r border-custom p-6 h-full overflow-y-auto">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-primary mb-4">Your Social Calendar</h3>
        
        {/* Mini Calendar */}
        <div className="bg-bg-secondary rounded-xl p-4 mb-6">
          <div className="grid grid-cols-7 gap-1 mb-3">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <div key={index} className="text-center text-xs text-text-muted font-medium p-1">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((date, index) => {
              const dayHangouts = getHangoutsForDate(date);
              const isCurrentDay = isToday(date);
              
              return (
                <div
                  key={index}
                  className={`
                    relative p-2 text-center text-sm rounded-lg cursor-pointer transition-colors
                    ${isCurrentDay 
                      ? 'bg-primary text-white font-semibold' 
                      : dayHangouts.length > 0 
                      ? 'bg-accent text-white' 
                      : 'hover:bg-bg-tertiary'
                    }
                  `}
                >
                  {format(date, 'd')}
                  {dayHangouts.length > 0 && !isCurrentDay && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-success rounded-full"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Upcoming Hangouts */}
      <div>
        <h4 className="text-md font-semibold text-primary mb-4">This Week</h4>
        
        {upcomingHangouts.length === 0 ? (
          <div className="text-center py-8 text-text-muted">
            <div className="text-2xl mb-2">📅</div>
            <p className="text-sm">No hangouts scheduled</p>
            <p className="text-xs">Send a BYF invite!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingHangouts.map((hangout) => (
              <div
                key={hangout.id}
                className="bg-bg-secondary rounded-lg p-4 border border-custom hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{hangout.activityEmoji}</span>
                    <div>
                      <div className="font-medium text-sm text-primary">
                        {hangout.friendName}
                      </div>
                      <div className="text-xs text-text-secondary">
                        {hangout.activity}
                      </div>
                    </div>
                  </div>
                  <div className={`
                    text-xs px-2 py-1 rounded-full
                    ${hangout.status === 'confirmed' 
                      ? 'bg-success/20 text-success' 
                      : 'bg-accent/20 text-accent'
                    }
                  `}>
                    {hangout.status}
                  </div>
                </div>
                
                <div className="flex items-center text-xs text-text-muted">
                  <span>{format(hangout.date, 'MMM d')}</span>
                  <span className="mx-2">•</span>
                  <span>{hangout.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarSidebar;
