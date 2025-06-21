
import React, { useState } from 'react';
import Header from '../components/Header';
import CalendarSidebar from '../components/CalendarSidebar';
import CalendarIntegrationSettings from '../components/CalendarIntegrationSettings';
import { Button } from '../components/ui/button';
import { Settings, Calendar as CalendarIcon } from 'lucide-react';
import { mockUserStats } from '../data/mockData';
import { useHangouts } from '../hooks/useDatabase';

const Calendar = () => {
  const [showSettings, setShowSettings] = useState(false);
  
  // Get real hangouts data
  const { data: hangouts = [] } = useHangouts();

  return (
    <div className="min-h-screen bg-bg-secondary">
      <Header userStats={mockUserStats} />
      
      {/* Calendar layout */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <CalendarSidebar hangouts={hangouts} />
        
        {/* Main content area */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <CalendarIcon className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold text-primary">
                  {showSettings ? 'Calendar Settings' : 'Your Social Calendar'}
                </h1>
              </div>
              
              <Button
                onClick={() => setShowSettings(!showSettings)}
                variant={showSettings ? "default" : "outline"}
                className="flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>{showSettings ? 'Back to Calendar' : 'Settings'}</span>
              </Button>
            </div>
            
            {showSettings ? (
              <CalendarIntegrationSettings />
            ) : (
              <div className="bg-bg-primary rounded-2xl shadow-lg border border-custom p-6">
                <div className="text-center py-12">
                  <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h2 className="text-xl font-semibold text-gray-600 mb-2">
                    Calendar View Coming Soon
                  </h2>
                  <p className="text-gray-500 mb-6">
                    Your events are shown in the sidebar. Full calendar view and integrations are available in settings.
                  </p>
                  <Button 
                    onClick={() => setShowSettings(true)}
                    className="flex items-center space-x-2"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Manage Calendar Integrations</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
