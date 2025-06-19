
import React from 'react';
import Header from '../components/Header';
import QuickActionsSection from '../components/QuickActionsSection';
import DashboardGrid from '../components/DashboardGrid';
import ActivityFeed from '../components/ActivityFeed';
import { Button } from '../components/ui/button';
import { mockFriends, mockUserStats, mockHangouts } from '../data/mockData';
import { exportHangoutToCalendar } from '../lib/calendarExport';
import { useToast } from '../components/ui/use-toast';

const Home = () => {
  const { toast } = useToast();
  
  // Simulate user state - change to [] to see new user experience
  const userFriends = mockFriends; // Change to [] for new user state
  const isNewUser = userFriends.length === 0;

  const handleTestCalendarExport = async () => {
    // Find a confirmed hangout to test with
    const confirmedHangout = mockHangouts.find(h => h.confirmed);
    
    if (!confirmedHangout) {
      toast({
        title: "No confirmed hangouts",
        description: "No confirmed hangouts available to export to calendar.",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await exportHangoutToCalendar(confirmedHangout);
      
      if (result.success) {
        toast({
          title: "Calendar Export Successful! 📅",
          description: `Downloaded ${result.filename} - check your downloads folder and open with your calendar app.`
        });
      } else {
        toast({
          title: "Export Failed",
          description: result.error || "Failed to export calendar event",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Export Error",
        description: "An unexpected error occurred while exporting to calendar",
        variant: "destructive"
      });
      console.error('Calendar export error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <Header userStats={mockUserStats} />
      
      {/* Main Content with lighter theme */}
      <div className="bg-transparent">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
          {/* Test Calendar Export Button */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-blue-900 mb-1">🧪 Test Calendar Export</h3>
                <p className="text-xs text-blue-700">Test the new calendar export functionality with a confirmed hangout</p>
              </div>
              <Button 
                onClick={handleTestCalendarExport}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                📅 Test Export
              </Button>
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className="mb-8">
            <QuickActionsSection 
              isNewUser={isNewUser}
              userStats={mockUserStats}
              upcomingCount={3}
              activeStreak={7}
            />
          </div>
          
          {/* Dashboard Content */}
          <DashboardGrid 
            isNewUser={isNewUser}
            friends={userFriends}
            hangouts={mockHangouts}
            userStats={mockUserStats}
          />
          
          <ActivityFeed 
            isNewUser={isNewUser}
            friends={userFriends}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
