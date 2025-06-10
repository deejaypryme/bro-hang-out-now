
import React from 'react';

interface HeaderProps {
  userStats: {
    broPoints: number;
    currentStreak: number;
  };
}

const Header: React.FC<HeaderProps> = ({ userStats }) => {
  return (
    <header className="bg-primary text-white border-b border-default">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-lg">
              👊
            </div>
            <h1 className="text-lg md:text-xl font-semibold text-white">BroYouFree</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-sm opacity-90 text-white">Ready to hang</span>
            </div>
            
            <div className="flex items-center gap-3 md:gap-4 bg-white/10 rounded-lg px-3 md:px-4 py-2">
              <div className="text-center">
                <div className="text-sm md:text-lg font-semibold text-white">{userStats.broPoints}</div>
                <div className="text-xs opacity-75 hidden md:block text-white">Bro Points</div>
              </div>
              <div className="w-px h-6 md:h-8 bg-white/20"></div>
              <div className="text-center">
                <div className="text-sm md:text-lg font-semibold text-white">{userStats.currentStreak}</div>
                <div className="text-xs opacity-75 hidden md:block text-white">Day Streak</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
