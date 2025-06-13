
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { GradientButton } from './ui/gradient-button';

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
  const navigate = useNavigate();

  const handleScheduleBroTime = () => {
    navigate('/invite');
  };

  const handleAddFriend = () => {
    navigate('/friends');
  };

  return (
    <div className="text-center text-white px-4 md:px-6 relative z-20">
      {isNewUser ? (
        <div>
          <h1 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/80">
            Welcome to BroYouFree! 👊
          </h1>
          <p className="text-lg md:text-xl text-white/70 mb-6 md:mb-8">
            Turn "we should hang out" into actual plans in 3 taps
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Button 
              onClick={handleAddFriend}
              className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 hover:scale-105 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all duration-300 border border-white/30"
            >
              <span>👥</span>
              Add Your First Friend
            </Button>
            <Button 
              variant="outline" 
              className="border-white/30 bg-transparent backdrop-blur-sm text-white hover:bg-white/10 hover:scale-105 px-6 py-3 rounded-lg font-semibold transition-all duration-300"
            >
              Import Contacts
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/80">
              Hey there! 👋
            </h1>
            <p className="text-base md:text-lg text-white/70">
              {upcomingCount} hangouts this week • {activeStreak} day streak
            </p>
          </div>
          <GradientButton 
            onClick={handleScheduleBroTime}
            className="hover:scale-105 hover:shadow-lg flex items-center gap-3 transition-all duration-300 bg-white/20 backdrop-blur-sm border border-white/30"
          >
            <span>📅</span>
            Schedule Bro Time
          </GradientButton>
        </div>
      )}
    </div>
  );
};

export default QuickActionsSection;
