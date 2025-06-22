
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFriends, useHangouts } from '@/hooks/useDatabase';
import Header from '../components/Header';
import QuickActionsSection from '../components/QuickActionsSection';
import DashboardGrid from '../components/DashboardGrid';
import ActivityFeed from '../components/ActivityFeed';

const Home = () => {
  const { user, loading: authLoading } = useAuth();
  
  const { data: friends = [], isLoading: friendsLoading } = useFriends();
  const { data: hangouts = [], isLoading: hangoutsLoading } = useHangouts();

  if (authLoading || !user) {
    return (
      <div className="min-h-screen hero-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-accent-orange to-accent-light rounded-bro-lg flex items-center justify-center text-3xl text-white mx-auto mb-bro-lg animate-pulse shadow-2xl">
            👊
          </div>
          <p className="typo-body text-white/80">Loading...</p>
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
      <div className="min-h-screen hero-background">
        <Header userStats={userStats} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-accent-orange to-accent-light rounded-bro-lg flex items-center justify-center text-2xl text-white mx-auto mb-bro-lg animate-pulse shadow-lg">
              👊
            </div>
            <p className="typo-body text-white/80">Loading your data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen hero-background">
      <Header userStats={userStats} />
      
      <main className="max-w-6xl mx-auto py-bro-2xl space-y-bro-2xl">
        <QuickActionsSection 
          isNewUser={isNewUser}
          userStats={userStats}
          upcomingCount={upcomingCount}
          activeStreak={activeStreak}
        />
        
        {!isNewUser && (
          <DashboardGrid 
            isNewUser={isNewUser}
            hangouts={hangouts}
            friends={friends}
            userStats={userStats}
          />
        )}
        
        <div className="px-bro-lg md:px-bro-xl">
          <ActivityFeed isNewUser={isNewUser} friends={friends} />
        </div>
      </main>
    </div>
  );
};

export default Home;
