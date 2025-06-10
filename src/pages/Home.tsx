
import React from 'react';
import Header from '../components/Header';
import InviteFlow from '../components/InviteFlow';
import { mockFriends, mockUserStats } from '../data/mockData';

const Home = () => {
  return (
    <div className="min-h-screen bg-bg-secondary">
      <Header userStats={mockUserStats} />
      
      {/* Mobile-first home layout */}
      <div className="p-4 max-w-md mx-auto md:max-w-lg">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-primary mb-2">
            Let's get you hanging out! 👊
          </h2>
          <p className="text-sm text-text-secondary">
            Transform "we should hang out more" into confirmed plans
          </p>
        </div>
        
        <div className="bg-bg-primary rounded-2xl shadow-lg p-6 border border-custom">
          <InviteFlow friends={mockFriends} />
        </div>
      </div>
    </div>
  );
};

export default Home;
