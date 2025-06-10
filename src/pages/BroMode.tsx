
import React from 'react';
import Header from '../components/Header';
import BroModePanel from '../components/BroModePanel';
import { mockUserStats } from '../data/mockData';

const BroMode = () => {
  return (
    <div className="min-h-screen bg-bg-secondary">
      <Header userStats={mockUserStats} />
      
      {/* Mobile-first bro mode layout */}
      <div className="p-4">
        <div className="max-w-md mx-auto md:max-w-2xl">
          <h2 className="text-xl font-bold text-primary mb-4">
            Bro Mode Dashboard 👊
          </h2>
          
          {/* Full-width bro mode panel on mobile */}
          <div className="bg-bg-primary rounded-2xl shadow-lg border border-custom">
            <BroModePanel userStats={mockUserStats} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BroMode;
