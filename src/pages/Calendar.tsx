
import React, { useState } from 'react';
import Header from '../components/Header';
import CalendarSidebar from '../components/CalendarSidebar';
import CalendarIntegrationSettings from '../components/CalendarIntegrationSettings';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Settings, Calendar as CalendarIcon } from 'lucide-react';
import { useHangouts } from '../hooks/useDatabase';

const Calendar = () => {
  const [showSettings, setShowSettings] = useState(false);
  
  // Get real hangouts data
  const { data: hangouts = [] } = useHangouts();
  
  const userStats = {
    broPoints: 485,
    currentStreak: 3,
    totalHangouts: 12,
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
              <Card variant="glass" className="shadow-2xl border-white/20">
                <CardContent className="text-center py-bro-4xl">
                  <div className="w-20 h-20 bg-gradient-to-r from-accent-orange to-accent-light rounded-bro-xl flex items-center justify-center text-4xl text-white mx-auto mb-bro-xl shadow-xl">
                    📅
                  </div>
                  <h2 className="typo-title-lg text-primary-navy mb-bro-sm">
                    Calendar View Coming Soon
                  </h2>
                  <p className="typo-body text-text-secondary mb-bro-xl max-w-md mx-auto">
                    Your events are shown in the sidebar. Full calendar view and integrations are available in settings.
                  </p>
                  <Button 
                    onClick={() => setShowSettings(true)}
                    variant="primary"
                    size="lg"
                    className="flex items-center space-x-bro-sm"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Manage Calendar Integrations</span>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
