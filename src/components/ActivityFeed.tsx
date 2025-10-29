
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

interface ActivityFeedProps {
  isNewUser: boolean;
  friends: any[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ isNewUser, friends }) => {
  const navigate = useNavigate();

  const handleAddFriend = () => {
    navigate('/friends');
  };

  return (
    <Card className="bg-white/80 backdrop-blur-lg border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-gray-800">Recent Activity</CardTitle>
        <Button variant="ghost" className="text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 p-0 h-auto font-medium">
          All Activity
        </Button>
      </CardHeader>
      <CardContent>
        {isNewUser ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Start Your Journey</h3>
            <p className="text-gray-600 max-w-sm mx-auto mb-6 font-medium">
              Add some friends and send your first "Bro You Free?" invite to see your activity here.
            </p>
            <Button onClick={handleAddFriend} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300">
              Add Your First Friend
            </Button>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Activity Feed Coming Soon</h3>
            <p className="text-gray-600 max-w-sm mx-auto mb-4">
              Your recent hangouts and friend activity will appear here.
            </p>
            <p className="text-sm text-gray-500">
              You have {friends.length} {friends.length === 1 ? 'friend' : 'friends'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
