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
  const nextHangout = hangouts[0];
  const activeFriends = friends.slice(0, 3);

  const handleAddFriends = () => {
    navigate('/friends');
  };

  const handleScheduleBroTime = () => {
    navigate('/invite');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
      {isNewUser ? (
        <>
          {/* New User Sample Cards */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 text-white">
            <CardHeader className="flex flex-row items-center gap-3 pb-4">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                📅
              </div>
              <CardTitle className="text-base font-semibold text-white">Upcoming Hangouts</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-6">
              <div className="text-4xl mb-2">📭</div>
              <p className="text-white/60 mb-1">Your hangouts will appear here</p>
              <p className="text-sm text-white/40">Add friends to start coordinating!</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10 text-white">
            <CardHeader className="flex flex-row items-center gap-3 pb-4">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                👥
              </div>
              <CardTitle className="text-base font-semibold text-white">Your Squad</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-6">
              <div className="text-4xl mb-2">👤</div>
              <p className="text-white/60 mb-3">No friends added yet</p>
              <Button onClick={handleAddFriends} className="bg-white/10 hover:bg-white/20 text-white border-white/20 px-4 py-2 rounded-lg text-sm">
                Add Friends
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10 text-white">
            <CardHeader className="flex flex-row items-center gap-3 pb-4">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                ⚡
              </div>
              <CardTitle className="text-base font-semibold text-white">Bro Points</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-4">
              <div className="text-3xl font-bold text-white mb-2">0</div>
              <p className="text-sm text-white/60">
                Earn points by coordinating hangouts!
              </p>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Existing User Cards */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-white">
                <span>📅</span>
                Next Hangout
              </CardTitle>
              <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 text-sm p-0 h-auto">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {nextHangout ? (
                <div>
                  <div className="text-lg font-semibold mb-1 text-white">
                    {nextHangout.time}
                  </div>
                  <div className="text-white/60 mb-3">
                    {nextHangout.activity} with {nextHangout.friendName}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="text-xs border-white/20 text-white hover:bg-white/10">
                      Reschedule
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs text-white/70 hover:text-white hover:bg-white/10">
                      Details
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-2xl mb-2">📭</div>
                  <p className="text-white/60 mb-2">No hangouts scheduled</p>
                  <Button variant="ghost" onClick={handleScheduleBroTime} className="text-white/70 hover:text-white hover:bg-white/10 text-sm p-0 h-auto">
                    Send invite?
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-white">
                <span>👥</span>
                Active Friends ({friends.length})
              </CardTitle>
              <Button variant="ghost" onClick={handleAddFriends} className="text-white/70 hover:text-white hover:bg-white/10 text-sm p-0 h-auto">
                + Add
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeFriends.map(friend => (
                  <div key={friend.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                      {friend.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-white">{friend.name}</div>
                      <div className="text-xs">
                        <Badge 
                          variant={friend.status === 'online' ? 'default' : 'secondary'}
                          className="text-xs bg-white/10 text-white border-white/20"
                        >
                          {friend.status}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="outline" onClick={handleScheduleBroTime} size="sm" className="text-white border-white/20 hover:bg-white/10 text-xs px-2 py-1">
                      BYF?
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10 text-white">
            <CardHeader className="flex flex-row items-center gap-2 pb-4">
              <span>📊</span>
              <CardTitle className="text-base font-semibold text-white">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/60">Hangouts</span>
                  <span className="font-semibold text-white">8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Response Rate</span>
                  <span className="font-semibold text-white">85%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Current Streak</span>
                  <span className="font-semibold text-green-400">{userStats.currentStreak} days</span>
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
