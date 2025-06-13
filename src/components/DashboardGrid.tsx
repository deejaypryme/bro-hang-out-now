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
          <Card className="bg-white/80 backdrop-blur-lg border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center gap-3 pb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                📅
              </div>
              <CardTitle className="text-base font-semibold text-gray-800">Upcoming Hangouts</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-6">
              <div className="text-4xl mb-2">📭</div>
              <p className="text-gray-600 mb-1 font-medium">Your hangouts will appear here</p>
              <p className="text-sm text-gray-500">Add friends to start coordinating!</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-lg border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center gap-3 pb-4">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                👥
              </div>
              <CardTitle className="text-base font-semibold text-gray-800">Your Squad</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-6">
              <div className="text-4xl mb-2">👤</div>
              <p className="text-gray-600 mb-3 font-medium">No friends added yet</p>
              <Button onClick={handleAddFriends} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300">
                Add Friends
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-lg border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center gap-3 pb-4">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                ⚡
              </div>
              <CardTitle className="text-base font-semibold text-gray-800">Bro Points</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-4">
              <div className="text-3xl font-bold text-gray-800 mb-2">0</div>
              <p className="text-sm text-gray-600 font-medium">
                Earn points by coordinating hangouts!
              </p>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Existing User Cards */}
          <Card className="bg-white/80 backdrop-blur-lg border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-800">
                <span>📅</span>
                Next Hangout
              </CardTitle>
              <Button variant="ghost" className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 text-sm p-0 h-auto font-medium">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {nextHangout ? (
                <div>
                  <div className="text-lg font-semibold mb-1 text-gray-800">
                    {nextHangout.time}
                  </div>
                  <div className="text-gray-600 mb-3 font-medium">
                    {nextHangout.activity} with {nextHangout.friendName}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="text-xs border-gray-300 text-gray-700 hover:bg-gray-50 font-medium">
                      Reschedule
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 font-medium">
                      Details
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-2xl mb-2">📭</div>
                  <p className="text-gray-600 mb-2 font-medium">No hangouts scheduled</p>
                  <Button variant="ghost" onClick={handleScheduleBroTime} className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 text-sm p-0 h-auto font-medium">
                    Send invite?
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-lg border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-800">
                <span>👥</span>
                Active Friends ({friends.length})
              </CardTitle>
              <Button variant="ghost" onClick={handleAddFriends} className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 text-sm p-0 h-auto font-medium">
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
                      <div className="font-medium text-sm text-gray-800">{friend.name}</div>
                      <div className="text-xs">
                        <Badge 
                          variant={friend.status === 'online' ? 'default' : 'secondary'}
                          className="text-xs bg-green-100 text-green-800 border-green-200 font-medium"
                        >
                          {friend.status}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="outline" onClick={handleScheduleBroTime} size="sm" className="text-gray-700 border-gray-300 hover:bg-gray-50 text-xs px-2 py-1 font-medium">
                      BYF?
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-lg border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center gap-2 pb-4">
              <span>📊</span>
              <CardTitle className="text-base font-semibold text-gray-800">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Hangouts</span>
                  <span className="font-semibold text-gray-800">8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Response Rate</span>
                  <span className="font-semibold text-gray-800">85%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Current Streak</span>
                  <span className="font-semibold text-green-600">{userStats.currentStreak} days</span>
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
