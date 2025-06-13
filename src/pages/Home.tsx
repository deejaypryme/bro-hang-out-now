
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <Header userStats={mockUserStats} />
      
      {/* Main Content with lighter theme */}
      <div className="bg-transparent">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
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
