
import React from 'react';
import Header from '../components/Header';
import CalendarSidebar from '../components/CalendarSidebar';
import InviteFlow from '../components/InviteFlow';
import BroModePanel from '../components/BroModePanel';
import { mockFriends, mockHangouts, mockUserStats } from '../data/mockData';

const Index = () => {
  return (
    <div className="min-h-screen bg-bg-secondary">
      <Header userStats={mockUserStats} />
      
      <div className="flex h-[calc(100vh-88px)]">
        {/* Left Sidebar - Calendar */}
        <CalendarSidebar hangouts={mockHangouts} />
        
        {/* Center Panel - Invite Flow */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-lg">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-primary mb-2">
                Let's get you hanging out! 👊
              </h2>
              <p className="text-text-secondary">
                Transform "we should hang out more" into confirmed plans
              </p>
            </div>
            
            <div className="bg-bg-primary rounded-2xl shadow-lg p-8 border border-custom">
              <InviteFlow friends={mockFriends} />
            </div>
          </div>
        </div>
        
        {/* Right Panel - Bro Mode Dashboard */}
        <BroModePanel userStats={mockUserStats} />
      </div>
    </div>
  );
};

export default Index;
