import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, MessageSquare, UserMinus, UserX } from 'lucide-react';
import type { FriendWithProfile } from '@/types/database';

interface FriendProfileActionsProps {
  friend: FriendWithProfile;
  loading: boolean;
  onToggleFavorite: () => void;
  onRemoveFriend: () => void;
  onBlockFriend: () => void;
}

export const FriendProfileActions: React.FC<FriendProfileActionsProps> = ({ 
  friend, 
  loading, 
  onToggleFavorite, 
  onRemoveFriend, 
  onBlockFriend 
}) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        variant="outline"
        onClick={onToggleFavorite}
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
        onClick={onRemoveFriend}
        disabled={loading}
        className="flex items-center gap-2 text-orange-600 hover:text-orange-700"
      >
        <UserMinus className="w-4 h-4" />
        Remove
      </Button>
      
      <Button
        variant="outline"
        onClick={onBlockFriend}
        disabled={loading}
        className="flex items-center gap-2 text-red-600 hover:text-red-700"
      >
        <UserX className="w-4 h-4" />
        Block
      </Button>
    </div>
  );
};