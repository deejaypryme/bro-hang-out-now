import React from 'react';
import { type UserStats } from '@/types/stats';
import { Progress } from '@/components/ui/progress';

interface BroModePanelProps {
  userStats: UserStats;
}

const BroModePanel: React.FC<BroModePanelProps> = ({ userStats }) => {
  const earnedCount = userStats.achievements.filter(a => a.earned).length;
  const totalAchievements = userStats.achievements.length;

  const challenges = [
    {
      name: "Week Warrior",
      emoji: "⚔️",
      progress: Math.min(100, (userStats.totalHangouts / 5) * 100),
      target: `${userStats.totalHangouts}/5 hangouts`
    },
    {
      name: "Badge Collector",
      emoji: "🏅",
      progress: Math.min(100, (earnedCount / totalAchievements) * 100),
      target: `${earnedCount}/${totalAchievements} badges earned`
    },
    {
      name: "Streak Builder",
      emoji: "🔥",
      progress: Math.min(100, (userStats.currentStreak / 7) * 100),
      target: `${userStats.currentStreak}/7 day streak`
    }
  ];

  return (
    <div className="w-full space-y-6">
      {/* Points Display */}
      <div className="text-center bg-gradient-to-br from-accent-orange to-accent-light rounded-bro-xl p-6 text-white">
        <div className="text-3xl font-bold mb-1">{userStats.broPoints}</div>
        <div className="text-sm opacity-90">Bro Points</div>
        <div className="text-xs opacity-75 mt-2">
          🔥 {userStats.currentStreak} day streak
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-surface rounded-bro-lg p-4 text-center">
          <div className="text-xl font-semibold text-primary-navy">{userStats.totalHangouts}</div>
          <div className="text-xs text-brand-secondary">Total Hangouts</div>
        </div>
        <div className="glass-surface rounded-bro-lg p-4 text-center">
          <div className="text-xl font-semibold text-accent-orange">{earnedCount}</div>
          <div className="text-xs text-brand-secondary">Badges Earned</div>
        </div>
      </div>

      {/* Active Challenges */}
      <div>
        <h4 className="font-semibold text-primary-navy mb-4">Active Challenges</h4>
        <div className="space-y-3">
          {challenges.map((challenge, index) => (
            <div key={index} className="glass-surface rounded-bro-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{challenge.emoji}</span>
                  <span className="font-medium text-sm text-primary-navy">{challenge.name}</span>
                </div>
                <span className="text-xs text-accent-orange font-medium">{Math.round(challenge.progress)}%</span>
              </div>
              <Progress value={challenge.progress} className="h-2" />
              <div className="text-xs text-brand-secondary mt-2">{challenge.target}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Badge Collection */}
      <div>
        <h4 className="font-semibold text-primary-navy mb-4">Your Badges</h4>
        <div className="grid grid-cols-2 gap-2">
          {userStats.achievements.map((achievement, index) => (
            <div
              key={index}
              className={`
                p-3 rounded-bro-lg text-center transition-all
                ${achievement.earned
                  ? 'bg-accent-orange/20 border border-accent-orange/30'
                  : 'glass-surface border border-white/20 opacity-50'
                }
              `}
            >
              <div className="text-lg mb-1">{achievement.emoji}</div>
              <div className="text-xs font-medium text-primary-navy">{achievement.name}</div>
              {!achievement.earned && achievement.progress !== undefined && (
                <div className="text-xs text-brand-secondary mt-1">
                  {Math.round(achievement.progress)}% complete
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bro Tip */}
      <div className="bg-accent-orange/10 rounded-bro-lg p-4 border border-accent-orange/20">
        <h5 className="font-medium text-accent-orange mb-2">💡 Bro Tip</h5>
        <p className="text-xs text-brand-secondary">
          You're most active on weekends! Try scheduling some weekday coffee chats to boost your consistency streak.
        </p>
      </div>
    </div>
  );
};

export default BroModePanel;
