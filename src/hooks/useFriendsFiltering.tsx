import { useState, useEffect } from 'react';
import type { FriendWithProfile } from '@/types/database';

export const useFriendsFiltering = (friends: FriendWithProfile[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFriends, setFilteredFriends] = useState<FriendWithProfile[]>([]);

  // Filter friends based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFriends(friends);
    } else {
      const filtered = friends.filter(friend =>
        friend.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        friend.username?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFriends(filtered);
    }
  }, [friends, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    filteredFriends
  };
};