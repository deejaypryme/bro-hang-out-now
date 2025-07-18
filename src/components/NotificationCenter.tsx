import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { simpleSocialService, type FriendRequest, type HangoutRequest } from '@/services/simpleSocialService';
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
  const { user } = useAuth();
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [hangoutRequests, setHangoutRequests] = useState<HangoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadNotifications = async () => {
    if (!user) return;
    
    try {
      const [friends, hangouts] = await Promise.all([
        simpleSocialService.getFriendRequests(),
        simpleSocialService.getHangoutRequests()
      ]);
      
      setFriendRequests(friends);
      setHangoutRequests(hangouts);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const handleFriendRequest = async (requestId: string, response: 'accepted' | 'declined') => {
    setProcessingId(requestId);
    try {
      await simpleSocialService.respondToFriendRequest(requestId, response);
      toast({
        title: response === 'accepted' ? "Friend Added!" : "Request Declined",
        description: response === 'accepted' 
          ? "You're now friends! You can send them hangout invitations."
          : "Friend request declined",
      });
      loadNotifications();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to respond to friend request",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleHangoutRequest = async (requestId: string, response: 'accepted' | 'declined') => {
    setProcessingId(requestId);
    try {
      await simpleSocialService.respondToHangoutRequest(requestId, response);
      toast({
        title: response === 'accepted' ? "Hangout Confirmed!" : "Hangout Declined",
        description: response === 'accepted' 
          ? "Your hangout has been added to your calendar!"
          : "Hangout request declined",
      });
      loadNotifications();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to respond to hangout request",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const totalNotifications = friendRequests.length + hangoutRequests.length;

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
            {friendRequests.map((request) => (
              <div key={request.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
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
                    Someone wants to be your friend
                  </p>
                  {request.message && (
                    <p className="text-xs text-muted-foreground mb-3 italic">
                      "{request.message}"
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleFriendRequest(request.id, 'accepted')}
                      disabled={processingId === request.id}
                      className="flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFriendRequest(request.id, 'declined')}
                      disabled={processingId === request.id}
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
            {hangoutRequests.map((request) => (
              <div key={request.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                <Avatar className="w-10 h-10">
                  <AvatarFallback>
                    {request.activity_emoji}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm">Hangout Invitation</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    <strong>{request.activity_name}</strong>
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">
                    {new Date(request.proposed_date).toLocaleDateString()} at {request.proposed_time}
                  </p>
                  {request.message && (
                    <p className="text-xs text-muted-foreground mb-3 italic">
                      "{request.message}"
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleHangoutRequest(request.id, 'accepted')}
                      disabled={processingId === request.id}
                      className="flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleHangoutRequest(request.id, 'declined')}
                      disabled={processingId === request.id}
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