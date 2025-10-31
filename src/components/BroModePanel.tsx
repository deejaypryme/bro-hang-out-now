import React from 'react';
import { type UserStats } from '@/types/stats';

interface BroModePanelProps {
  userStats: UserStats;
}

const BroModePanel: React.FC<BroModePanelProps> = ({ userStats }) => {
  const recentChallenges = [
    { name: "Week Warrior", emoji: "⚔️", progress: 70, target: "5 hangouts this week" },
    { name: "Response Rocket", emoji: "🚀", progress: 90, target: "Reply within 1 hour" },
    { name: "Activity Explorer", emoji: "🗺️", progress: 40, target: "Try 3 new activities" }
  ];

  return (
    <div className="w-80 bg-bg-primary border-l border-custom p-6 h-full overflow-y-auto">
      <div className="space-y-6">
        {/* Points Display */}
        <div className="text-center bg-gradient-to-br from-primary to-primary-hover rounded-xl p-6 text-white">
          <div className="text-3xl font-bold mb-1">{userStats.broPoints}</div>
          <div className="text-sm opacity-90">Bro Points</div>
          <div className="text-xs opacity-75 mt-2">
            🔥 {userStats.currentStreak} day streak
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-bg-secondary rounded-lg p-4 text-center">
            <div className="text-xl font-semibold text-primary">{userStats.totalHangouts}</div>
            <div className="text-xs text-text-muted">Total Hangouts</div>
          </div>
          <div className="bg-bg-secondary rounded-lg p-4 text-center">
            <div className="text-xl font-semibold text-success">
              {userStats.achievements.filter(a => a.earned).length}
            </div>
            <div className="text-xs text-text-muted">Badges Earned</div>
          </div>
        </div>

        {/* Active Challenges */}
        <div>
          <h4 className="font-semibold text-primary mb-4">Active Challenges</h4>
          <div className="space-y-3">
            {recentChallenges.map((challenge, index) => (
              <div key={index} className="bg-bg-secondary rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{challenge.emoji}</span>
                    <span className="font-medium text-sm">{challenge.name}</span>
                  </div>
                  <span className="text-xs text-primary font-medium">{challenge.progress}%</span>
                </div>
                <div className="w-full bg-bg-tertiary rounded-full h-2 mb-2">
                  <div 
                    className="bg-primary rounded-full h-2 transition-all duration-300"
                    style={{ width: `${challenge.progress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-text-muted">{challenge.target}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Badge Collection */}
        <div>
          <h4 className="font-semibold text-primary mb-4">Your Badges</h4>
          <div className="grid grid-cols-2 gap-2">
            {userStats.achievements.map((achievement, index) => (
              <div
                key={index}
                className={`
                  p-3 rounded-lg text-center transition-all
                  ${achievement.earned
                    ? 'bg-success/20 border border-success/30'
                    : 'bg-bg-secondary border border-custom opacity-50'
                  }
                `}
              >
                <div className="text-lg mb-1">{achievement.emoji}</div>
                <div className="text-xs font-medium text-primary">{achievement.name}</div>
                {!achievement.earned && achievement.progress && (
                  <div className="text-xs text-text-muted mt-1">
                    {achievement.progress}% complete
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Friendship Insights */}
        <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
          <h5 className="font-medium text-accent mb-2">💡 Bro Tip</h5>
          <p className="text-xs text-text-secondary">
            You're most active on weekends! Try scheduling some weekday coffee chats to boost your consistency streak.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BroModePanel;
