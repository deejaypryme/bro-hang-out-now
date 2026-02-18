
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

  return (
    <div className="text-center px-bro-lg md:px-bro-xl">
      {isNewUser ? (
        <div className="glass-surface border border-white/20 rounded-bro-xl p-bro-2xl shadow-xl">
          <h1 className="typo-headline-lg text-primary-navy mb-bro-sm">
            Welcome to BroYouFree! 👊
          </h1>
          <p className="typo-body text-text-secondary mb-bro-xl font-medium">
            Turn "we should hang out" into actual plans in 3 taps
          </p>
          <div className="flex flex-col sm:flex-row gap-bro-md justify-center max-w-md mx-auto">
            <Button 
              onClick={() => navigate('/friends')}
              variant="default"
              size="lg"
              className="shadow-lg"
            >
              <span>👥</span>
              Add Your First Friend
            </Button>
            <Button 
              onClick={() => navigate('/invite')}
              variant="outline" 
              size="lg"
            >
              <span>📅</span>
              Schedule Hangout
            </Button>
          </div>
        </div>
      ) : (
        <div className="glass-surface border border-white/20 rounded-bro-xl p-bro-xl shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-bro-lg">
            <div>
              <h1 className="typo-headline-md text-primary-navy mb-bro-xs">
                Hey there! 👋
              </h1>
              <p className="typo-body text-text-secondary font-medium">
                {upcomingCount} hangouts this week • {activeStreak} day streak
              </p>
            </div>
            <GradientButton 
              onClick={() => navigate('/invite')}
              className="hover:scale-105 hover:shadow-xl flex items-center gap-bro-sm transition-all duration-300"
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
