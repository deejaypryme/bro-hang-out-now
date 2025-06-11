
import React from 'react';
import { Plus } from 'lucide-react';
import { type Friend } from '../data/mockData';

interface FriendSelectionProps {
  friends: Friend[];
  selectedFriend: Friend | null;
  onSelectFriend: (friend: Friend) => void;
}

const FriendSelection: React.FC<FriendSelectionProps> = ({
  friends,
  selectedFriend,
  onSelectFriend
}) => {
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500',
      'bg-orange-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500'
    ];
    return colors[name.length % colors.length];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-success';
      case 'busy': return 'bg-warning';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (friend: Friend) => {
    switch (friend.status) {
      case 'online': return 'Available now';
      case 'busy': return 'Busy';
      default: return `Last seen ${friend.lastSeen.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
  };

  return (
    <div className="space-lg animate-slide-up">
      <div className="space-sm">
        <h3 className="heading-3 text-primary">Who do you want to hang with?</h3>
        <p className="body text-secondary">Select a friend to send your invite to</p>
      </div>
      
      <div className="space-sm">
        {friends.map((friend) => (
          <div
            key={friend.id}
            onClick={() => onSelectFriend(friend)}
            className={`
              card-interactive p-sm space-xs touch-target transition-all duration-200 cursor-pointer
              ${selectedFriend?.id === friend.id ? 'border-primary bg-primary/5 shadow-md scale-[1.02]' : 'hover:border-primary/30 hover:bg-primary/5'}
            `}
          >
            <div className="flex items-center gap-sm">
              <div className="relative flex-shrink-0">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${getAvatarColor(friend.name)}`}>
                  {friend.avatar}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(friend.status)}`}></div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="body-large font-semibold text-primary">{friend.name}</div>
                <div className="body text-secondary">{getStatusText(friend)}</div>
                <div className="caption text-muted">
                  Usually free {friend.preferredTimes.join(', ')}
                </div>
              </div>
              
              {selectedFriend?.id === friend.id && (
                <div className="text-primary flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
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
      
      <button className="w-full p-sm text-center touch-target card-interactive border-2 border-dashed border-primary/30 text-primary hover:border-primary hover:bg-primary/5 transition-all duration-200">
        <div className="flex items-center justify-center gap-xs">
          <Plus className="w-5 h-5" />
          <span className="body font-medium">Add a new friend</span>
        </div>
      </button>
    </div>
  );
};

export default FriendSelection;
