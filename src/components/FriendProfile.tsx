
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Heart, 
  MessageSquare, 
  Phone, 
  Clock, 
  UserMinus, 
  UserX, 
  Save,
  Star,
  Calendar
} from 'lucide-react';
import { friendsService } from '@/services/friendsService';
import { useToast } from '@/hooks/use-toast';
import type { FriendWithProfile } from '@/types/database';

interface FriendProfileProps {
  friend: FriendWithProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFriendUpdated?: () => void;
}

const FriendProfile: React.FC<FriendProfileProps> = ({ 
  friend, 
  open, 
  onOpenChange, 
  onFriendUpdated 
}) => {
  const [notes, setNotes] = useState(friend?.notes || '');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (friend) {
      setNotes(friend.notes || '');
    }
  }, [friend]);

  if (!friend) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-orange-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'busy': return 'Busy';
      case 'away': return 'Away';
      default: return 'Offline';
    }
  };

  const handleSaveNotes = async () => {
    setLoading(true);
    try {
      await friendsService.updateFriendNotes(friend.friendshipId, notes);
      toast({
        title: "Notes Updated",
        description: "Friend notes have been saved successfully."
      });
      if (onFriendUpdated) onFriendUpdated();
    } catch (error) {
      toast({
        title: "Failed to Update Notes",
        description: "Could not save notes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    setLoading(true);
    try {
      await friendsService.toggleFriendFavorite(friend.friendshipId, !friend.favorite);
      toast({
        title: friend.favorite ? "Removed from Favorites" : "Added to Favorites",
        description: `${friend.full_name} has been ${friend.favorite ? 'removed from' : 'added to'} your favorites.`
      });
      if (onFriendUpdated) onFriendUpdated();
    } catch (error) {
      toast({
        title: "Failed to Update Favorite",
        description: "Could not update favorite status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!confirm(`Are you sure you want to remove ${friend.full_name} from your friends?`)) {
      return;
    }

    setLoading(true);
    try {
      await friendsService.removeFriend(friend.friendshipId);
      toast({
        title: "Friend Removed",
        description: `${friend.full_name} has been removed from your friends.`
      });
      onOpenChange(false);
      if (onFriendUpdated) onFriendUpdated();
    } catch (error) {
      toast({
        title: "Failed to Remove Friend",
        description: "Could not remove friend. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBlockFriend = async () => {
    if (!confirm(`Are you sure you want to block ${friend.full_name}? This will remove them from your friends and prevent future communication.`)) {
      return;
    }

    setLoading(true);
    try {
      await friendsService.blockFriend(friend.friendshipId, friend.id);
      toast({
        title: "Friend Blocked",
        description: `${friend.full_name} has been blocked.`
      });
      onOpenChange(false);
      if (onFriendUpdated) onFriendUpdated();
    } catch (error) {
      toast({
        title: "Failed to Block Friend",
        description: "Could not block friend. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getAvatarFallback = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Friend Profile</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-semibold">
                {getAvatarFallback(friend.full_name || friend.username || '')}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${getStatusColor(friend.status)}`}></div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{friend.full_name || friend.username}</h3>
                {friend.favorite && (
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                )}
              </div>
              {friend.username && <p className="text-sm text-gray-500">@{friend.username}</p>}
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {getStatusText(friend.status)}
                </Badge>
                {friend.customMessage && (
                  <span className="text-xs text-gray-500">"{friend.customMessage}"</span>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Friend Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Friends since</span>
              </div>
              <span>{friend.friendshipDate.toLocaleDateString()}</span>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Last seen</span>
              </div>
              <span>{friend.lastSeen.toLocaleString()}</span>
              
              {friend.phone && (
                <>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Phone</span>
                  </div>
                  <span>{friend.phone}</span>
                </>
              )}
            </div>

            {friend.preferred_times.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Preferred Times</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {friend.preferred_times.map((time, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {time}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Notes Section */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add personal notes about this friend..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
            <Button 
              onClick={handleSaveNotes} 
              disabled={loading || notes === friend.notes}
              size="sm"
              className="w-full"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Notes
            </Button>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleToggleFavorite}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Heart className={`w-4 h-4 ${friend.favorite ? 'fill-current text-red-500' : ''}`} />
              {friend.favorite ? 'Unfavorite' : 'Favorite'}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {/* TODO: Open hangout creation */}}
              className="flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Hang Out
            </Button>
            
            <Button
              variant="outline"
              onClick={handleRemoveFriend}
              disabled={loading}
              className="flex items-center gap-2 text-orange-600 hover:text-orange-700"
            >
              <UserMinus className="w-4 h-4" />
              Remove
            </Button>
            
            <Button
              variant="outline"
              onClick={handleBlockFriend}
              disabled={loading}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <UserX className="w-4 h-4" />
              Block
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FriendProfile;
