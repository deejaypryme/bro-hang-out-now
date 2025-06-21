
import React from 'react';
import { Plus } from 'lucide-react';
import { useFriends } from '@/hooks/useDatabase';
import type { FriendWithProfile } from '@/types/database';
import AddFriendModal from './AddFriendModal';

interface FriendSelectionProps {
  selectedFriend: FriendWithProfile | null;
  onSelectFriend: (friend: FriendWithProfile) => void;
}

const FriendSelection: React.FC<FriendSelectionProps> = ({
  selectedFriend,
  onSelectFriend
}) => {
  const { data: friends = [], isLoading, refetch } = useFriends();

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500',
      'bg-orange-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500'
    ];
    return colors[name.length % colors.length];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-orange-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (friend: FriendWithProfile) => {
    switch (friend.status) {
      case 'online': return 'Available now';
      case 'busy': return 'Busy';
      case 'away': return 'Away';
      default: return `Last seen ${friend.lastSeen.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
  };

  const getAvatarFallback = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900">Who do you want to hang with?</h3>
          <p className="text-sm text-gray-600">Loading your friends...</p>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-gray-100 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900">Who do you want to hang with?</h3>
          <p className="text-sm text-gray-600">You don't have any friends yet</p>
        </div>
        
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Friends Yet</h4>
          <p className="text-gray-500 mb-4">Add some friends to start planning hangouts!</p>
          <AddFriendModal onFriendAdded={() => refetch()} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-gray-900">Who do you want to hang with?</h3>
        <p className="text-sm text-gray-600">Select a friend to send your invite to</p>
      </div>
      
      <div className="space-y-3">
        {friends.map((friend) => (
          <div
            key={friend.id}
            onClick={() => onSelectFriend(friend)}
            className={`
              p-4 transition-all duration-200 cursor-pointer rounded-xl border-2
              ${selectedFriend?.id === friend.id 
                ? 'bg-blue-50 border-blue-500 shadow-md' 
                : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${getAvatarColor(friend.full_name || friend.username || '')}`}>
                  {getAvatarFallback(friend.full_name || friend.username || '')}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(friend.status)}`}></div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="text-base font-semibold text-gray-900">
                  {friend.full_name || friend.username}
                </div>
                <div className="text-sm text-gray-600">{getStatusText(friend)}</div>
                {friend.preferred_times.length > 0 && (
                  <div className="text-xs text-gray-500">
                    Usually free {friend.preferred_times.join(', ')}
                  </div>
                )}
                {friend.customMessage && (
                  <div className="text-xs text-gray-500 italic">
                    "{friend.customMessage}"
                  </div>
                )}
              </div>
              
              {selectedFriend?.id === friend.id && (
                <div className="text-blue-500 flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <AddFriendModal onFriendAdded={() => refetch()} />
    </div>
  );
};

export default FriendSelection;
