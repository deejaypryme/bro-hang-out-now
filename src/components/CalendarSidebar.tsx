
import React, { useState } from 'react';
import { format, startOfWeek, addDays, isSameDay, isToday, startOfDay, endOfDay } from 'date-fns';
import { Calendar, Settings, RefreshCw, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { useCalendarEvents, useCalendarIntegrations } from '@/hooks/useCalendarEvents';
import { useHangouts } from '@/hooks/useDatabase';
import { Link } from 'react-router-dom';
import type { Hangout } from '../data/mockData';

interface CalendarSidebarProps {
  hangouts: Hangout[];
}

const CalendarSidebar: React.FC<CalendarSidebarProps> = ({ hangouts }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const today = new Date();
  const startWeek = startOfWeek(today, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startWeek, i));
  
  // Get real calendar events
  const { data: calendarEvents = [], isLoading: eventsLoading } = useCalendarEvents(
    startOfDay(startWeek),
    endOfDay(addDays(startWeek, 6))
  );
  
  // Get calendar integrations
  const { data: integrations = [] } = useCalendarIntegrations();
  
  // Get real hangouts data
  const { data: realHangouts = [] } = useHangouts();
  
  // Use real hangouts if available, fallback to props
  const activeHangouts = realHangouts.length > 0 ? realHangouts : hangouts;
  
  const getHangoutsForDate = (date: Date) => {
    return activeHangouts.filter(hangout => {
      const hangoutDate = new Date(hangout.scheduled_date || hangout.date);
      return isSameDay(hangoutDate, date);
    });
  };

  const getCalendarEventsForDate = (date: Date) => {
    return calendarEvents.filter(event => isSameDay(event.startTime, date));
  };

  const getAllEventsForDate = (date: Date) => {
    const hangouts = getHangoutsForDate(date);
    const events = getCalendarEventsForDate(date);
    return { hangouts, events, total: hangouts.length + events.length };
  };

  const upcomingHangouts = activeHangouts
    .filter(hangout => {
      const hangoutDate = new Date(hangout.scheduled_date || hangout.date);
      return hangoutDate >= today;
    })
    .sort((a, b) => {
      const dateA = new Date(a.scheduled_date || a.date);
      const dateB = new Date(b.scheduled_date || b.date);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 3);

  const upcomingCalendarEvents = calendarEvents
    .filter(event => event.startTime >= today)
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
    .slice(0, 2);

  return (
    <div className="w-80 bg-bg-primary border-r border-custom p-6 h-full overflow-y-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-primary">Your Calendar</h3>
          <Link to="/settings/calendar">
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        
        {/* Calendar Integration Status */}
        {integrations.length > 0 && (
          <div className="mb-4 p-3 bg-bg-secondary rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">
                {integrations.length} calendar{integrations.length > 1 ? 's' : ''} connected
              </span>
              <RefreshCw className="w-4 h-4 text-success" />
            </div>
          </div>
        )}
        
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
              const { total } = getAllEventsForDate(date);
              const isCurrentDay = isToday(date);
              const isSelected = isSameDay(date, selectedDate);
              
              return (
                <div
                  key={index}
                  className={`
                    relative p-2 text-center text-sm rounded-lg cursor-pointer transition-colors
                    ${isCurrentDay 
                      ? 'bg-primary text-white font-semibold' 
                      : isSelected
                      ? 'bg-accent text-white'
                      : total > 0 
                      ? 'bg-success/20 text-success hover:bg-success/30' 
                      : 'hover:bg-bg-tertiary'
                    }
                  `}
                  onClick={() => setSelectedDate(date)}
                >
                  {format(date, 'd')}
                  {total > 0 && !isCurrentDay && !isSelected && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-medium">{total}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Date Events */}
      {!isSameDay(selectedDate, today) && (
        <div className="mb-6">
          <h4 className="text-md font-semibold text-primary mb-3">
            {format(selectedDate, 'MMM d, yyyy')}
          </h4>
          <SelectedDateEvents date={selectedDate} />
        </div>
      )}

      {/* Upcoming Events Section */}
      <div>
        <h4 className="text-md font-semibold text-primary mb-4">Coming Up</h4>
        
        {eventsLoading ? (
          <div className="text-center py-4 text-text-muted">
            <Calendar className="w-6 h-6 mx-auto mb-2 animate-pulse" />
            <p className="text-sm">Loading events...</p>
          </div>
        ) : upcomingHangouts.length === 0 && upcomingCalendarEvents.length === 0 ? (
          <div className="text-center py-8 text-text-muted">
            <div className="text-2xl mb-2">📅</div>
            <p className="text-sm">No upcoming events</p>
            <p className="text-xs">Send a BYF invite or sync your calendar!</p>
            {integrations.length === 0 && (
              <Link to="/settings/calendar">
                <Button size="sm" variant="outline" className="mt-3">
                  <Plus className="w-4 h-4 mr-2" />
                  Connect Calendar
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Upcoming Hangouts */}
            {upcomingHangouts.map((hangout) => (
              <div
                key={hangout.id}
                className="bg-bg-secondary rounded-lg p-4 border border-custom hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{hangout.activity_emoji || hangout.activityEmoji}</span>
                    <div>
                      <div className="font-medium text-sm text-primary">
                        {hangout.friend_id || hangout.friendName}
                      </div>
                      <div className="text-xs text-text-secondary">
                        {hangout.activity_name || hangout.activity}
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
                  <span>{format(new Date(hangout.scheduled_date || hangout.date), 'MMM d')}</span>
                  <span className="mx-2">•</span>
                  <span>{hangout.scheduled_time || hangout.time}</span>
                  {hangout.location && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{hangout.location}</span>
                    </>
                  )}
                </div>
              </div>
            ))}

            {/* Upcoming Calendar Events */}
            {upcomingCalendarEvents.map((event) => (
              <div
                key={event.id}
                className="bg-bg-secondary rounded-lg p-4 border border-custom hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">📅</span>
                    <div>
                      <div className="font-medium text-sm text-primary">
                        {event.title}
                      </div>
                      {event.description && (
                        <div className="text-xs text-text-secondary line-clamp-1">
                          {event.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600">
                    Calendar
                  </div>
                </div>
                
                <div className="flex items-center text-xs text-text-muted">
                  <span>{format(event.startTime, 'MMM d')}</span>
                  <span className="mx-2">•</span>
                  <span>{format(event.startTime, 'h:mm a')}</span>
                  {event.location && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{event.location}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper component for selected date events
const SelectedDateEvents: React.FC<{ date: Date }> = ({ date }) => {
  const { data: calendarEvents = [] } = useCalendarEvents(date, date);
  const { data: hangouts = [] } = useHangouts();
  
  const dayHangouts = hangouts.filter(hangout => {
    const hangoutDate = new Date(hangout.scheduled_date || hangout.date);
    return isSameDay(hangoutDate, date);
  });
  
  const dayEvents = calendarEvents.filter(event => isSameDay(event.startTime, date));
  
  const allEvents = [
    ...dayHangouts.map(h => ({ type: 'hangout', data: h })),
    ...dayEvents.map(e => ({ type: 'event', data: e }))
  ].sort((a, b) => {
    const timeA = a.type === 'hangout' 
      ? new Date(`${date.toDateString()} ${a.data.scheduled_time || a.data.time}`)
      : a.data.startTime;
    const timeB = b.type === 'hangout'
      ? new Date(`${date.toDateString()} ${b.data.scheduled_time || b.data.time}`)
      : b.data.startTime;
    return timeA.getTime() - timeB.getTime();
  });

  if (allEvents.length === 0) {
    return (
      <div className="text-center py-4 text-text-muted">
        <p className="text-sm">No events this day</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {allEvents.map((item, index) => (
        <div key={index} className="text-sm p-2 bg-bg-tertiary rounded">
          {item.type === 'hangout' ? (
            <div className="flex items-center space-x-2">
              <span>{item.data.activity_emoji || item.data.activityEmoji}</span>
              <span>{item.data.activity_name || item.data.activity}</span>
              <span className="text-xs text-text-muted">
                {item.data.scheduled_time || item.data.time}
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span>📅</span>
              <span>{item.data.title}</span>
              <span className="text-xs text-text-muted">
                {format(item.data.startTime, 'h:mm a')}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CalendarSidebar;
