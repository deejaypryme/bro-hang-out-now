
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
    <div className="text-center px-4 md:px-6">
      {isNewUser ? (
        <div className="bg-white/80 backdrop-blur-lg border border-gray-200/50 rounded-2xl p-8 shadow-lg">
          <h1 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700">
            Welcome to BroYouFree! 👊
          </h1>
          <p className="text-lg text-gray-600 mb-6 md:mb-8 font-medium">
            Turn "we should hang out" into actual plans in 3 taps
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Button 
              onClick={handleAddFriend}
              className="bg-white/90 backdrop-blur-sm text-gray-800 hover:bg-white hover:scale-105 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-300 border border-gray-200 shadow-md hover:shadow-lg"
            >
              <span>👥</span>
              Add Your First Friend
            </Button>
            <Button 
              variant="outline" 
              className="border-gray-300 bg-transparent backdrop-blur-sm text-gray-700 hover:bg-gray-50 hover:scale-105 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-sm hover:shadow-md"
            >
              Import Contacts
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-lg border border-gray-200/50 rounded-2xl p-6 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700">
                Hey there! 👋
              </h1>
              <p className="text-base md:text-lg text-gray-600 font-medium">
                {upcomingCount} hangouts this week • {activeStreak} day streak
              </p>
            </div>
            <GradientButton 
              onClick={handleScheduleBroTime}
              className="hover:scale-105 hover:shadow-xl flex items-center gap-3 transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg"
            >
              <span>📅</span>
              Schedule Bro Time
            </GradientButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickActionsSection;
