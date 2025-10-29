
import React, { useState } from 'react';
import { format, isSameDay, parseISO } from 'date-fns';
import Header from '../components/Header';
import CalendarSidebar from '../components/CalendarSidebar';
import CalendarIntegrationSettings from '../components/CalendarIntegrationSettings';
import { MonthCalendar } from '../components/MonthCalendar';
import { HangoutDayDetails } from '../components/HangoutDayDetails';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Settings, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useHangouts } from '../hooks/useDatabase';
import type { Hangout } from '../types/database';

const Calendar = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Get real hangouts data
  const { data: hangouts = [] } = useHangouts();
  
  // Filter hangouts for selected date
  const selectedDateHangouts = selectedDate
    ? hangouts.filter(h => isSameDay(parseISO(h.scheduled_date), selectedDate))
    : [];
  
  const userStats = {
    broPoints: 485,
    currentStreak: 3,
    totalHangouts: hangouts.filter(h => h.status === 'confirmed' || h.status === 'completed').length,
  };

  return (
    <div className="min-h-screen hero-background">
      <Header userStats={userStats} />
      
      {/* Calendar layout */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <CalendarSidebar hangouts={hangouts} />
        
        {/* Main content area */}
        <div className="flex-1 p-bro-xl">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-bro-2xl">
              <div className="flex items-center space-x-bro-md">
                <div className="w-12 h-12 bg-gradient-to-r from-accent-orange to-accent-light rounded-bro-lg flex items-center justify-center text-2xl text-white shadow-lg">
                  📅
                </div>
                <div>
                  <h1 className="typo-headline-lg text-white">
                    {showSettings ? 'Calendar Settings' : 'Your Social Calendar'}
                  </h1>
                  <p className="typo-body text-white/80 mt-bro-xs">
                    {showSettings ? 'Manage your calendar integrations' : 'Keep track of all your hangouts'}
                  </p>
                </div>
              </div>
              
              <Button
                onClick={() => setShowSettings(!showSettings)}
                variant={showSettings ? "primary" : "outline"}
                className="flex items-center space-x-bro-sm"
                size="lg"
              >
                <Settings className="w-4 h-4" />
                <span>{showSettings ? 'Back to Calendar' : 'Settings'}</span>
              </Button>
            </div>
            
            {showSettings ? (
              <Card variant="glass" className="shadow-2xl border-white/20">
                <CardContent className="pt-bro-lg">
                  <CalendarIntegrationSettings />
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-bro-lg">
                {/* Calendar View */}
                <Card variant="glass" className="shadow-2xl border-white/20">
                  <CardContent className="p-bro-lg">
                    <MonthCalendar
                      hangouts={hangouts}
                      selectedDate={selectedDate}
                      onSelectDate={setSelectedDate}
                    />
                  </CardContent>
                </Card>

                {/* Day Details */}
                {selectedDate && (
                  <HangoutDayDetails
                    date={selectedDate}
                    hangouts={selectedDateHangouts}
                    onClose={() => setSelectedDate(undefined)}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
