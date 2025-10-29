import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { simpleSocialService } from '@/services/simpleSocialService';
import { useFriends } from '@/hooks/useDatabase'; 
import SimpleHangoutInvite from '../components/SimpleHangoutInvite';
import { type Activity, type EmotionalSignal } from '../data/activities';
import { activities } from '../data/activities';
import { ArrowLeft, Calendar, Users } from 'lucide-react';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { InvitePageSkeleton } from '../components/LoadingFallback';

const Invite = () => {
  const navigate = useNavigate();
  const { data: friends = [], isLoading: friendsLoading } = useFriends();
  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  if (friendsLoading) {
    return (
      <div className="min-h-screen hero-background">
        <header className="glass-surface border-b border-white/20 sticky top-0 z-20 shadow-xl">
          <div className="max-w-4xl mx-auto px-bro-lg py-bro-lg">
            <div className="flex items-center gap-bro-lg">
              <Button
                variant="ghost"
                onClick={() => navigate('/home')}
                className="flex items-center gap-bro-sm text-primary-navy hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div className="flex items-center gap-bro-md">
                <div className="w-10 h-10 bg-gradient-to-r from-accent-orange to-accent-light rounded-bro-lg flex items-center justify-center text-xl text-white shadow-lg">
                  📅
                </div>
                <div>
                  <h1 className="typo-title-lg text-primary-navy">Quick Hangout Invite</h1>
                  <p className="typo-mono text-text-secondary">Choose a friend and activity</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        <InvitePageSkeleton />
      </div>
    );
  }

  const handleInviteSuccess = () => {
    setInviteDialogOpen(false);
    setSelectedFriend(null);
    setSelectedActivity(null);
    navigate('/home');
  };

  const openInviteDialog = (friend: any, activity: Activity) => {
    setSelectedFriend(friend);
    setSelectedActivity(activity);
    setInviteDialogOpen(true);
  };

  return (
    <div className="min-h-screen hero-background">
      {/* Header */}
      <header className="glass-surface border-b border-white/20 sticky top-0 z-20 shadow-xl">
        <div className="max-w-4xl mx-auto px-bro-lg py-bro-lg">
          <div className="flex items-center gap-bro-lg">
            <Button
              variant="ghost"
              onClick={() => navigate('/home')}
              className="flex items-center gap-bro-sm text-primary-navy hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex items-center gap-bro-md">
              <div className="w-10 h-10 bg-gradient-to-r from-accent-orange to-accent-light rounded-bro-lg flex items-center justify-center text-xl text-white shadow-lg">
                📅
              </div>
              <div>
                <h1 className="typo-title-lg text-primary-navy">Quick Hangout Invite</h1>
                <p className="typo-mono text-text-secondary">Choose a friend and activity</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-bro-xl px-bro-lg space-y-bro-xl">
        {friends.length === 0 ? (
          <Card variant="glass" className="text-center py-bro-4xl">
            <CardContent>
              <div className="text-8xl mb-bro-lg animate-bounce">👥</div>
              <h3 className="typo-headline-md text-primary-navy mb-bro-md">No Friends Yet</h3>
              <p className="typo-body text-text-secondary mb-bro-xl max-w-md mx-auto">
                You need friends to send hangout invitations. Add some friends first to get started!
              </p>
              <div className="flex flex-col sm:flex-row gap-bro-md justify-center">
                <Button 
                  onClick={() => navigate('/friends')} 
                  size="lg"
                  className="shadow-xl"
                >
                  <Users className="w-4 h-4 mr-bro-sm" />
                  Add Friends
                </Button>
              </div>
              <div className="mt-bro-xl pt-bro-xl border-t border-white/20 max-w-md mx-auto">
                <p className="typo-mono text-text-muted text-sm">
                  💡 Tip: Once you add friends, you can quickly invite them to hangouts from this page
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Friends Section */}
            <div>
              <h2 className="typo-title-lg text-white mb-bro-lg">Choose a Friend</h2>
              <div className="grid gap-bro-md md:grid-cols-2 lg:grid-cols-3">
                {friends.map((friend) => (
                  <Card key={friend.id} variant="glass" className="hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center gap-bro-md pb-bro-md">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-gradient-to-r from-accent-orange to-accent-light text-white">
                          {(friend.full_name || friend.username || 'U')[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-primary-navy text-sm truncate">
                          {friend.full_name || friend.username || 'Unknown User'}
                        </CardTitle>
                        {friend.username && friend.full_name && (
                          <p className="typo-mono text-text-secondary text-xs truncate">@{friend.username}</p>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 gap-bro-xs">
                        {activities.slice(0, 4).map((activity) => (
                          <Button
                            key={activity.id}
                            variant="outline"
                            size="sm"
                            onClick={() => openInviteDialog(friend, activity)}
                            className="flex items-center gap-bro-xs text-xs h-8"
                          >
                            <span className="text-sm">{activity.emoji}</span>
                            <span className="truncate">{activity.name}</span>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* All Activities Section */}
            <div>
              <h2 className="typo-title-lg text-white mb-bro-lg">Or Browse All Activities</h2>
              <div className="grid gap-bro-md sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {activities.map((activity) => (
                  <Card key={activity.id} variant="glass" className="hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-bro-md text-center">
                      <div className="text-3xl mb-bro-sm">{activity.emoji}</div>
                      <h3 className="typo-body font-medium text-primary-navy mb-bro-xs">{activity.name}</h3>
                      <p className="typo-mono text-text-secondary text-xs mb-bro-md">{activity.category}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          if (friends.length === 1) {
                            openInviteDialog(friends[0], activity);
                          } else {
                            toast({
                              title: "Choose a Friend",
                              description: "Select a friend from the list above first",
                            });
                          }
                        }}
                      >
                        Invite
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Hangout Invite</DialogTitle>
          </DialogHeader>
          {selectedFriend && selectedActivity && (
            <SimpleHangoutInvite
              friendId={selectedFriend.id}
              friendName={selectedFriend.full_name || selectedFriend.username || 'Friend'}
              activityName={selectedActivity.name}
              activityEmoji={selectedActivity.emoji}
              onSuccess={handleInviteSuccess}
              onCancel={() => setInviteDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Invite;
