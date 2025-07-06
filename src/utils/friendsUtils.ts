import type { FriendWithProfile } from '@/types/database';

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'online': return 'bg-green-500';
    case 'busy': return 'bg-orange-500';
    case 'away': return 'bg-yellow-500';
    default: return 'bg-gray-400';
  }
};

export const getStatusText = (friend: FriendWithProfile): string => {
  switch (friend.status) {
    case 'online': return 'Available now';
    case 'busy': return 'Busy';
    case 'away': return 'Away';
    default: return `Last seen ${friend.lastSeen.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
};

export const getAvatarFallback = (name: string): string => {
  return name ? name.charAt(0).toUpperCase() : '?';
};

export const categorizeFriends = (friends: FriendWithProfile[]) => {
  // Defensive data handling
  const safeFriends = Array.isArray(friends) ? friends : [];
  
  const favoriteFriends = safeFriends.filter(friend => friend.favorite);
  const onlineFriends = safeFriends.filter(friend => friend.status === 'online' && !friend.favorite);
  const offlineFriends = safeFriends.filter(friend => friend.status !== 'online' && !friend.favorite);
  
  return { favoriteFriends, onlineFriends, offlineFriends };
};