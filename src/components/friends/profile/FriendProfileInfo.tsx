import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, Phone } from 'lucide-react';
import type { FriendWithProfile } from '@/types/database';

interface FriendProfileInfoProps {
  friend: FriendWithProfile;
}

export const FriendProfileInfo: React.FC<FriendProfileInfoProps> = ({ friend }) => {
  return (
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
  );
};