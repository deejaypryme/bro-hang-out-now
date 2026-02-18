
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFriends, useHangouts } from '@/hooks/useDatabase';
import Header from '../components/Header';
import QuickActionsSection from '../components/QuickActionsSection';
import DashboardGrid from '../components/DashboardGrid';
import ActivityFeed from '../components/ActivityFeed';
import WelcomeBanner from '../components/WelcomeBanner';
import { DashboardSkeleton } from '../components/LoadingFallback';

const Home = () => {
  const { user, loading: authLoading } = useAuth();
  
  const { data: friends = [], isLoading: friendsLoading } = useFriends();
  const { data: hangouts = [], isLoading: hangoutsLoading } = useHangouts();

  // Welcome banner state
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);

  const confirmedHangouts = hangouts.filter(h => h.status === 'confirmed');
  const completedHangouts = hangouts.filter(h => h.status === 'completed');
  
  const userStats = {
    broPoints: (completedHangouts.length * 50) + (confirmedHangouts.length * 10),
    currentStreak: confirmedHangouts.length,
    totalHangouts: hangouts.length,
  };

  const isNewUser = friends.length === 0 && hangouts.length === 0;
  const upcomingCount = hangouts.filter(h => 
    h.status === 'confirmed' && new Date(h.scheduled_date) >= new Date()
  ).length;
  const activeStreak = userStats.currentStreak;

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('welcomeBannerDismissed');
    if (isNewUser && !hasSeenWelcome) {
      setShowWelcomeBanner(true);
    }
  }, [isNewUser]);

  const handleDismissWelcome = () => {
    localStorage.setItem('welcomeBannerDismissed', 'true');
    setShowWelcomeBanner(false);
  };

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

  if (friendsLoading || hangoutsLoading) {
    return (
      <div className="min-h-screen hero-background">
        <Header userStats={userStats} />
        <main className="max-w-6xl mx-auto py-bro-2xl">
          <DashboardSkeleton />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen hero-background">
      <Header userStats={userStats} />
      
      <main className="max-w-6xl mx-auto py-bro-2xl space-y-bro-2xl">
        {showWelcomeBanner && (
          <div className="px-bro-lg md:px-bro-xl">
            <WelcomeBanner onDismiss={handleDismissWelcome} />
          </div>
        )}
        
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
          <ActivityFeed isNewUser={isNewUser} friends={friends} hangouts={hangouts} />
        </div>
      </main>
    </div>
  );
};

export default Home;
