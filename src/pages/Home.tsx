
import React from 'react';
import Header from '../components/Header';
import QuickActionsSection from '../components/QuickActionsSection';
import DashboardGrid from '../components/DashboardGrid';
import ActivityFeed from '../components/ActivityFeed';
import { mockFriends, mockUserStats, mockHangouts } from '../data/mockData';

const Home = () => {
  // Simulate user state - change to [] to see new user experience
  const userFriends = mockFriends; // Change to [] for new user state
  const isNewUser = userFriends.length === 0;

  return (
    <div className="min-h-screen bg-bg-secondary">
      <Header userStats={mockUserStats} />
      
      <QuickActionsSection 
        isNewUser={isNewUser}
        userStats={mockUserStats}
        upcomingCount={3}
        activeStreak={7}
      />
      
      <div className="max-w-6xl mx-auto px-4 md:px-6 pb-20 md:pb-6">
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
  );
};

export default Home;
