
import React from 'react';
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
      'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500'
    ];
    return colors[name.length % colors.length];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-success';
      case 'busy': return 'bg-accent';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary">Who do you want to hang with?</h3>
      
      <div className="space-y-2">
        {friends.map((friend) => (
          <div
            key={friend.id}
            onClick={() => onSelectFriend(friend)}
            className={`
              flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 hover:scale-[1.02]
              ${selectedFriend?.id === friend.id
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-custom hover:border-primary/30 bg-bg-primary'
              }
            `}
          >
            <div className="relative">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${getAvatarColor(friend.name)}`}>
                {friend.avatar}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(friend.status)}`}></div>
            </div>
            
            <div className="flex-1">
              <div className="font-medium text-primary">{friend.name}</div>
              <div className="text-sm text-text-secondary">
                {friend.status === 'online' ? 'Available now' : 
                 friend.status === 'busy' ? 'Busy' : 
                 `Last seen ${friend.lastSeen.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
              </div>
              <div className="text-xs text-text-muted">
                Usually free {friend.preferredTimes.join(', ')}
              </div>
            </div>
            
            {selectedFriend?.id === friend.id && (
              <div className="text-primary">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <button className="w-full p-3 text-center text-primary border-2 border-dashed border-primary/30 rounded-xl hover:border-primary/60 hover:bg-primary/5 transition-colors">
        <span className="text-sm">+ Add a new friend</span>
      </button>
    </div>
  );
};

export default FriendSelection;
