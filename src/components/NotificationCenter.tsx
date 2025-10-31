import React from 'react';
import { useFriendInvitations, useRespondToInvitation, useHangoutInvitations, useRespondToHangoutInvitation } from '@/hooks/useDatabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { Bell, User, Calendar, Check, X } from 'lucide-react';

interface NotificationCenterProps {
  onClose?: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
  const { data: friendInvitations = [], isLoading: loadingFriends } = useFriendInvitations();
  const { data: hangoutInvitations = [], isLoading: loadingHangouts } = useHangoutInvitations();
  const respondToInvitation = useRespondToInvitation();
  const respondToHangout = useRespondToHangoutInvitation();

  const handleFriendRequest = async (invitationId: string, response: 'accepted' | 'declined') => {
    try {
      await respondToInvitation.mutateAsync({ invitationId, status: response });
      toast({
        title: response === 'accepted' ? "Friend Added!" : "Request Declined",
        description: response === 'accepted' 
          ? "You're now friends! You can send them hangout invitations."
          : "Friend request declined",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to respond to friend request",
        variant: "destructive"
      });
    }
  };

  const handleHangoutRequest = async (invitationId: string, response: 'accepted' | 'declined') => {
    try {
      await respondToHangout.mutateAsync({ invitationId, response });
      toast({
        title: response === 'accepted' ? "Hangout Confirmed!" : "Hangout Declined",
        description: response === 'accepted' 
          ? "Your hangout has been added to your calendar!"
          : "Hangout request declined",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to respond to hangout request",
        variant: "destructive"
      });
    }
  };

  const pendingFriendInvitations = friendInvitations.filter(inv => inv.status === 'pending');
  const pendingHangoutInvitations = hangoutInvitations.filter(inv => inv.status === 'pending');
  const totalNotifications = pendingFriendInvitations.length + pendingHangoutInvitations.length;
  const loading = loadingFriends || loadingHangouts;

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notifications
          {totalNotifications > 0 && (
            <Badge variant="secondary" className="ml-2">
              {totalNotifications}
            </Badge>
          )}
        </CardTitle>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {totalNotifications === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No new notifications</p>
          </div>
        ) : (
          <>
            {/* Friend Requests */}
            {pendingFriendInvitations.map((invitation) => (
              <div key={invitation.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                <Avatar className="w-10 h-10">
                  <AvatarFallback>
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm">Friend Request</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    From: {invitation.inviterProfile?.full_name || invitation.inviterProfile?.username || 'Someone'}
                  </p>
                  {invitation.message && (
                    <p className="text-xs text-muted-foreground mb-3 italic">
                      "{invitation.message}"
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleFriendRequest(invitation.id, 'accepted')}
                      disabled={respondToInvitation.isPending}
                      className="flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFriendRequest(invitation.id, 'declined')}
                      disabled={respondToInvitation.isPending}
                      className="flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Decline
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {/* Hangout Requests */}
            {pendingHangoutInvitations.map((invitation) => (
              <div key={invitation.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                <Avatar className="w-10 h-10">
                  <AvatarFallback>
                    {invitation.hangout?.activity_emoji || '🤝'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm">Hangout Invitation</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    <strong>{invitation.hangout?.activity_name || 'Hangout'}</strong>
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">
                    {invitation.hangout?.scheduled_date && new Date(invitation.hangout.scheduled_date).toLocaleDateString()} at {invitation.hangout?.scheduled_time || 'TBD'}
                  </p>
                  {invitation.message && (
                    <p className="text-xs text-muted-foreground mb-3 italic">
                      "{invitation.message}"
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleHangoutRequest(invitation.id, 'accepted')}
                      disabled={respondToHangout.isPending}
                      className="flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleHangoutRequest(invitation.id, 'declined')}
                      disabled={respondToHangout.isPending}
                      className="flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Decline
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationCenter;
