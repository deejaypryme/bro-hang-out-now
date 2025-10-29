import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface DashboardGridProps {
  isNewUser: boolean;
  friends: any[];
  hangouts: any[];
  userStats: {
    broPoints: number;
    currentStreak: number;
  };
}

const DashboardGrid: React.FC<DashboardGridProps> = ({
  isNewUser,
  friends,
  hangouts,
  userStats
}) => {
  const navigate = useNavigate();
  
  // Get upcoming hangouts and sort by date
  const upcomingHangouts = hangouts
    .filter(h => h.status === 'confirmed' && new Date(h.scheduled_date) >= new Date())
    .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime());
  
  const nextHangout = upcomingHangouts[0];
  const activeFriends = friends.slice(0, 3);
  
  // Calculate real monthly stats
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyHangouts = hangouts.filter(h => {
    const hangoutDate = new Date(h.scheduled_date);
    return hangoutDate.getMonth() === currentMonth && hangoutDate.getFullYear() === currentYear;
  }).length;
  
  const completedThisMonth = hangouts.filter(h => {
    const hangoutDate = new Date(h.scheduled_date);
    return h.status === 'completed' && hangoutDate.getMonth() === currentMonth && hangoutDate.getFullYear() === currentYear;
  }).length;

  const handleAddFriends = () => {
    navigate('/friends');
  };

  const handleScheduleBroTime = () => {
    navigate('/invite');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-bro-lg md:gap-bro-xl mb-bro-2xl px-bro-lg md:px-bro-xl">
      {isNewUser ? (
        <>
          {/* New User Sample Cards */}
          <Card variant="glass" className="shadow-2xl border-white/20 hover:scale-105 transition-all duration-300">
            <CardHeader className="flex flex-row items-center gap-bro-md pb-bro-lg">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-bro-lg flex items-center justify-center shadow-lg">
                📅
              </div>
              <CardTitle className="typo-title-md text-primary-navy">Upcoming Hangouts</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-bro-xl">
              <div className="text-5xl mb-bro-md">📭</div>
              <p className="typo-body text-primary-navy mb-bro-sm font-semibold">Your hangouts will appear here</p>
              <p className="typo-mono text-text-muted">Add friends to start coordinating!</p>
            </CardContent>
          </Card>

          <Card variant="glass" className="shadow-2xl border-white/20 hover:scale-105 transition-all duration-300">
            <CardHeader className="flex flex-row items-center gap-bro-md pb-bro-lg">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-bro-lg flex items-center justify-center shadow-lg">
                👥
              </div>
              <CardTitle className="typo-title-md text-primary-navy">Your Squad</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-bro-xl">
              <div className="text-5xl mb-bro-md">👤</div>
              <p className="typo-body text-primary-navy mb-bro-lg font-semibold">No friends added yet</p>
              <Button onClick={handleAddFriends} variant="primary" size="lg" className="shadow-xl">
                Add Friends
              </Button>
            </CardContent>
          </Card>

          <Card variant="glass" className="shadow-2xl border-white/20 hover:scale-105 transition-all duration-300">
            <CardHeader className="flex flex-row items-center gap-bro-md pb-bro-lg">
              <div className="w-10 h-10 bg-gradient-to-r from-accent-orange to-accent-light rounded-bro-lg flex items-center justify-center shadow-lg">
                ⚡
              </div>
              <CardTitle className="typo-title-md text-primary-navy">Bro Points</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-bro-lg">
              <div className="typo-display-sm text-accent-orange mb-bro-sm">0</div>
              <p className="typo-mono text-text-muted">
                Earn points by coordinating hangouts!
              </p>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Existing User Cards */}
          <Card variant="glass" className="shadow-2xl border-white/20 hover:scale-105 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-bro-lg">
              <CardTitle className="typo-title-md flex items-center gap-bro-sm text-primary-navy">
                <span>📅</span>
                Next Hangout
              </CardTitle>
              <Button variant="ghost" className="text-text-secondary hover:text-accent-orange typo-mono p-0 h-auto">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {nextHangout ? (
                <div>
                  <div className="typo-title-sm mb-bro-sm text-primary-navy">
                    {new Date(nextHangout.scheduled_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                  <div className="typo-body text-text-secondary mb-bro-xs font-medium">
                    {nextHangout.scheduled_time}
                  </div>
                  <div className="typo-body text-primary-navy mb-bro-lg font-semibold">
                    {nextHangout.activity_emoji} {nextHangout.activity_name}
                  </div>
                </div>
              ) : (
                <div className="text-center py-bro-lg">
                  <div className="text-4xl mb-bro-md">📭</div>
                  <p className="typo-body text-primary-navy mb-bro-sm font-semibold">No hangouts scheduled</p>
                  <Button variant="ghost" onClick={handleScheduleBroTime} className="typo-mono text-accent-orange hover:text-accent-light p-0 h-auto">
                    Send invite?
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card variant="glass" className="shadow-2xl border-white/20 hover:scale-105 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-bro-lg">
              <CardTitle className="typo-title-md flex items-center gap-bro-sm text-primary-navy">
                <span>👥</span>
                Active Friends ({friends.length})
              </CardTitle>
              <Button variant="ghost" onClick={handleAddFriends} className="typo-mono text-accent-orange hover:text-accent-light p-0 h-auto">
                + Add
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-bro-md">
                {activeFriends.map(friend => (
                  <div key={friend.id} className="flex items-center gap-bro-md">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-orange to-accent-light flex items-center justify-center text-white typo-body font-semibold shadow-lg">
                      {friend.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="typo-body font-semibold text-primary-navy">{friend.name}</div>
                      <div className="mt-bro-xs">
                        <Badge 
                          variant={friend.status === 'online' ? 'default' : 'secondary'}
                          className="typo-mono bg-green-100 text-green-800 border-green-200"
                        >
                          {friend.status}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="outline" onClick={handleScheduleBroTime} size="sm" className="typo-mono text-primary-navy border-primary-navy/20 hover:bg-accent-orange hover:text-white hover:border-accent-orange">
                      BYF?
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card variant="glass" className="shadow-2xl border-white/20 hover:scale-105 transition-all duration-300">
            <CardHeader className="flex flex-row items-center gap-bro-sm pb-bro-lg">
              <span>📊</span>
              <CardTitle className="typo-title-md text-primary-navy">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-bro-md">
                <div className="flex justify-between">
                  <span className="typo-body text-text-secondary font-medium">Hangouts</span>
                  <span className="typo-title-sm text-primary-navy">{monthlyHangouts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="typo-body text-text-secondary font-medium">Completed</span>
                  <span className="typo-title-sm text-primary-navy">{completedThisMonth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="typo-body text-text-secondary font-medium">Current Streak</span>
                  <span className="typo-title-sm text-green-600">{userStats.currentStreak}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default DashboardGrid;
