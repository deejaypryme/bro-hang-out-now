
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { formatDistanceToNow } from 'date-fns';
import type { HangoutWithDetails, FriendWithProfile } from '@/types/database';

interface ActivityFeedProps {
  isNewUser: boolean;
  friends: FriendWithProfile[];
  hangouts: HangoutWithDetails[];
}

interface ActivityItem {
  id: string;
  emoji: string;
  description: string;
  timestamp: Date;
  type: 'hangout_created' | 'hangout_confirmed' | 'hangout_completed' | 'friend_added';
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ isNewUser, friends, hangouts }) => {
  const navigate = useNavigate();

  const activities = useMemo(() => {
    const items: ActivityItem[] = [];

    // Hangout activities
    hangouts.forEach(h => {
      const friendName = h.friendName || 'a friend';
      if (h.status === 'pending') {
        items.push({
          id: `hangout-created-${h.id}`,
          emoji: h.activity_emoji || '📅',
          description: `You planned ${h.activity_name} with ${friendName}`,
          timestamp: new Date(h.created_at),
          type: 'hangout_created',
        });
      } else if (h.status === 'confirmed') {
        items.push({
          id: `hangout-confirmed-${h.id}`,
          emoji: h.activity_emoji || '✅',
          description: `${h.activity_name} with ${friendName} is confirmed!`,
          timestamp: new Date(h.updated_at),
          type: 'hangout_confirmed',
        });
      } else if (h.status === 'completed') {
        items.push({
          id: `hangout-completed-${h.id}`,
          emoji: h.activity_emoji || '🎉',
          description: `You hung out with ${friendName} — ${h.activity_name}`,
          timestamp: new Date(h.updated_at),
          type: 'hangout_completed',
        });
      }
    });

    // Friend added activities
    friends.forEach(f => {
      items.push({
        id: `friend-${f.id}`,
        emoji: '🤝',
        description: `You and ${f.full_name || f.username || 'someone'} are now friends`,
        timestamp: f.friendshipDate,
        type: 'friend_added',
      });
    });

    return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 15);
  }, [hangouts, friends]);

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
              onClick={() => navigate('/friends')} 
              variant="default"
              className="shadow-xl"
            >
              Add Your First Friend
            </Button>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-bro-xl">
            <div className="text-5xl mb-bro-md">📊</div>
            <p className="typo-body text-text-secondary">No recent activity yet. Schedule a hangout!</p>
          </div>
        ) : (
          <div className="space-y-bro-sm">
            {activities.map(activity => (
              <div
                key={activity.id}
                className="flex items-start gap-bro-md p-bro-md rounded-bro-lg hover:bg-white/10 transition-colors duration-200"
              >
                <span className="text-2xl flex-shrink-0 mt-0.5">{activity.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="typo-body text-primary-navy">{activity.description}</p>
                  <p className="typo-mono text-text-muted text-xs mt-bro-xs">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
