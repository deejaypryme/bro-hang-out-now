import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { getStatusColor, getStatusText, getAvatarFallback } from './friendProfileUtils';
import type { FriendWithProfile } from '@/types/database';

interface FriendProfileHeaderProps {
  friend: FriendWithProfile;
}

export const FriendProfileHeader: React.FC<FriendProfileHeaderProps> = ({ friend }) => {
  return (
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
  );
};