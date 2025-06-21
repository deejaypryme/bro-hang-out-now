
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, X, Clock, Mail, Phone, User } from 'lucide-react';
import { friendsService } from '@/services/friendsService';
import { useToast } from '@/hooks/use-toast';
import type { FriendInvitationWithProfile } from '@/types/database';

interface FriendInvitationsProps {
  invitations: FriendInvitationWithProfile[];
  onInvitationUpdated?: () => void;
}

const FriendInvitations: React.FC<FriendInvitationsProps> = ({ 
  invitations, 
  onInvitationUpdated 
}) => {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleRespondToInvitation = async (invitationId: string, status: 'accepted' | 'declined') => {
    setLoading(invitationId);
    try {
      await friendsService.respondToInvitation(invitationId, status);
      
      toast({
        title: status === 'accepted' ? "Invitation Accepted!" : "Invitation Declined",
        description: `Friend invitation has been ${status}.`
      });
      
      if (onInvitationUpdated) {
        onInvitationUpdated();
      }
    } catch (error) {
      toast({
        title: "Failed to Respond",
        description: "Could not respond to invitation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const getInvitationType = (invitation: FriendInvitationWithProfile) => {
    if (invitation.invitee_email) return { type: 'email', icon: Mail, value: invitation.invitee_email };
    if (invitation.invitee_phone) return { type: 'phone', icon: Phone, value: invitation.invitee_phone };
    return { type: 'user', icon: User, value: invitation.inviteeProfile?.full_name || 'Unknown User' };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getAvatarFallback = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const sentInvitations = invitations.filter(inv => inv.inviter_id !== inv.invitee_id);
  const receivedInvitations = invitations.filter(inv => inv.inviter_id !== inv.invitee_id);

  if (invitations.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Friend Invitations</h3>
          <p className="text-gray-500">When you receive friend invitations, they'll appear here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Received Invitations */}
      {receivedInvitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Received Invitations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {receivedInvitations.map((invitation) => {
              const invitationType = getInvitationType(invitation);
              const IconComponent = invitationType.icon;
              
              return (
                <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {getAvatarFallback(invitation.inviterProfile?.full_name || invitation.inviterProfile?.username || '')}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {invitation.inviterProfile?.full_name || invitation.inviterProfile?.username || 'Unknown User'}
                        </p>
                        <Badge className={getStatusColor(invitation.status)}>
                          {invitation.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <IconComponent className="w-4 h-4" />
                        <span>via {invitationType.type}</span>
                      </div>
                      
                      {invitation.message && (
                        <p className="text-sm text-gray-600 mt-2 italic">
                          "{invitation.message}"
                        </p>
                      )}
                      
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(invitation.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  {invitation.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleRespondToInvitation(invitation.id, 'accepted')}
                        disabled={loading === invitation.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRespondToInvitation(invitation.id, 'declined')}
                        disabled={loading === invitation.id}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Sent Invitations */}
      {sentInvitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sent Invitations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sentInvitations.map((invitation) => {
              const invitationType = getInvitationType(invitation);
              const IconComponent = invitationType.icon;
              
              return (
                <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {getAvatarFallback(invitationType.value)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{invitationType.value}</p>
                        <Badge className={getStatusColor(invitation.status)}>
                          {invitation.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <IconComponent className="w-4 h-4" />
                        <span>via {invitationType.type}</span>
                      </div>
                      
                      {invitation.message && (
                        <p className="text-sm text-gray-600 mt-2 italic">
                          "{invitation.message}"
                        </p>
                      )}
                      
                      <p className="text-xs text-gray-400 mt-1">
                        Sent {new Date(invitation.created_at).toLocaleDateString()}
                        {invitation.status === 'pending' && (
                          <span> • Expires {new Date(invitation.expires_at).toLocaleDateString()}</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FriendInvitations;
