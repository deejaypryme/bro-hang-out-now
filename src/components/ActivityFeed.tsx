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
      iconBg: 'bg-success/10 text-success',
      text: 'Confirmed hangout with Mike Johnson',
      timeAgo: '2 hours ago',
      actionable: false,
    },
    {
      id: 2,
      icon: '📱',
      iconBg: 'bg-primary/10 text-primary',
      text: 'Alex Chen responded to your BYF invite',
      timeAgo: '5 hours ago',
      actionable: true,
      actionText: 'View',
    },
    {
      id: 3,
      icon: '🏆',
      iconBg: 'bg-accent/10 text-accent',
      text: 'Earned "Wingman of the Week" badge!',
      timeAgo: '1 day ago',
      actionable: false,
    },
    {
      id: 4,
      icon: '👥',
      iconBg: 'bg-secondary/10 text-secondary',
      text: 'Ryan Davis joined BroYouFree',
      timeAgo: '2 days ago',
      actionable: true,
      actionText: 'Say Hi',
    },
  ];

  return (
    <Card className="bg-bg-primary border-custom">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        <Button variant="ghost" className="text-sm text-text-secondary p-0 h-auto">
          All Activity
        </Button>
      </CardHeader>
      <CardContent>
        {isNewUser ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold mb-2">Start Your Journey</h3>
            <p className="text-text-muted max-w-sm mx-auto mb-6">
              Add some friends and send your first "Bro You Free?" invite to see your activity here.
            </p>
            <Button onClick={handleAddFriend} className="btn-primary px-6 py-3 rounded-lg font-semibold">
              Add Your First Friend
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {mockActivity.map(item => (
              <div 
                key={item.id} 
                className="flex items-start gap-4 p-3 hover:bg-bg-secondary rounded-lg transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.iconBg}`}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium mb-1 text-sm">{item.text}</p>
                  <p className="text-sm text-text-muted">{item.timeAgo}</p>
                </div>
                {item.actionable && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-primary text-xs px-3 py-1 border-primary"
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
