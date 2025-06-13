
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

  const mockActivity = [
    {
      id: 1,
      icon: '🎯',
      iconBg: 'bg-green-100 text-green-600',
      text: 'Confirmed hangout with Mike Johnson',
      timeAgo: '2 hours ago',
      actionable: false,
    },
    {
      id: 2,
      icon: '📱',
      iconBg: 'bg-blue-100 text-blue-600',
      text: 'Alex Chen responded to your BYF invite',
      timeAgo: '5 hours ago',
      actionable: true,
      actionText: 'View',
    },
    {
      id: 3,
      icon: '🏆',
      iconBg: 'bg-yellow-100 text-yellow-600',
      text: 'Earned "Wingman of the Week" badge!',
      timeAgo: '1 day ago',
      actionable: false,
    },
    {
      id: 4,
      icon: '👥',
      iconBg: 'bg-purple-100 text-purple-600',
      text: 'Ryan Davis joined BroYouFree',
      timeAgo: '2 days ago',
      actionable: true,
      actionText: 'Say Hi',
    },
  ];

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
          <div className="space-y-4">
            {mockActivity.map(item => (
              <div 
                key={item.id} 
                className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.iconBg}`}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium mb-1 text-sm text-gray-800">{item.text}</p>
                  <p className="text-sm text-gray-600">{item.timeAgo}</p>
                </div>
                {item.actionable && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50 text-xs px-3 py-1 font-medium"
                  >
                    {item.actionText}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
