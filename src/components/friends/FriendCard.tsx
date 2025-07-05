import React from 'react';
import { Button } from '@/components/ui/button';
import { Star, MessageSquare } from 'lucide-react';
import { getStatusColor, getStatusText, getAvatarFallback } from '@/utils/friendsUtils';
import type { FriendWithProfile } from '@/types/database';

interface FriendCardProps {
  friend: FriendWithProfile;
  onClick: (friend: FriendWithProfile) => void;
  variant?: 'favorite' | 'online' | 'offline';
}

const FriendCard = ({ friend, onClick, variant = 'online' }: FriendCardProps) => {
  const getAvatarBackground = () => {
    switch (variant) {
      case 'favorite':
      case 'online':
        return 'bg-gradient-to-r from-accent-orange to-accent-light';
      case 'offline':
        return 'bg-gray-500';
      default:
        return 'bg-gradient-to-r from-accent-orange to-accent-light';
    }
  };

  const getNameColor = () => {
    switch (variant) {
      case 'favorite':
      case 'online':
        return 'text-primary-navy';
      case 'offline':
        return 'text-text-secondary';
      default:
        return 'text-primary-navy';
    }
  };

  const getStatusTextColor = () => {
    switch (variant) {
      case 'favorite':
      case 'online':
        return 'text-text-secondary';
      case 'offline':
        return 'text-text-muted';
      default:
        return 'text-text-secondary';
    }
  };

  const getButtonColor = () => {
    switch (variant) {
      case 'favorite':
      case 'online':
        return 'text-accent-orange hover:bg-accent-orange/10';
      case 'offline':
        return 'text-text-secondary hover:bg-white/10';
      default:
        return 'text-accent-orange hover:bg-accent-orange/10';
    }
  };

  return (
    <div
      onClick={() => onClick(friend)}
      className="flex items-center gap-bro-md p-bro-md rounded-bro-lg hover:bg-white/10 cursor-pointer transition-all duration-300 hover:scale-102"
    >
      <div className="relative">
        <div className={`w-12 h-12 ${getAvatarBackground()} rounded-full flex items-center justify-center text-white typo-body font-semibold shadow-lg`}>
          {getAvatarFallback(friend.full_name || friend.username || '')}
        </div>
        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(friend.status)}`}></div>
      </div>
      
      <div className="flex-1 min-w-0">
        {variant === 'favorite' && (
          <div className="flex items-center gap-bro-sm">
            <h3 className={`typo-body font-semibold ${getNameColor()} truncate`}>
              {friend.full_name || friend.username}
            </h3>
            <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
          </div>
        )}
        {variant !== 'favorite' && (
          <h3 className={`typo-body font-semibold ${getNameColor()} truncate`}>
            {friend.full_name || friend.username}
          </h3>
        )}
        <p className={`typo-mono ${getStatusTextColor()}`}>{getStatusText(friend)}</p>
        {friend.customMessage && (
          <p className="typo-mono text-text-muted italic truncate">"{friend.customMessage}"</p>
        )}
        {variant === 'offline' && friend.notes && (
          <p className="typo-mono text-text-muted italic truncate">Note: {friend.notes}</p>
        )}
      </div>
      
      <div className="flex gap-bro-xs">
        <Button size="sm" variant="ghost" className={`h-8 w-8 p-0 ${getButtonColor()}`}>
          <MessageSquare className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default FriendCard;