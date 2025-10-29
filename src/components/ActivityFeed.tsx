
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
    <Card variant="glass" className="shadow-xl border-white/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="typo-title-md text-primary-navy">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isNewUser ? (
          <div className="text-center py-bro-2xl">
            <div className="text-6xl mb-bro-lg animate-bounce">🎯</div>
            <h3 className="typo-title-md text-primary-navy mb-bro-sm">Start Your Journey</h3>
            <p className="typo-body text-text-secondary max-w-sm mx-auto mb-bro-lg">
              Add friends and send your first "Bro You Free?" invite to see your activity here.
            </p>
            <Button 
              onClick={handleAddFriend} 
              variant="default"
              className="shadow-xl"
            >
              Add Your First Friend
            </Button>
          </div>
        ) : (
          <div className="text-center py-bro-2xl">
            <div className="text-6xl mb-bro-lg">📊</div>
            <h3 className="typo-title-md text-primary-navy mb-bro-sm">Your Activity Will Appear Here</h3>
            <p className="typo-body text-text-secondary max-w-sm mx-auto mb-bro-md">
              After your first hangout, you'll see recent activity and updates from your squad.
            </p>
            <div className="inline-flex items-center gap-bro-sm px-bro-md py-bro-sm bg-accent-orange/10 rounded-bro-lg">
              <span className="typo-mono text-accent-orange font-semibold">
                {friends.length} {friends.length === 1 ? 'friend' : 'friends'} added
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
