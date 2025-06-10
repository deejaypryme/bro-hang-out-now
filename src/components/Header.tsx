
import React from 'react';

interface HeaderProps {
  userStats: {
    broPoints: number;
    currentStreak: number;
  };
}

const Header: React.FC<HeaderProps> = ({ userStats }) => {
  return (
    <header className="flex items-center justify-between p-6 bg-primary text-white">
      <div className="flex items-center space-x-3">
        <div className="text-2xl font-bold">👊</div>
        <h1 className="text-xl font-semibold">BroYouFree</h1>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
          <span className="text-sm opacity-90">Ready to hang</span>
        </div>
        
        <div className="flex items-center space-x-4 bg-white/10 rounded-lg px-4 py-2">
          <div className="text-center">
            <div className="text-lg font-semibold">{userStats.broPoints}</div>
            <div className="text-xs opacity-75">Bro Points</div>
          </div>
          <div className="w-px h-8 bg-white/20"></div>
          <div className="text-center">
            <div className="text-lg font-semibold">{userStats.currentStreak}</div>
            <div className="text-xs opacity-75">Day Streak</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
