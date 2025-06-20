
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFriends, useHangouts } from '@/hooks/useDatabase';
import Header from '../components/Header';
import QuickActionsSection from '../components/QuickActionsSection';
import DashboardGrid from '../components/DashboardGrid';
import ActivityFeed from '../components/ActivityFeed';
import { Button } from '@/components/ui/button';

const Home = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const { data: friends = [], isLoading: friendsLoading } = useFriends();
  const { data: hangouts = [], isLoading: hangoutsLoading } = useHangouts();

  // Redirect to auth if not authenticated
  React.useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-2xl text-white mx-auto mb-4 animate-pulse">
            👊
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Mock user stats for now - these could be calculated from real data
  const userStats = {
    broPoints: 485,
    currentStreak: hangouts.filter(h => h.status === 'confirmed').length || 1,
    totalHangouts: hangouts.length,
  };

  const isNewUser = friends.length === 0 && hangouts.length === 0;
  const upcomingCount = hangouts.filter(h => 
    h.status === 'confirmed' && new Date(h.scheduled_date) >= new Date()
  ).length;
  const activeStreak = userStats.currentStreak;

  if (friendsLoading || hangoutsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header userStats={userStats} />
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-600">Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header userStats={userStats} />
      
      <main className="max-w-6xl mx-auto py-8 space-y-8">
        <QuickActionsSection 
          isNewUser={isNewUser}
          userStats={userStats}
          upcomingCount={upcomingCount}
          activeStreak={activeStreak}
        />
        
        {!isNewUser && (
          <DashboardGrid 
            hangouts={hangouts}
            friends={friends}
            userStats={userStats}
          />
        )}
        
        <div className="px-4 md:px-6">
          <ActivityFeed isNewUser={isNewUser} friends={friends} />
        </div>

        {!user && (
          <div className="text-center px-4 md:px-6">
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Sign In to Continue
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
