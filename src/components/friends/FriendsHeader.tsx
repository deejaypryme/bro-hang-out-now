import React from 'react';
import AddFriendModal from '@/components/AddFriendModal';
import type { FriendWithProfile } from '@/types/database';

interface FriendsHeaderProps {
  friends: FriendWithProfile[];
  onlineFriendsCount: number;
  onFriendAdded: () => void;
}

const FriendsHeader = ({ friends = [], onlineFriendsCount = 0, onFriendAdded }: FriendsHeaderProps) => {
  // Defensive check for friends data
  const safeFriends = Array.isArray(friends) ? friends : [];
  const safeOnlineCount = typeof onlineFriendsCount === 'number' ? onlineFriendsCount : 0;
  
  return (
    <div className="flex items-center justify-between mb-bro-2xl">
      <div>
        <h1 className="typo-headline-lg text-white mb-bro-sm">Friends</h1>
        <p className="typo-body text-white/80">
          {safeFriends.length} friends • {safeOnlineCount} online
        </p>
      </div>
      <AddFriendModal onFriendAdded={onFriendAdded} />
    </div>
  );
};

export default FriendsHeader;