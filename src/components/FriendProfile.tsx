import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { friendsService } from '@/services/friendsService';
import { useToast } from '@/hooks/use-toast';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { FriendProfileHeader } from '@/components/friends/profile/FriendProfileHeader';
import { FriendProfileInfo } from '@/components/friends/profile/FriendProfileInfo';
import { FriendProfileNotes } from '@/components/friends/profile/FriendProfileNotes';
import { FriendProfileActions } from '@/components/friends/profile/FriendProfileActions';
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
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [optimisticHidden, setOptimisticHidden] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (friend) {
      setNotes(friend.notes || '');
    }
  }, [friend]);

  if (!friend) return null;

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
    // Optimistic update
    setOptimisticHidden(true);
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
      // Revert optimistic update on error
      setOptimisticHidden(false);
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
    // Optimistic update
    setOptimisticHidden(true);
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
      // Revert optimistic update on error
      setOptimisticHidden(false);
      toast({
        title: "Failed to Block Friend",
        description: "Could not block friend. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open && !optimisticHidden} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Friend Profile</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <FriendProfileHeader friend={friend} />
            
            <Separator />
            
            <FriendProfileInfo friend={friend} />
            
            <Separator />
            
            <FriendProfileNotes
              friend={friend}
              notes={notes}
              setNotes={setNotes}
              onSaveNotes={handleSaveNotes}
              loading={loading}
            />
            
            <Separator />
            
            <FriendProfileActions
              friend={friend}
              loading={loading}
              onToggleFavorite={handleToggleFavorite}
              onRemoveFriend={() => setShowRemoveDialog(true)}
              onBlockFriend={() => setShowBlockDialog(true)}
            />
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={showRemoveDialog}
        onOpenChange={setShowRemoveDialog}
        title="Remove Friend"
        description={`Are you sure you want to remove ${friend.full_name} from your friends?`}
        confirmText="Remove"
        onConfirm={() => {
          setShowRemoveDialog(false);
          handleRemoveFriend();
        }}
        variant="default"
      />

      <ConfirmationDialog
        open={showBlockDialog}
        onOpenChange={setShowBlockDialog}
        title="Block Friend"
        description={`Are you sure you want to block ${friend.full_name}? This will remove them from your friends and prevent future communication.`}
        confirmText="Block"
        onConfirm={() => {
          setShowBlockDialog(false);
          handleBlockFriend();
        }}
        variant="destructive"
      />
    </>
  );
};

export default FriendProfile;