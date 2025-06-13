
import React from 'react';

interface HeaderProps {
  userStats: {
    broPoints: number;
    currentStreak: number;
  };
}

const Header: React.FC<HeaderProps> = ({ userStats }) => {
  return (
    <header className="bg-white/90 backdrop-blur-sm text-gray-800 border-b border-gray-200/50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-lg text-white">
              👊
            </div>
            <h1 className="text-lg md:text-xl font-semibold text-gray-800">BroYouFree</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 font-medium">Ready to hang</span>
            </div>
            
            <div className="flex items-center gap-3 md:gap-4 bg-gray-100/80 backdrop-blur-sm rounded-lg px-3 md:px-4 py-2 border border-gray-200">
              <div className="text-center">
                <div className="text-sm md:text-lg font-semibold text-gray-800">{userStats.broPoints}</div>
                <div className="text-xs text-gray-600 hidden md:block">Bro Points</div>
              </div>
              <div className="w-px h-6 md:h-8 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-sm md:text-lg font-semibold text-gray-800">{userStats.currentStreak}</div>
                <div className="text-xs text-gray-600 hidden md:block">Day Streak</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
