
import React from 'react';
import { Button } from './ui/button';

interface QuickActionsSectionProps {
  isNewUser: boolean;
  userStats: {
    broPoints: number;
    currentStreak: number;
  };
  upcomingCount: number;
  activeStreak: number;
}

const QuickActionsSection: React.FC<QuickActionsSectionProps> = ({
  isNewUser,
  userStats,
  upcomingCount,
  activeStreak
}) => {
  return (
    <div className="bg-gradient-to-br from-primary to-primary-hover text-white py-6 md:py-8 mb-6 md:mb-8">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {isNewUser ? (
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">
              Welcome to BroYouFree! 👊
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-6 md:mb-8">
              Turn "we should hang out" into actual plans in 3 taps
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Button className="bg-white text-primary hover:bg-white/90 px-6 py-3 rounded-lg font-semibold flex items-center gap-2">
                <span>👥</span>
                Add Your First Friend
              </Button>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-6 py-3 rounded-lg font-semibold">
                Import Contacts
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold mb-2">
                Hey there! 👋
              </h1>
              <p className="text-base md:text-lg opacity-90">
                {upcomingCount} hangouts this week • {activeStreak} day streak
              </p>
            </div>
            <Button className="bg-white text-primary hover:bg-white/90 px-6 md:px-8 py-3 md:py-4 rounded-lg font-bold text-base md:text-lg flex items-center gap-3 hover:scale-105 transition-transform">
              <span>📱</span>
              Bro You Free?
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickActionsSection;
