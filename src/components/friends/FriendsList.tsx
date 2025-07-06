import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import FriendCard from './FriendCard';
import type { FriendWithProfile } from '@/types/database';

interface FriendsListProps {
  favoriteFriends: FriendWithProfile[];
  onlineFriends: FriendWithProfile[];
  offlineFriends: FriendWithProfile[];
  onFriendClick: (friend: FriendWithProfile) => void;
}

const FriendsList = ({ 
  favoriteFriends = [], 
  onlineFriends = [], 
  offlineFriends = [], 
  onFriendClick 
}: FriendsListProps) => {
  // Defensive data handling
  const safeFavoriteFriends = Array.isArray(favoriteFriends) ? favoriteFriends : [];
  const safeOnlineFriends = Array.isArray(onlineFriends) ? onlineFriends : [];
  const safeOfflineFriends = Array.isArray(offlineFriends) ? offlineFriends : [];
  
  return (
    <div className="space-y-bro-xl">
      {/* Favorite Friends */}
      {safeFavoriteFriends.length > 0 && (
        <Card variant="glass" className="shadow-xl border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-bro-sm typo-title-md text-primary-navy">
              <Star className="w-5 h-5 text-yellow-500" />
              Favorites
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-bro-md">
            {safeFavoriteFriends.map((friend) => (
              <FriendCard
                key={friend.id}
                friend={friend}
                onClick={onFriendClick}
                variant="favorite"
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Online Friends */}
      {safeOnlineFriends.length > 0 && (
        <Card variant="glass" className="shadow-xl border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-bro-sm typo-title-md text-primary-navy">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              Online ({safeOnlineFriends.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-bro-md">
            {safeOnlineFriends.map((friend) => (
              <FriendCard
                key={friend.id}
                friend={friend}
                onClick={onFriendClick}
                variant="online"
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Offline Friends */}
      {safeOfflineFriends.length > 0 && (
        <Card variant="glass" className="shadow-xl border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-bro-sm typo-title-md text-primary-navy">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              Offline ({safeOfflineFriends.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-bro-md">
            {safeOfflineFriends.map((friend) => (
              <FriendCard
                key={friend.id}
                friend={friend}
                onClick={onFriendClick}
                variant="offline"
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FriendsList;